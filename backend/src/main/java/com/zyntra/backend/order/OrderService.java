package com.zyntra.backend.order;

import com.zyntra.backend.common.PageResponse;
import com.zyntra.backend.common.exception.BadRequestException;
import com.zyntra.backend.common.exception.ConflictException;
import com.zyntra.backend.common.exception.ForbiddenException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.common.exception.UnprocessableEntityException;
import com.zyntra.backend.address.AddressRepository;
import com.zyntra.backend.order.dto.CreateOrderRequest;
import com.zyntra.backend.order.dto.OrderDetailDto;
import com.zyntra.backend.order.dto.OrderDto;
import com.zyntra.backend.order.dto.OrderItemRequest;
import com.zyntra.backend.messaging.DeliveryMessagingService;
import com.zyntra.backend.notification.NotificationService;
import com.zyntra.backend.notification.NotificationType;
import com.zyntra.backend.payment.PaymentRepository;
import com.zyntra.backend.product.PriceResolver;
import com.zyntra.backend.product.Product;
import com.zyntra.backend.product.ProductRepository;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Service
public class OrderService {

    // Delivery fee is variable, not a flat rate: a base handling charge, a
    // distance surcharge when the distributor is outside the manufacturer's
    // city, and a per-unit charge scaling with shipment size.
    private static final BigDecimal DELIVERY_BASE_FEE = new BigDecimal("400.00");
    private static final BigDecimal DELIVERY_CROSS_CITY_SURCHARGE = new BigDecimal("800.00");
    private static final BigDecimal DELIVERY_FEE_PER_UNIT = new BigDecimal("2.50");

    // Platform commission — deducted from the manufacturer's payout on top of
    // (not added to) what the distributor pays. Applied to subtotal only,
    // not the delivery fee, since delivery is a logistics pass-through, not
    // manufacturer revenue.
    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.05");

    private static final Set<OrderStatus> ACTIVE_STATUSES = Set.of(
        OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.IN_TRANSIT, OrderStatus.OUT_FOR_DELIVERY);
    private static final Set<OrderStatus> COMPLETED_STATUSES = Set.of(OrderStatus.DELIVERED);
    private static final Set<OrderStatus> CANCELLED_STATUSES = Set.of(OrderStatus.DECLINED, OrderStatus.CANCELLED);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final AddressRepository addressRepository;
    private final NotificationService notificationService;
    private final DeliveryMessagingService deliveryMessagingService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                         UserRepository userRepository, PaymentRepository paymentRepository,
                         AddressRepository addressRepository, NotificationService notificationService,
                         DeliveryMessagingService deliveryMessagingService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.addressRepository = addressRepository;
        this.notificationService = notificationService;
        this.deliveryMessagingService = deliveryMessagingService;
    }

    private static String partyName(User user) {
        return user.getBusinessName() != null ? user.getBusinessName() : user.getFullName();
    }

    private static BigDecimal computeDeliveryFee(User distributor, User manufacturer, int totalQuantity) {
        boolean sameCity = manufacturer.getCity() != null
            && manufacturer.getCity().equalsIgnoreCase(distributor.getCity());
        BigDecimal distanceFee = sameCity ? BigDecimal.ZERO : DELIVERY_CROSS_CITY_SURCHARGE;
        BigDecimal volumeFee = DELIVERY_FEE_PER_UNIT.multiply(BigDecimal.valueOf(totalQuantity));
        return DELIVERY_BASE_FEE.add(distanceFee).add(volumeFee).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public OrderDetailDto create(UUID distributorId, CreateOrderRequest request) {
        User distributor = userRepository.getReferenceById(distributorId);
        User manufacturer = userRepository.findById(request.manufacturerId()).orElseThrow(NotFoundException::new);

        Order order = new Order();
        order.setOrderNumber("ZYN-" + orderRepository.nextOrderNumber());
        order.setDistributor(distributor);
        order.setManufacturer(manufacturer);
        order.setStatus(OrderStatus.PENDING);
        order.setDeliveryAddress(request.deliveryAddress());

        BigDecimal subtotal = BigDecimal.ZERO;
        int totalQuantity = 0;
        for (OrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId()).orElseThrow(NotFoundException::new);

            if (!product.getManufacturer().getId().equals(request.manufacturerId())) {
                throw new BadRequestException("PRODUCTS_NOT_FROM_MANUFACTURER",
                    "All items must belong to the specified manufacturer");
            }
            if (itemRequest.quantity() < product.getMoq()) {
                throw new UnprocessableEntityException("MOQ_NOT_MET",
                    "Quantity for " + product.getName() + " is below the minimum order quantity of " + product.getMoq());
            }
            if (itemRequest.quantity() > product.getStockQty()) {
                throw new BadRequestException("INSUFFICIENT_STOCK",
                    "Insufficient stock for " + product.getName());
            }

            BigDecimal unitPrice = PriceResolver.resolveUnitPrice(product, itemRequest.quantity());
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.quantity()));
            subtotal = subtotal.add(lineTotal);
            totalQuantity += itemRequest.quantity();

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setUnitPrice(unitPrice);
            item.setQuantity(itemRequest.quantity());
            item.setLineTotal(lineTotal);
            order.getItems().add(item);
        }

        BigDecimal deliveryFee = computeDeliveryFee(distributor, manufacturer, totalQuantity);

        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setPlatformFeeAmount(subtotal.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP));
        order.setTotal(subtotal.add(deliveryFee));
        order.appendHistory(OrderStatus.PENDING, "Order placed");

        order = orderRepository.save(order);
        notificationService.notify(manufacturer.getId(), NotificationType.ORDER,
            "New order received",
            partyName(order.getDistributor()) + " placed order #" + order.getOrderNumber() + " worth ₵" + order.getTotal().toPlainString() + ".");
        return OrderDetailDto.from(order);
    }

    /**
     * Places a single-item order on behalf of a distributor whose group-buy pool just
     * hit its target. Deliberately skips the MOQ check that {@link #create} enforces —
     * the distributor's quantity is under MOQ by design; it's the pool's aggregate that
     * met it.
     */
    @Transactional
    public OrderDetailDto createFromPool(UUID distributorId, UUID manufacturerId, UUID productId, int quantity) {
        User distributor = userRepository.getReferenceById(distributorId);
        User manufacturer = userRepository.findById(manufacturerId).orElseThrow(NotFoundException::new);
        Product product = productRepository.findById(productId).orElseThrow(NotFoundException::new);

        if (quantity > product.getStockQty()) {
            throw new BadRequestException("INSUFFICIENT_STOCK", "Insufficient stock for " + product.getName());
        }

        Order order = new Order();
        order.setOrderNumber("ZYN-" + orderRepository.nextOrderNumber());
        order.setDistributor(distributor);
        order.setManufacturer(manufacturer);
        order.setStatus(OrderStatus.PENDING);
        order.setDeliveryAddress(defaultAddressLine(distributorId));

        BigDecimal unitPrice = PriceResolver.resolveUnitPrice(product, quantity);
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProductId(product.getId());
        item.setProductName(product.getName());
        item.setUnitPrice(unitPrice);
        item.setQuantity(quantity);
        item.setLineTotal(lineTotal);
        order.getItems().add(item);

        BigDecimal deliveryFee = computeDeliveryFee(distributor, manufacturer, quantity);
        order.setSubtotal(lineTotal);
        order.setDeliveryFee(deliveryFee);
        order.setPlatformFeeAmount(lineTotal.multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP));
        order.setTotal(lineTotal.add(deliveryFee));
        order.appendHistory(OrderStatus.PENDING, "Order placed from group buy pool");

        order = orderRepository.save(order);
        notificationService.notify(manufacturer.getId(), NotificationType.ORDER,
            "New order received",
            partyName(order.getDistributor()) + " placed order #" + order.getOrderNumber() + " worth ₵" + order.getTotal().toPlainString() + " (group buy).");
        return OrderDetailDto.from(order);
    }

    private String defaultAddressLine(UUID distributorId) {
        return addressRepository.findByUserIdAndDefaultAddressTrue(distributorId).stream()
            .findFirst()
            .map(address -> address.getLine1() + ", " + address.getCity())
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderDto> list(UUID userId, String group, Pageable pageable) {
        Set<OrderStatus> statuses = switch (group == null ? "active" : group) {
            case "completed" -> COMPLETED_STATUSES;
            case "cancelled" -> CANCELLED_STATUSES;
            default -> ACTIVE_STATUSES;
        };
        Page<Order> page = orderRepository.findForUser(userId, statuses, pageable);
        return PageResponse.from(page.map(OrderDto::from));
    }

    @Transactional(readOnly = true)
    public OrderDetailDto detail(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId).orElseThrow(NotFoundException::new);
        requireParty(order, userId);
        var payment = paymentRepository.findByOrderId(orderId).orElse(null);
        String paymentStatus = payment != null ? payment.getStatus().name() : null;
        boolean escrowReleased = payment != null && payment.isEscrowReleased();
        return OrderDetailDto.from(order, paymentStatus, escrowReleased);
    }

    @Transactional
    public OrderDetailDto accept(UUID orderId, UUID manufacturerId) {
        Order order = orderRepository.findByIdAndManufacturerId(orderId, manufacturerId).orElseThrow(NotFoundException::new);
        order.transitionTo(OrderStatus.ACCEPTED);

        int maxLeadDays = 0;
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProductId()).orElseThrow(NotFoundException::new);
            if (product.getStockQty() < item.getQuantity()) {
                throw new ConflictException("INSUFFICIENT_STOCK", "Insufficient stock for " + product.getName());
            }
            product.setStockQty(product.getStockQty() - item.getQuantity());
            maxLeadDays = Math.max(maxLeadDays, product.getLeadTimeDaysMax());

            if (product.getStockQty() <= product.getLowStockThreshold()) {
                notificationService.notify(manufacturerId, NotificationType.INVENTORY,
                    "Low stock alert",
                    product.getName() + " is down to " + product.getStockQty() + " units — restock soon to avoid missed orders.");
            }
        }

        order.setEta(Instant.now().plus(Duration.ofDays(maxLeadDays)));
        order.appendHistory(OrderStatus.ACCEPTED, "Accepted by manufacturer");
        notificationService.notify(order.getDistributor().getId(), NotificationType.ORDER,
            "Order #" + order.getOrderNumber() + " accepted",
            partyName(order.getManufacturer()) + " accepted your order. Estimated delivery in " + maxLeadDays + " days.");
        return OrderDetailDto.from(order);
    }

    @Transactional
    public OrderDetailDto decline(UUID orderId, UUID manufacturerId, String reason) {
        Order order = orderRepository.findByIdAndManufacturerId(orderId, manufacturerId).orElseThrow(NotFoundException::new);
        order.transitionTo(OrderStatus.DECLINED);
        order.appendHistory(OrderStatus.DECLINED, reason);
        notificationService.notify(order.getDistributor().getId(), NotificationType.ORDER,
            "Order #" + order.getOrderNumber() + " declined",
            partyName(order.getManufacturer()) + " declined your order: " + reason);
        return OrderDetailDto.from(order);
    }

    @Transactional
    public OrderDetailDto ship(UUID orderId, UUID manufacturerId) {
        Order order = orderRepository.findByIdAndManufacturerId(orderId, manufacturerId).orElseThrow(NotFoundException::new);
        order.transitionTo(OrderStatus.IN_TRANSIT);
        order.appendHistory(OrderStatus.IN_TRANSIT, "Packed & dispatched");
        notificationService.notify(order.getDistributor().getId(), NotificationType.ORDER,
            "Order #" + order.getOrderNumber() + " shipped",
            partyName(order.getManufacturer()) + " marked your order as shipped.");
        deliveryMessagingService.sendDeliveryUpdate(order.getDistributor().getPhone(),
            "Zyntra: Order #" + order.getOrderNumber() + " has shipped from " + partyName(order.getManufacturer()) + ".");
        return OrderDetailDto.from(order);
    }

    @Transactional
    public OrderDetailDto outForDelivery(UUID orderId, UUID manufacturerId) {
        Order order = orderRepository.findByIdAndManufacturerId(orderId, manufacturerId).orElseThrow(NotFoundException::new);
        order.transitionTo(OrderStatus.OUT_FOR_DELIVERY);
        order.appendHistory(OrderStatus.OUT_FOR_DELIVERY, "Out for delivery");
        notificationService.notify(order.getDistributor().getId(), NotificationType.ORDER,
            "Order #" + order.getOrderNumber() + " out for delivery",
            "Your order from " + partyName(order.getManufacturer()) + " is out for delivery.");
        deliveryMessagingService.sendDeliveryUpdate(order.getDistributor().getPhone(),
            "Zyntra: Order #" + order.getOrderNumber() + " is out for delivery.");
        return OrderDetailDto.from(order);
    }

    @Transactional
    public OrderDetailDto deliver(UUID orderId, UUID manufacturerId) {
        Order order = orderRepository.findByIdAndManufacturerId(orderId, manufacturerId).orElseThrow(NotFoundException::new);
        order.transitionTo(OrderStatus.DELIVERED);
        order.appendHistory(OrderStatus.DELIVERED, "Delivered");
        notificationService.notify(order.getDistributor().getId(), NotificationType.ORDER,
            "Order #" + order.getOrderNumber() + " delivered",
            "Your order from " + partyName(order.getManufacturer()) + " was delivered.");
        deliveryMessagingService.sendDeliveryUpdate(order.getDistributor().getPhone(),
            "Zyntra: Order #" + order.getOrderNumber() + " was delivered. Confirm receipt in the app to release payment.");
        return OrderDetailDto.from(order);
    }

    @Transactional
    public OrderDetailDto cancel(UUID orderId, UUID distributorId) {
        Order order = orderRepository.findByIdAndDistributorId(orderId, distributorId).orElseThrow(NotFoundException::new);
        order.transitionTo(OrderStatus.CANCELLED);
        order.appendHistory(OrderStatus.CANCELLED, "Cancelled by distributor");
        notificationService.notify(order.getManufacturer().getId(), NotificationType.ORDER,
            "Order #" + order.getOrderNumber() + " cancelled",
            partyName(order.getDistributor()) + " cancelled order #" + order.getOrderNumber() + ".");
        return OrderDetailDto.from(order);
    }

    private void requireParty(Order order, UUID userId) {
        if (!order.getDistributor().getId().equals(userId) && !order.getManufacturer().getId().equals(userId)) {
            throw new ForbiddenException("FORBIDDEN", "You are not a party to this order");
        }
    }
}
