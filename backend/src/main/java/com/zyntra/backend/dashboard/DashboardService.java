package com.zyntra.backend.dashboard;

import com.zyntra.backend.dashboard.dto.ManufacturerDashboardDto;
import com.zyntra.backend.dashboard.dto.RecentOrderDto;
import com.zyntra.backend.order.OrderRepository;
import com.zyntra.backend.order.OrderStatus;
import com.zyntra.backend.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class DashboardService {

    private static final Set<OrderStatus> REVENUE_STATUSES = Set.of(
        OrderStatus.ACCEPTED, OrderStatus.IN_TRANSIT, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public DashboardService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public ManufacturerDashboardDto manufacturerDashboard(UUID manufacturerId) {
        Instant since = Instant.now().minus(Duration.ofDays(30));

        var revenue30d = orderRepository.sumRevenue(manufacturerId, REVENUE_STATUSES, since);
        long orderCount = orderRepository.countByManufacturerId(manufacturerId);
        long productCount = productRepository.countByManufacturerIdAndActiveTrue(manufacturerId);
        long lowStockCount = productRepository.countLowStock(manufacturerId);
        List<RecentOrderDto> recentOrders = orderRepository.findTop5ByManufacturerIdOrderByCreatedAtDesc(manufacturerId)
            .stream().map(RecentOrderDto::from).toList();

        return new ManufacturerDashboardDto(revenue30d, orderCount, productCount, lowStockCount, recentOrders);
    }
}
