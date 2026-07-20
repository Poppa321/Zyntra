package com.zyntra.backend.payment;

import com.zyntra.backend.payment.dto.InitializePaymentRequest;
import com.zyntra.backend.payment.dto.InitializePaymentResponse;
import com.zyntra.backend.payment.dto.PaymentDto;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@PreAuthorize("hasRole('DISTRIBUTOR')")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/initialize")
    public InitializePaymentResponse initialize(Authentication authentication, @Valid @RequestBody InitializePaymentRequest request) {
        UUID distributorId = UUID.fromString(authentication.getName());
        return paymentService.initialize(distributorId, request.orderId());
    }

    @GetMapping("/verify/{reference}")
    public PaymentDto verify(Authentication authentication, @PathVariable String reference) {
        UUID distributorId = UUID.fromString(authentication.getName());
        return paymentService.verify(distributorId, reference);
    }
}
