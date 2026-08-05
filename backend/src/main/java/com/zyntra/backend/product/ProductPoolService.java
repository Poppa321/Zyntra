package com.zyntra.backend.product;

import com.zyntra.backend.common.exception.BadRequestException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.notification.NotificationService;
import com.zyntra.backend.notification.NotificationType;
import com.zyntra.backend.order.OrderService;
import com.zyntra.backend.order.dto.OrderDetailDto;
import com.zyntra.backend.product.dto.JoinPoolRequest;
import com.zyntra.backend.product.dto.ManufacturerPoolDto;
import com.zyntra.backend.product.dto.ProductPoolDto;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ProductPoolService {

    // A pool stays open for a week from its first contribution — long enough
    // for other distributors to discover and join, short enough that a
    // manufacturer's stock commitment doesn't sit open indefinitely.
    private static final Duration POOL_WINDOW = Duration.ofDays(7);

    private final ProductPoolRepository poolRepository;
    private final PoolContributionRepository contributionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final OrderService orderService;

    public ProductPoolService(ProductPoolRepository poolRepository, PoolContributionRepository contributionRepository,
                               ProductRepository productRepository, UserRepository userRepository,
                               NotificationService notificationService, OrderService orderService) {
        this.poolRepository = poolRepository;
        this.contributionRepository = contributionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.orderService = orderService;
    }

    @Transactional
    public ProductPoolDto get(UUID productId, UUID distributorId) {
        Product product = productRepository.findByIdAndActiveTrue(productId).orElseThrow(NotFoundException::new);
        ProductPool pool = poolRepository.findFirstByProductIdAndStatusOrderByCreatedAtDesc(productId, PoolStatus.OPEN)
            .map(this::expireIfStale)
            .orElse(null);

        if (pool == null) {
            // No pool has been started yet — describe the target so the UI can
            // still show "0 of <moq> pooled" and invite the first contributor.
            return new ProductPoolDto(null, productId, product.getMoq(), 0, 0, 0, PoolStatus.OPEN, null);
        }

        int yourQuantity = contributionRepository.findByPoolIdAndDistributorId(pool.getId(), distributorId)
            .map(PoolContribution::getQuantity)
            .orElse(0);
        int contributorCount = contributionRepository.countByPoolId(pool.getId());

        return toDto(pool, contributorCount, yourQuantity);
    }

    @Transactional
    public ProductPoolDto join(UUID distributorId, UUID productId, JoinPoolRequest request) {
        Product product = productRepository.findByIdAndActiveTrue(productId).orElseThrow(NotFoundException::new);
        if (request.quantity() >= product.getMoq()) {
            throw new BadRequestException("MOQ_ALREADY_MET",
                "This quantity already meets the minimum order — order directly instead of pooling");
        }

        ProductPool pool = poolRepository.findFirstByProductIdAndStatusOrderByCreatedAtDesc(productId, PoolStatus.OPEN)
            .map(this::expireIfStale)
            .filter(existing -> existing.getStatus() == PoolStatus.OPEN)
            .orElseGet(() -> {
                ProductPool created = new ProductPool();
                created.setProduct(product);
                created.setTargetQty(product.getMoq());
                created.setExpiresAt(Instant.now().plus(POOL_WINDOW));
                return poolRepository.save(created);
            });

        User distributor = userRepository.getReferenceById(distributorId);
        PoolContribution contribution = contributionRepository.findByPoolIdAndDistributorId(pool.getId(), distributorId)
            .orElseGet(() -> {
                PoolContribution created = new PoolContribution();
                created.setPool(pool);
                created.setDistributor(distributor);
                created.setQuantity(0);
                return created;
            });
        contribution.setQuantity(contribution.getQuantity() + request.quantity());
        contributionRepository.save(contribution);

        List<PoolContribution> contributions = contributionRepository.findByPoolId(pool.getId());
        int pooledQty = contributions.stream().mapToInt(PoolContribution::getQuantity).sum();
        pool.setPooledQty(pooledQty);

        if (pooledQty >= pool.getTargetQty() && pool.getStatus() == PoolStatus.OPEN) {
            pool.setStatus(PoolStatus.FULFILLED);
            fulfillPool(pool, product, contributions);
        }
        ProductPool savedPool = poolRepository.save(pool);

        return toDto(savedPool, contributions.size(), contribution.getQuantity());
    }

    @Transactional(readOnly = true)
    public List<ManufacturerPoolDto> listForManufacturer(UUID manufacturerId) {
        return poolRepository.findByProduct_Manufacturer_IdAndStatusOrderByExpiresAtAsc(manufacturerId, PoolStatus.OPEN)
            .stream()
            .map(pool -> ManufacturerPoolDto.from(pool, contributionRepository.countByPoolId(pool.getId())))
            .toList();
    }

    /** Catches pools nobody has viewed since their deadline passed — get()/join() expire lazily on read. */
    @Scheduled(fixedRate = 60 * 60 * 1000)
    @Transactional
    void expireStalePools() {
        poolRepository.findByStatusAndExpiresAtBefore(PoolStatus.OPEN, Instant.now())
            .forEach(this::expireIfStale);
    }

    private ProductPool expireIfStale(ProductPool pool) {
        if (pool.getStatus() == PoolStatus.OPEN && pool.getExpiresAt().isBefore(Instant.now())) {
            pool.setStatus(PoolStatus.EXPIRED);
            ProductPool saved = poolRepository.save(pool);
            notifyPoolExpired(saved);
            return saved;
        }
        return pool;
    }

    private void notifyPoolExpired(ProductPool pool) {
        for (PoolContribution contribution : contributionRepository.findByPoolId(pool.getId())) {
            notificationService.notify(contribution.getDistributor().getId(), NotificationType.SYSTEM,
                "Group buy pool expired",
                "The pool for " + pool.getProduct().getName() + " expired before reaching its target.");
        }
    }

    /**
     * A filled pool places one order per contributor automatically — there's no
     * separate "confirm your share" step, since each contributor already committed
     * a quantity when they joined. {@link OrderService#createFromPool} handles
     * notifying the manufacturer per order; this only notifies distributors.
     */
    private void fulfillPool(ProductPool pool, Product product, List<PoolContribution> contributions) {
        for (PoolContribution contribution : contributions) {
            OrderDetailDto order = orderService.createFromPool(contribution.getDistributor().getId(),
                product.getManufacturer().getId(), product.getId(), contribution.getQuantity());
            notificationService.notify(contribution.getDistributor().getId(), NotificationType.SYSTEM,
                "Group buy pool filled",
                "The pool for " + product.getName() + " reached its target — order #"
                    + order.order().orderNumber() + " was placed for your " + contribution.getQuantity()
                    + " " + product.getUnit() + ".");
        }
    }

    private static ProductPoolDto toDto(ProductPool pool, int contributorCount, int yourQuantity) {
        return new ProductPoolDto(
            pool.getId(),
            pool.getProduct().getId(),
            pool.getTargetQty(),
            pool.getPooledQty(),
            contributorCount,
            yourQuantity,
            pool.getStatus(),
            pool.getExpiresAt()
        );
    }
}
