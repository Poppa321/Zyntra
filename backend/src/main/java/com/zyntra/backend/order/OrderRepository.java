package com.zyntra.backend.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByIdAndManufacturerId(UUID id, UUID manufacturerId);

    Optional<Order> findByIdAndDistributorId(UUID id, UUID distributorId);

    @Query("""
        SELECT o FROM Order o
        WHERE (o.distributor.id = :userId OR o.manufacturer.id = :userId)
          AND o.status IN :statuses
        """)
    Page<Order> findForUser(@Param("userId") UUID userId, @Param("statuses") Collection<OrderStatus> statuses, Pageable pageable);

    @Query(value = "SELECT nextval('order_number_seq')", nativeQuery = true)
    long nextOrderNumber();

    @Query("""
        SELECT COALESCE(SUM(o.total), 0) FROM Order o
        WHERE o.manufacturer.id = :manufacturerId
          AND o.status IN :statuses
          AND o.createdAt >= :since
        """)
    java.math.BigDecimal sumRevenue(@Param("manufacturerId") UUID manufacturerId, @Param("statuses") Collection<OrderStatus> statuses, @Param("since") Instant since);

    long countByManufacturerId(UUID manufacturerId);

    List<Order> findTop5ByManufacturerIdOrderByCreatedAtDesc(UUID manufacturerId);
}
