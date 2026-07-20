package com.zyntra.backend.address.dto;

import com.zyntra.backend.address.Address;
import com.zyntra.backend.address.AddressLabel;

import java.util.UUID;

public record AddressDto(
    UUID id,
    AddressLabel label,
    String line1,
    String city,
    String region,
    String phone,
    boolean isDefault
) {
    public static AddressDto from(Address address) {
        return new AddressDto(
            address.getId(),
            address.getLabel(),
            address.getLine1(),
            address.getCity(),
            address.getRegion(),
            address.getPhone(),
            address.isDefaultAddress()
        );
    }
}
