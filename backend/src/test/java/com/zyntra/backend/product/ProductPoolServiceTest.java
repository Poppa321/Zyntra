package com.zyntra.backend.product;

import com.zyntra.backend.common.exception.BadRequestException;
import com.zyntra.backend.notification.NotificationService;
import com.zyntra.backend.order.OrderService;
import com.zyntra.backend.order.dto.OrderDetailDto;
import com.zyntra.backend.order.dto.OrderDto;
import com.zyntra.backend.product.dto.JoinPoolRequest;
import com.zyntra.backend.product.dto.ProductPoolDto;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductPoolServiceTest {

    @Mock
    private ProductPoolRepository poolRepository;
    @Mock
    private PoolContributionRepository contributionRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private OrderService orderService;

    private ProductPoolService service() {
        return new ProductPoolService(poolRepository, contributionRepository, productRepository,
            userRepository, notificationService, orderService);
    }

    private Product product(UUID id, int moq) {
        Product product = new Product();
        product.setId(id);
        product.setMoq(moq);
        product.setUnit("bags");
        product.setName("Palm Oil");
        product.setManufacturer(User.builder().id(UUID.randomUUID()).build());
        return product;
    }

    @Test
    void join_quantityMeetsOrExceedsMoq_throwsBadRequest() {
        UUID productId = UUID.randomUUID();
        Product product = product(productId, 100);
        when(productRepository.findByIdAndActiveTrue(productId)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> service().join(UUID.randomUUID(), productId, new JoinPoolRequest(100)))
            .isInstanceOf(BadRequestException.class)
            .satisfies(ex -> assertThat(((BadRequestException) ex).getCode()).isEqualTo("MOQ_ALREADY_MET"));

        verifyNoInteractions(poolRepository, contributionRepository);
    }

    @Test
    void join_belowTarget_createsPoolAndContribution_staysOpen() {
        UUID productId = UUID.randomUUID();
        UUID distributorId = UUID.randomUUID();
        Product product = product(productId, 100);

        when(productRepository.findByIdAndActiveTrue(productId)).thenReturn(Optional.of(product));
        when(poolRepository.findFirstByProductIdAndStatusOrderByCreatedAtDesc(productId, PoolStatus.OPEN))
            .thenReturn(Optional.empty());
        when(poolRepository.save(any(ProductPool.class))).thenAnswer(inv -> {
            ProductPool p = inv.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });
        when(userRepository.getReferenceById(distributorId)).thenReturn(User.builder().id(distributorId).build());
        when(contributionRepository.findByPoolIdAndDistributorId(any(), eq(distributorId))).thenReturn(Optional.empty());
        when(contributionRepository.findByPoolId(any())).thenAnswer(inv -> {
            PoolContribution c = new PoolContribution();
            c.setQuantity(30);
            return List.of(c);
        });

        ProductPoolDto result = service().join(distributorId, productId, new JoinPoolRequest(30));

        assertThat(result.status()).isEqualTo(PoolStatus.OPEN);
        assertThat(result.pooledQty()).isEqualTo(30);
        verifyNoInteractions(orderService);
    }

    @Test
    void join_reachesTarget_fulfillsPool_createsOrderPerContributor_andNotifiesEach() {
        UUID productId = UUID.randomUUID();
        UUID distributorId = UUID.randomUUID();
        Product product = product(productId, 50);

        ProductPool existingPool = new ProductPool();
        existingPool.setId(UUID.randomUUID());
        existingPool.setProduct(product);
        existingPool.setTargetQty(50);
        existingPool.setStatus(PoolStatus.OPEN);
        existingPool.setExpiresAt(Instant.now().plusSeconds(3600));

        when(productRepository.findByIdAndActiveTrue(productId)).thenReturn(Optional.of(product));
        when(poolRepository.findFirstByProductIdAndStatusOrderByCreatedAtDesc(productId, PoolStatus.OPEN))
            .thenReturn(Optional.of(existingPool));
        when(userRepository.getReferenceById(distributorId)).thenReturn(User.builder().id(distributorId).build());
        when(contributionRepository.findByPoolIdAndDistributorId(existingPool.getId(), distributorId)).thenReturn(Optional.empty());

        // An earlier distributor already contributed 30 — this join adds the
        // remaining 20, which crosses the 50-unit target and fulfills the pool.
        UUID earlierDistributorId = UUID.randomUUID();
        PoolContribution earlierContribution = new PoolContribution();
        earlierContribution.setPool(existingPool);
        earlierContribution.setDistributor(User.builder().id(earlierDistributorId).build());
        earlierContribution.setQuantity(30);

        PoolContribution contribution = new PoolContribution();
        contribution.setPool(existingPool);
        contribution.setDistributor(User.builder().id(distributorId).build());
        contribution.setQuantity(20);
        when(contributionRepository.findByPoolId(existingPool.getId())).thenReturn(List.of(earlierContribution, contribution));
        when(poolRepository.save(any(ProductPool.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDetailDto earlierOrder = new OrderDetailDto(
            new OrderDto(UUID.randomUUID(), "ZYN-2000", earlierDistributorId, null, product.getManufacturer().getId(), null,
                null, null, null, null, null, null, null, null, null, null, null, null, null, false),
            List.of(), List.of());
        OrderDetailDto newOrder = new OrderDetailDto(
            new OrderDto(UUID.randomUUID(), "ZYN-2001", distributorId, null, product.getManufacturer().getId(), null,
                null, null, null, null, null, null, null, null, null, null, null, null, null, false),
            List.of(), List.of());
        when(orderService.createFromPool(earlierDistributorId, product.getManufacturer().getId(), productId, 30))
            .thenReturn(earlierOrder);
        when(orderService.createFromPool(distributorId, product.getManufacturer().getId(), productId, 20))
            .thenReturn(newOrder);

        ProductPoolDto result = service().join(distributorId, productId, new JoinPoolRequest(20));

        assertThat(result.status()).isEqualTo(PoolStatus.FULFILLED);
        verify(orderService).createFromPool(earlierDistributorId, product.getManufacturer().getId(), productId, 30);
        verify(orderService).createFromPool(distributorId, product.getManufacturer().getId(), productId, 20);
        verify(notificationService).notify(eq(earlierDistributorId), any(), anyString(), anyString());
        verify(notificationService).notify(eq(distributorId), any(), anyString(), anyString());
    }

    @Test
    void get_noPoolYet_returnsZeroedDtoDescribingTarget() {
        UUID productId = UUID.randomUUID();
        Product product = product(productId, 40);
        when(productRepository.findByIdAndActiveTrue(productId)).thenReturn(Optional.of(product));
        when(poolRepository.findFirstByProductIdAndStatusOrderByCreatedAtDesc(productId, PoolStatus.OPEN))
            .thenReturn(Optional.empty());

        ProductPoolDto result = service().get(productId, UUID.randomUUID());

        assertThat(result.id()).isNull();
        assertThat(result.targetQty()).isEqualTo(40);
        assertThat(result.pooledQty()).isEqualTo(0);
        assertThat(result.status()).isEqualTo(PoolStatus.OPEN);
    }

    @Test
    void get_expiredPool_flipsToExpired_andNotifiesContributors() {
        UUID productId = UUID.randomUUID();
        UUID distributorId = UUID.randomUUID();
        Product product = product(productId, 40);

        ProductPool stalePool = new ProductPool();
        stalePool.setId(UUID.randomUUID());
        stalePool.setProduct(product);
        stalePool.setTargetQty(40);
        stalePool.setPooledQty(10);
        stalePool.setStatus(PoolStatus.OPEN);
        stalePool.setExpiresAt(Instant.now().minusSeconds(60));

        when(productRepository.findByIdAndActiveTrue(productId)).thenReturn(Optional.of(product));
        when(poolRepository.findFirstByProductIdAndStatusOrderByCreatedAtDesc(productId, PoolStatus.OPEN))
            .thenReturn(Optional.of(stalePool));
        when(poolRepository.save(any(ProductPool.class))).thenAnswer(inv -> inv.getArgument(0));

        UUID contributorId = UUID.randomUUID();
        PoolContribution contribution = new PoolContribution();
        contribution.setPool(stalePool);
        contribution.setDistributor(User.builder().id(contributorId).build());
        contribution.setQuantity(10);
        when(contributionRepository.findByPoolId(stalePool.getId())).thenReturn(List.of(contribution));
        when(contributionRepository.findByPoolIdAndDistributorId(stalePool.getId(), distributorId)).thenReturn(Optional.empty());
        when(contributionRepository.countByPoolId(stalePool.getId())).thenReturn(1);

        ProductPoolDto result = service().get(productId, distributorId);

        assertThat(result.status()).isEqualTo(PoolStatus.EXPIRED);
        verify(notificationService).notify(eq(contributorId), any(), anyString(), anyString());
    }
}
