package com.zyntra.backend.product;

import com.zyntra.backend.product.dto.BoostProductResponse;
import com.zyntra.backend.product.dto.BoostStatusDto;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@PreAuthorize("hasRole('MANUFACTURER')")
public class ProductBoostController {

    private final ProductBoostService productBoostService;

    public ProductBoostController(ProductBoostService productBoostService) {
        this.productBoostService = productBoostService;
    }

    @PostMapping("/{id}/feature/initialize")
    public BoostProductResponse initialize(Authentication authentication, @PathVariable UUID id) {
        UUID manufacturerId = UUID.fromString(authentication.getName());
        return productBoostService.initialize(manufacturerId, id);
    }

    @GetMapping("/feature/verify/{reference}")
    public BoostStatusDto verify(Authentication authentication, @PathVariable String reference) {
        UUID manufacturerId = UUID.fromString(authentication.getName());
        return productBoostService.verify(manufacturerId, reference);
    }
}
