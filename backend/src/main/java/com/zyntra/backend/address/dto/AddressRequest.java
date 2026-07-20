package com.zyntra.backend.address.dto;

import com.zyntra.backend.address.AddressLabel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddressRequest(
    @NotNull AddressLabel label,
    @NotBlank @Size(max = 200) String line1,
    @NotBlank @Size(max = 80) String city,
    @NotBlank @Size(max = 80) String region,
    @NotBlank @Size(max = 30) String phone
) {
}
