package com.zyntra.backend.order;

import com.zyntra.backend.common.PageResponse;
import com.zyntra.backend.order.dto.CreateOrderRequest;
import com.zyntra.backend.order.dto.DeclineRequest;
import com.zyntra.backend.order.dto.OrderDetailDto;
import com.zyntra.backend.order.dto.OrderDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasRole('DISTRIBUTOR')")
    public ResponseEntity<OrderDetailDto> create(Authentication authentication, @Valid @RequestBody CreateOrderRequest request) {
        UUID distributorId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(distributorId, request));
    }

    @GetMapping
    public PageResponse<OrderDto> list(
        Authentication authentication,
        @RequestParam(required = false) String group,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        int clampedSize = Math.min(Math.max(size, 1), 50);
        return orderService.list(userId, group, PageRequest.of(page, clampedSize));
    }

    @GetMapping("/{id}")
    public OrderDetailDto detail(Authentication authentication, @PathVariable UUID id) {
        UUID userId = UUID.fromString(authentication.getName());
        return orderService.detail(id, userId);
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public OrderDetailDto accept(Authentication authentication, @PathVariable UUID id) {
        return orderService.accept(id, UUID.fromString(authentication.getName()));
    }

    @PostMapping("/{id}/decline")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public OrderDetailDto decline(Authentication authentication, @PathVariable UUID id, @Valid @RequestBody DeclineRequest request) {
        return orderService.decline(id, UUID.fromString(authentication.getName()), request.reason());
    }

    @PostMapping("/{id}/ship")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public OrderDetailDto ship(Authentication authentication, @PathVariable UUID id) {
        return orderService.ship(id, UUID.fromString(authentication.getName()));
    }

    @PostMapping("/{id}/out-for-delivery")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public OrderDetailDto outForDelivery(Authentication authentication, @PathVariable UUID id) {
        return orderService.outForDelivery(id, UUID.fromString(authentication.getName()));
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public OrderDetailDto deliver(Authentication authentication, @PathVariable UUID id) {
        return orderService.deliver(id, UUID.fromString(authentication.getName()));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('DISTRIBUTOR')")
    public OrderDetailDto cancel(Authentication authentication, @PathVariable UUID id) {
        return orderService.cancel(id, UUID.fromString(authentication.getName()));
    }
}
