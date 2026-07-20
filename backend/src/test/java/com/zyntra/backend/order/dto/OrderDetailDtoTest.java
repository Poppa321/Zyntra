package com.zyntra.backend.order.dto;

import com.zyntra.backend.order.Order;
import com.zyntra.backend.order.OrderStatus;
import com.zyntra.backend.user.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderDetailDtoTest {

    @Test
    void from_handlesMissingRelationsAndCollections() {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setOrderNumber("ZYN-1");
        order.setStatus(OrderStatus.PENDING);
        order.setSubtotal(BigDecimal.ONE);
        order.setDeliveryFee(BigDecimal.ZERO);
        order.setTotal(BigDecimal.ONE);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());

        OrderDetailDto dto = OrderDetailDto.from(order);

        assertNotNull(dto);
        assertNotNull(dto.items());
        assertTrue(dto.items().isEmpty());
        assertNotNull(dto.statusHistory());
        assertTrue(dto.statusHistory().isEmpty());
        assertNotNull(dto.order());
        assertNull(dto.order().distributorId());
        assertNull(dto.order().manufacturerId());
    }

    @Test
    void from_keepsNullCollectionsAndRelationsSafe() {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setOrderNumber("ZYN-2");
        order.setStatus(OrderStatus.CANCELLED);
        order.setSubtotal(BigDecimal.TEN);
        order.setDeliveryFee(BigDecimal.ONE);
        order.setTotal(BigDecimal.TEN.add(BigDecimal.ONE));
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());

        User distributor = new User();
        distributor.setId(UUID.randomUUID());
        distributor.setBusinessName("Dist Co");
        order.setDistributor(distributor);

        User manufacturer = new User();
        manufacturer.setId(UUID.randomUUID());
        manufacturer.setBusinessName("Mfr Co");
        order.setManufacturer(manufacturer);

        OrderDetailDto dto = OrderDetailDto.from(order, "PAID");

        assertTrue(dto.items().isEmpty());
        assertTrue(dto.statusHistory().isEmpty());
        assertEquals("PAID", dto.order().paymentStatus());
        assertEquals(distributor.getId(), dto.order().distributorId());
        assertEquals(manufacturer.getId(), dto.order().manufacturerId());
    }
}
