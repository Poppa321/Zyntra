package com.zyntra.backend.payment;

import com.zyntra.backend.common.exception.BadRequestException;
import com.zyntra.backend.common.exception.ConflictException;
import com.zyntra.backend.common.exception.ForbiddenException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.notification.NotificationService;
import com.zyntra.backend.order.Order;
import com.zyntra.backend.order.OrderRepository;
import com.zyntra.backend.order.OrderStatus;
import com.zyntra.backend.payment.dto.PaymentDto;
import com.zyntra.backend.payment.dto.PaystackVerifyResponse;
import com.zyntra.backend.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private PaystackClient paystackClient;
    @Mock
    private NotificationService notificationService;

    private PaymentService paymentService() {
        return new PaymentService(paymentRepository, orderRepository, paystackClient, notificationService);
    }

    private Order order(UUID distributorId, UUID manufacturerId, OrderStatus status, BigDecimal total, BigDecimal platformFee) {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setOrderNumber("ZY-1001");
        order.setStatus(status);
        order.setTotal(total);
        order.setPlatformFeeAmount(platformFee);

        User distributor = User.builder().id(distributorId).build();
        User manufacturer = User.builder().id(manufacturerId).build();
        order.setDistributor(distributor);
        order.setManufacturer(manufacturer);
        return order;
    }

    private Payment payment(Order order, PaymentStatus status, long amountKobo, boolean escrowReleased) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setReference("ZYNPAY-1001-1");
        payment.setAmountKobo(amountKobo);
        payment.setStatus(status);
        payment.setEscrowReleased(escrowReleased);
        return payment;
    }

    @Test
    void releaseEscrow_orderNotDelivered_throwsBadRequest() {
        UUID distributorId = UUID.randomUUID();
        Order order = order(distributorId, UUID.randomUUID(), OrderStatus.IN_TRANSIT, BigDecimal.valueOf(100), BigDecimal.ZERO);
        when(orderRepository.findByIdAndDistributorId(order.getId(), distributorId)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> paymentService().releaseEscrow(distributorId, order.getId()))
            .isInstanceOf(BadRequestException.class)
            .satisfies(ex -> assertThat(((BadRequestException) ex).getCode()).isEqualTo("ORDER_NOT_DELIVERED"));

        verifyNoInteractions(paymentRepository, notificationService);
    }

    @Test
    void releaseEscrow_paymentNotSettled_throwsBadRequest() {
        UUID distributorId = UUID.randomUUID();
        Order order = order(distributorId, UUID.randomUUID(), OrderStatus.DELIVERED, BigDecimal.valueOf(100), BigDecimal.ZERO);
        Payment payment = payment(order, PaymentStatus.FAILED, 10_000, false);

        when(orderRepository.findByIdAndDistributorId(order.getId(), distributorId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(order.getId())).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService().releaseEscrow(distributorId, order.getId()))
            .isInstanceOf(BadRequestException.class)
            .satisfies(ex -> assertThat(((BadRequestException) ex).getCode()).isEqualTo("PAYMENT_NOT_SETTLED"));

        verifyNoInteractions(notificationService);
    }

    @Test
    void releaseEscrow_alreadyReleased_isIdempotent_andDoesNotNotifyAgain() {
        UUID distributorId = UUID.randomUUID();
        Order order = order(distributorId, UUID.randomUUID(), OrderStatus.DELIVERED, BigDecimal.valueOf(100), BigDecimal.ZERO);
        Payment payment = payment(order, PaymentStatus.SUCCESS, 10_000, true);

        when(orderRepository.findByIdAndDistributorId(order.getId(), distributorId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(order.getId())).thenReturn(Optional.of(payment));

        PaymentDto result = paymentService().releaseEscrow(distributorId, order.getId());

        assertThat(result.escrowReleased()).isTrue();
        verifyNoInteractions(notificationService);
    }

    @Test
    void releaseEscrow_success_marksReleased_andNotifiesManufacturer() {
        UUID distributorId = UUID.randomUUID();
        UUID manufacturerId = UUID.randomUUID();
        Order order = order(distributorId, manufacturerId, OrderStatus.DELIVERED, BigDecimal.valueOf(100), BigDecimal.valueOf(10));
        Payment payment = payment(order, PaymentStatus.SUCCESS, 10_000, false);

        when(orderRepository.findByIdAndDistributorId(order.getId(), distributorId)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(order.getId())).thenReturn(Optional.of(payment));

        PaymentDto result = paymentService().releaseEscrow(distributorId, order.getId());

        assertThat(result.escrowReleased()).isTrue();
        assertThat(payment.getEscrowReleasedAt()).isNotNull();
        verify(notificationService).notify(eq(manufacturerId), any(), anyString(), anyString());
    }

    @Test
    void releaseEscrow_orderNotFoundOrNotOwned_throwsNotFound() {
        UUID distributorId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        when(orderRepository.findByIdAndDistributorId(orderId, distributorId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService().releaseEscrow(distributorId, orderId))
            .isInstanceOf(NotFoundException.class);
    }

    @Test
    void verify_amountMismatch_marksFailed_andThrowsConflict() {
        UUID distributorId = UUID.randomUUID();
        Order order = order(distributorId, UUID.randomUUID(), OrderStatus.PENDING, BigDecimal.valueOf(100), BigDecimal.ZERO);
        Payment payment = payment(order, PaymentStatus.INITIALIZED, 10_000, false);

        when(paymentRepository.findByReference("ref-1")).thenReturn(Optional.of(payment));
        when(paystackClient.verify("ref-1")).thenReturn(new PaystackVerifyResponse.Data("ref-1", "success", 9_999L, "GHS"));

        assertThatThrownBy(() -> paymentService().verify(distributorId, "ref-1"))
            .isInstanceOf(ConflictException.class)
            .satisfies(ex -> assertThat(((ConflictException) ex).getCode()).isEqualTo("PAYMENT_AMOUNT_MISMATCH"));

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    @Test
    void verify_notOwner_throwsForbidden() {
        Order order = order(UUID.randomUUID(), UUID.randomUUID(), OrderStatus.PENDING, BigDecimal.valueOf(100), BigDecimal.ZERO);
        Payment payment = payment(order, PaymentStatus.INITIALIZED, 10_000, false);
        when(paymentRepository.findByReference("ref-1")).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService().verify(UUID.randomUUID(), "ref-1"))
            .isInstanceOf(ForbiddenException.class);
    }
}
