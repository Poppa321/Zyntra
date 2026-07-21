package com.zyntra.backend.product;

import com.zyntra.backend.common.PageResponse;
import com.zyntra.backend.common.exception.ConflictException;
import com.zyntra.backend.common.exception.ForbiddenException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.order.Order;
import com.zyntra.backend.order.OrderRepository;
import com.zyntra.backend.product.dto.CreateReviewRequest;
import com.zyntra.backend.product.dto.ReviewDto;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ProductReviewService(ProductReviewRepository reviewRepository, ProductRepository productRepository,
                                 OrderRepository orderRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewDto> list(UUID productId, Pageable pageable) {
        Page<ProductReview> page = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        return PageResponse.from(page.map(ReviewDto::from));
    }

    @Transactional
    public ReviewDto create(UUID distributorId, UUID productId, CreateReviewRequest request) {
        Product product = productRepository.findByIdAndActiveTrue(productId).orElseThrow(NotFoundException::new);

        if (reviewRepository.existsByProductIdAndDistributorId(productId, distributorId)) {
            throw new ConflictException("ALREADY_REVIEWED", "You have already reviewed this product");
        }

        List<Order> deliveredOrders = orderRepository.findDeliveredOrdersForProduct(distributorId, productId);
        if (deliveredOrders.isEmpty()) {
            throw new ForbiddenException("PURCHASE_REQUIRED", "You can only review products from a delivered order");
        }

        User distributor = userRepository.getReferenceById(distributorId);

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setDistributor(distributor);
        review.setOrder(deliveredOrders.get(0));
        review.setRating(request.rating());
        review.setComment(request.comment());

        review = reviewRepository.save(review);
        return ReviewDto.from(review);
    }
}
