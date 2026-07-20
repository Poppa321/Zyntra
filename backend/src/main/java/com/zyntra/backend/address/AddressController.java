package com.zyntra.backend.address;

import com.zyntra.backend.address.dto.AddressDto;
import com.zyntra.backend.address.dto.AddressRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public List<AddressDto> list(Authentication authentication) {
        return addressService.list(UUID.fromString(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<AddressDto> create(Authentication authentication, @Valid @RequestBody AddressRequest request) {
        AddressDto created = addressService.create(UUID.fromString(authentication.getName()), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/default")
    public AddressDto setDefault(Authentication authentication, @PathVariable UUID id) {
        return addressService.setDefault(UUID.fromString(authentication.getName()), id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID id) {
        addressService.delete(UUID.fromString(authentication.getName()), id);
        return ResponseEntity.noContent().build();
    }
}
