package com.zyntra.backend.payment;

import com.zyntra.backend.common.exception.ConflictException;
import com.zyntra.backend.common.exception.ForbiddenException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.order.Order;
import com.zyntra.backend.order.OrderRepository;
import com.zyntra.backend.payment.dto.InitializePaymentResponse;
import com.zyntra.backend.payment.dto.PaymentDto;
import com.zyntra.backend.payment.dto.PaystackInitializeResponse;
import com.zyntra.backend.payment.dto.PaystackVerifyResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaystackClient paystackClient;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository, PaystackClient paystackClient) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.paystackClient = paystackClient;
    }

    @Transactional
    public InitializePaymentResponse initialize(UUID distributorId, UUID orderId) {
        Order order = orderRepository.findByIdAndDistributorId(orderId, distributorId).orElseThrow(NotFoundException::new);

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (payment != null && payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new ConflictException("ORDER_ALREADY_PAID", "This order has already been paid for");
        }

        long amountKobo = order.getTotal().multiply(BigDecimal.valueOf(100)).longValueExact();
        String reference = "ZYNPAY-" + order.getOrderNumber() + "-" + Instant.now().getEpochSecond();

        PaystackInitializeResponse.Data data = paystackClient.initialize(
            order.getDistributor().getEmail(), amountKobo, reference);

        if (payment == null) {
            payment = new Payment();
            payment.setOrder(order);
        }
        payment.setReference(reference);
        payment.setAmountKobo(amountKobo);
        payment.setStatus(PaymentStatus.INITIALIZED);
        payment.setAuthorizationUrl(data.authorizationUrl());
        paymentRepository.save(payment);

        return new InitializePaymentResponse(data.authorizationUrl(), reference);
    }

    @Transactional
    public PaymentDto verify(UUID distributorId, String reference) {
        Payment payment = paymentRepository.findByReference(reference).orElseThrow(NotFoundException::new);
        if (!payment.getOrder().getDistributor().getId().equals(distributorId)) {
            throw new ForbiddenException("FORBIDDEN", "You do not own this payment");
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return PaymentDto.from(payment);
        }

        PaystackVerifyResponse.Data data = paystackClient.verify(reference);

        if ("success".equalsIgnoreCase(data.status())) {
            if (data.amount() != payment.getAmountKobo()) {
                payment.setStatus(PaymentStatus.FAILED);
                throw new ConflictException("PAYMENT_AMOUNT_MISMATCH", "Paid amount does not match the order total");
            }
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(Instant.now());
            payment.getOrder().appendHistory(payment.getOrder().getStatus(), "Payment received (Paystack test)");
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        return PaymentDto.from(payment);
    }
}
