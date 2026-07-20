package com.zyntra.backend.address;

import com.zyntra.backend.address.dto.AddressDto;
import com.zyntra.backend.address.dto.AddressRequest;
import com.zyntra.backend.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<AddressDto> list(UUID userId) {
        return addressRepository.findByUserIdOrderByCreatedAtAsc(userId).stream().map(AddressDto::from).toList();
    }

    @Transactional
    public AddressDto create(UUID userId, AddressRequest request) {
        Address address = new Address();
        address.setUserId(userId);
        address.setLabel(request.label());
        address.setLine1(request.line1());
        address.setCity(request.city());
        address.setRegion(request.region());
        address.setPhone(request.phone());
        address.setDefaultAddress(addressRepository.countByUserId(userId) == 0);
        return AddressDto.from(addressRepository.save(address));
    }

    @Transactional
    public AddressDto setDefault(UUID userId, UUID addressId) {
        Address target = addressRepository.findByIdAndUserId(addressId, userId).orElseThrow(NotFoundException::new);
        for (Address current : addressRepository.findByUserIdAndDefaultAddressTrue(userId)) {
            current.setDefaultAddress(false);
        }
        target.setDefaultAddress(true);
        return AddressDto.from(target);
    }

    @Transactional
    public void delete(UUID userId, UUID addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId).orElseThrow(NotFoundException::new);
        addressRepository.delete(address);
    }
}
