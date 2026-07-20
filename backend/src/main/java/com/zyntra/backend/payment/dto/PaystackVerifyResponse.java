package com.zyntra.backend.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PaystackVerifyResponse(boolean status, String message, Data data) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(String reference, String status, long amount, String currency) {}
}
