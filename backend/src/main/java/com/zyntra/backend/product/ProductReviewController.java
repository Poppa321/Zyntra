package com.zyntra.backend.product;

import com.zyntra.backend.common.PageResponse;
import com.zyntra.backend.product.dto.CreateReviewRequest;
import com.zyntra.backend.product.dto.ReviewDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    public ProductReviewController(ProductReviewService productReviewService) {
        this.productReviewService = productReviewService;
    }

    @GetMapping
    public PageResponse<ReviewDto> list(
        @PathVariable UUID productId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        int clampedSize = Math.min(Math.max(size, 1), 50);
        return productReviewService.list(productId, PageRequest.of(page, clampedSize, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @PostMapping
    @PreAuthorize("hasRole('DISTRIBUTOR')")
    public ResponseEntity<ReviewDto> create(
        Authentication authentication,
        @PathVariable UUID productId,
        @Valid @RequestBody CreateReviewRequest request
    ) {
        UUID distributorId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(productReviewService.create(distributorId, productId, request));
    }
}
