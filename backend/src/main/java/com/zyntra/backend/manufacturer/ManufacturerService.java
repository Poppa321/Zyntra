package com.zyntra.backend.manufacturer;

import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.manufacturer.dto.TrustScoreDto;
import com.zyntra.backend.order.Order;
import com.zyntra.backend.order.OrderRepository;
import com.zyntra.backend.order.OrderStatus;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ManufacturerService {

    private static final Set<OrderStatus> SETTLED_STATUSES =
        Set.of(OrderStatus.DELIVERED, OrderStatus.DECLINED, OrderStatus.CANCELLED);

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ManufacturerService(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public TrustScoreDto trustScore(UUID manufacturerId) {
        User manufacturer = userRepository.findById(manufacturerId).orElseThrow(NotFoundException::new);
        List<Order> settled = orderRepository.findByManufacturerIdAndStatusIn(manufacturerId, SETTLED_STATUSES);

        long completed = settled.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
        long declinedOrCancelled = settled.size() - completed;

        Integer completionRate = settled.isEmpty()
            ? null
            : Math.round(100f * completed / settled.size());

        List<Order> deliveredWithEta = settled.stream()
            .filter(o -> o.getStatus() == OrderStatus.DELIVERED && o.getEta() != null)
            .toList();
        Integer onTimeRate = deliveredWithEta.isEmpty()
            ? null
            : Math.round(100f * deliveredWithEta.stream()
                .filter(o -> !o.getUpdatedAt().isAfter(o.getEta()))
                .count() / deliveredWithEta.size());

        return new TrustScoreDto(
            manufacturer.isVerified(),
            manufacturer.getCreatedAt(),
            settled.size(),
            completed,
            onTimeRate,
            completionRate
        );
    }
}
