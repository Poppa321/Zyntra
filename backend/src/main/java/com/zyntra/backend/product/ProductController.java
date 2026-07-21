package com.zyntra.backend.product;

import com.zyntra.backend.common.PageResponse;
import com.zyntra.backend.product.dto.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;

    public ProductController(ProductService productService, ProductImageService productImageService) {
        this.productService = productService;
        this.productImageService = productImageService;
    }

    @GetMapping
    public PageResponse<ProductCardDto> search(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) UUID manufacturerId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        int clampedSize = Math.min(Math.max(size, 1), 50);
        return productService.search(search, category, manufacturerId, PageRequest.of(page, clampedSize, parseSort(sort)));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public List<LowStockProductDto> lowStock(Authentication authentication) {
        return productService.lowStock(UUID.fromString(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ProductDetailDto detail(@PathVariable UUID id) {
        return productService.getDetail(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('MANUFACTURER')")
    public ResponseEntity<ProductDetailDto> create(Authentication authentication, @Valid @RequestBody ProductCreateRequest request) {
        UUID manufacturerId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(manufacturerId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public ProductDetailDto update(Authentication authentication, @PathVariable UUID id, @Valid @RequestBody ProductUpdateRequest request) {
        UUID manufacturerId = UUID.fromString(authentication.getName());
        return productService.update(id, manufacturerId, request);
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public ProductDetailDto updateStock(Authentication authentication, @PathVariable UUID id, @Valid @RequestBody StockUpdateRequest request) {
        UUID manufacturerId = UUID.fromString(authentication.getName());
        return productService.updateStock(id, manufacturerId, request.stockQty());
    }

    @PostMapping("/{id}/photo")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public ProductDetailDto uploadPhoto(Authentication authentication, @PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        UUID manufacturerId = UUID.fromString(authentication.getName());
        return productImageService.upload(id, manufacturerId, file);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID id) {
        UUID manufacturerId = UUID.fromString(authentication.getName());
        productService.softDelete(id, manufacturerId);
        return ResponseEntity.noContent().build();
    }

    private Sort parseSort(String sort) {
        String[] parts = sort.split(",");
        String property = parts[0];
        Sort.Direction direction = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;
        return Sort.by(direction, property);
    }
}
