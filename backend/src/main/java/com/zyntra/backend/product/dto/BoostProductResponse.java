package com.zyntra.backend.product.dto;

public record BoostProductResponse(
    String authorizationUrl,
    String reference
) {
}
