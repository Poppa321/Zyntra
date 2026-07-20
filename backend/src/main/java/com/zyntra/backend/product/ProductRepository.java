package com.zyntra.backend.product;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") UUID id);

    // The LIKE arms wrap :search in cast(... as string) — with a null bind Postgres
    // can't infer the parameter type inside lower()/concat() and errors with
    // "function lower(bytea) does not exist".
    @Query(value = """
        SELECT p FROM Product p JOIN FETCH p.manufacturer m
        WHERE p.active = true
          AND (:category IS NULL OR p.category = :category)
          AND (:manufacturerId IS NULL OR m.id = :manufacturerId)
          AND (:search IS NULL
               OR lower(p.name) LIKE lower(concat('%', cast(:search as string), '%'))
               OR lower(m.businessName) LIKE lower(concat('%', cast(:search as string), '%')))
        """,
        countQuery = """
        SELECT count(p) FROM Product p JOIN p.manufacturer m
        WHERE p.active = true
          AND (:category IS NULL OR p.category = :category)
          AND (:manufacturerId IS NULL OR m.id = :manufacturerId)
          AND (:search IS NULL
               OR lower(p.name) LIKE lower(concat('%', cast(:search as string), '%'))
               OR lower(m.businessName) LIKE lower(concat('%', cast(:search as string), '%')))
        """)
    Page<Product> search(
        @Param("search") String search,
        @Param("category") String category,
        @Param("manufacturerId") UUID manufacturerId,
        Pageable pageable
    );

    Optional<Product> findByIdAndActiveTrue(UUID id);

    Optional<Product> findByIdAndManufacturerId(UUID id, UUID manufacturerId);

    boolean existsByManufacturerIdAndSku(UUID manufacturerId, String sku);

    @Query("SELECT p FROM Product p WHERE p.manufacturer.id = :manufacturerId AND p.active = true AND p.stockQty <= p.lowStockThreshold")
    List<Product> findLowStock(@Param("manufacturerId") UUID manufacturerId);

    @Query("SELECT count(p) FROM Product p WHERE p.manufacturer.id = :manufacturerId AND p.active = true AND p.stockQty <= p.lowStockThreshold")
    long countLowStock(@Param("manufacturerId") UUID manufacturerId);

    long countByManufacturerIdAndActiveTrue(UUID manufacturerId);
}
