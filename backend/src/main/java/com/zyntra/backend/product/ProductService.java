package com.zyntra.backend.product;

import com.zyntra.backend.common.PageResponse;
import com.zyntra.backend.common.exception.BadRequestException;
import com.zyntra.backend.common.exception.ForbiddenException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.product.dto.*;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductReviewRepository productReviewRepository;

    public ProductService(ProductRepository productRepository, UserRepository userRepository,
                           ProductReviewRepository productReviewRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productReviewRepository = productReviewRepository;
    }

    public PageResponse<ProductCardDto> search(String search, String category, UUID manufacturerId, Pageable pageable) {
        Page<Product> page = productRepository.search(search, category, manufacturerId, pageable);
        return PageResponse.from(page.map(ProductCardDto::from));
    }

    @Transactional(readOnly = true)
    public ProductDetailDto getDetail(UUID id) {
        Product product = productRepository.findByIdAndActiveTrue(id).orElseThrow(NotFoundException::new);
        double averageRating = productReviewRepository.averageRating(id);
        long reviewCount = productReviewRepository.countByProductId(id);
        return ProductDetailDto.from(product, averageRating, reviewCount);
    }

    @Transactional
    public ProductDetailDto create(UUID manufacturerId, ProductCreateRequest request) {
        validateTiers(request.tiers());

        User manufacturer = userRepository.getReferenceById(manufacturerId);

        Product product = new Product();
        product.setManufacturer(manufacturer);
        applyFields(product, request.name(), request.sku(), request.category(), request.description(),
            request.imageUrl(), request.baseUnitPrice(), request.unit(), request.moq(), request.stockQty(),
            request.lowStockThreshold(), request.leadTimeDaysMin(), request.leadTimeDaysMax());
        product.replaceTiers(toEntities(request.tiers()));

        product = productRepository.save(product);
        return ProductDetailDto.from(product, 0.0, 0L);
    }

    @Transactional
    public ProductDetailDto update(UUID id, UUID manufacturerId, ProductUpdateRequest request) {
        validateTiers(request.tiers());

        Product product = productRepository.findById(id).orElseThrow(NotFoundException::new);
        requireOwner(product, manufacturerId);

        applyFields(product, request.name(), request.sku(), request.category(), request.description(),
            request.imageUrl(), request.baseUnitPrice(), request.unit(), request.moq(), request.stockQty(),
            request.lowStockThreshold(), request.leadTimeDaysMin(), request.leadTimeDaysMax());
        product.replaceTiers(toEntities(request.tiers()));

        return ProductDetailDto.from(product, productReviewRepository.averageRating(id), productReviewRepository.countByProductId(id));
    }

    @Transactional
    public ProductDetailDto updateStock(UUID id, UUID manufacturerId, int stockQty) {
        Product product = productRepository.findById(id).orElseThrow(NotFoundException::new);
        requireOwner(product, manufacturerId);
        product.setStockQty(stockQty);
        return ProductDetailDto.from(product, productReviewRepository.averageRating(id), productReviewRepository.countByProductId(id));
    }

    @Transactional
    public void softDelete(UUID id, UUID manufacturerId) {
        Product product = productRepository.findById(id).orElseThrow(NotFoundException::new);
        requireOwner(product, manufacturerId);
        product.setActive(false);
    }

    public List<LowStockProductDto> lowStock(UUID manufacturerId) {
        return productRepository.findLowStock(manufacturerId).stream()
            .map(LowStockProductDto::from)
            .toList();
    }

    private void requireOwner(Product product, UUID manufacturerId) {
        if (!product.getManufacturer().getId().equals(manufacturerId)) {
            throw new ForbiddenException("NOT_OWNER", "You do not own this product");
        }
    }

    private void applyFields(Product product, String name, String sku, String category, String description,
                              String imageUrl, java.math.BigDecimal baseUnitPrice, String unit, int moq,
                              int stockQty, int lowStockThreshold, int leadTimeDaysMin, int leadTimeDaysMax) {
        product.setName(name);
        product.setSku(sku);
        product.setCategory(category);
        product.setDescription(description);
        product.setImageUrl(imageUrl);
        product.setBaseUnitPrice(baseUnitPrice);
        product.setUnit(unit);
        product.setMoq(moq);
        product.setStockQty(stockQty);
        product.setLowStockThreshold(lowStockThreshold);
        product.setLeadTimeDaysMin(leadTimeDaysMin);
        product.setLeadTimeDaysMax(leadTimeDaysMax);
    }

    private List<PriceTier> toEntities(List<PriceTierRequest> tiers) {
        if (tiers == null) {
            return List.of();
        }
        return tiers.stream()
            .map(t -> new PriceTier(t.minQty(), t.maxQty(), t.unitPrice()))
            .toList();
    }

    private void validateTiers(List<PriceTierRequest> tiers) {
        if (tiers == null || tiers.isEmpty()) {
            return;
        }
        List<PriceTierRequest> sorted = tiers.stream()
            .sorted(Comparator.comparingInt(PriceTierRequest::minQty))
            .toList();

        if (sorted.get(0).minQty() < 1) {
            throw new BadRequestException("VALIDATION_ERROR", "The first price tier must start at minQty >= 1");
        }

        for (int i = 0; i < sorted.size() - 1; i++) {
            PriceTierRequest current = sorted.get(i);
            PriceTierRequest next = sorted.get(i + 1);

            if (current.maxQty() != null && current.maxQty() < current.minQty()) {
                throw new BadRequestException("VALIDATION_ERROR", "Tier maxQty must be greater than or equal to minQty");
            }
            if (current.maxQty() == null) {
                throw new BadRequestException("VALIDATION_ERROR", "Only the last price tier may have an unbounded maxQty");
            }
            if (next.minQty() <= current.maxQty()) {
                throw new BadRequestException("VALIDATION_ERROR", "Price tiers must be ascending and non-overlapping");
            }
        }
    }
}
