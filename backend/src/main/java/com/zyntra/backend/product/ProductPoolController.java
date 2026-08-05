package com.zyntra.backend.product;

import com.zyntra.backend.product.dto.JoinPoolRequest;
import com.zyntra.backend.product.dto.ProductPoolDto;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products/{productId}/pool")
@PreAuthorize("hasRole('DISTRIBUTOR')")
public class ProductPoolController {

    private final ProductPoolService productPoolService;

    public ProductPoolController(ProductPoolService productPoolService) {
        this.productPoolService = productPoolService;
    }

    @GetMapping
    public ProductPoolDto get(Authentication authentication, @PathVariable UUID productId) {
        return productPoolService.get(productId, UUID.fromString(authentication.getName()));
    }

    @PostMapping("/join")
    public ProductPoolDto join(Authentication authentication, @PathVariable UUID productId, @Valid @RequestBody JoinPoolRequest request) {
        return productPoolService.join(UUID.fromString(authentication.getName()), productId, request);
    }
}
