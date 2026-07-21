package com.zyntra.backend.product;

import com.zyntra.backend.common.exception.ForbiddenException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.payment.PaymentStatus;
import com.zyntra.backend.payment.PaystackClient;
import com.zyntra.backend.payment.dto.PaystackInitializeResponse;
import com.zyntra.backend.payment.dto.PaystackVerifyResponse;
import com.zyntra.backend.product.dto.BoostProductResponse;
import com.zyntra.backend.product.dto.BoostStatusDto;
import com.zyntra.backend.user.User;
import com.zyntra.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Monetization: manufacturers pay a flat fee (Paystack, same rail already used
 * for order payments) to feature one product for 7 days. Featured products get
 * a "Featured" badge and lead the browse/discover carousels client-side.
 */
@Service
public class ProductBoostService {

    private static final long BOOST_PRICE_KOBO = 5_000_00; // ₵50.00
    private static final Duration BOOST_DURATION = Duration.of(7, ChronoUnit.DAYS);

    private final ProductRepository productRepository;
    private final ProductBoostRepository boostRepository;
    private final UserRepository userRepository;
    private final PaystackClient paystackClient;

    public ProductBoostService(ProductRepository productRepository, ProductBoostRepository boostRepository,
                                UserRepository userRepository, PaystackClient paystackClient) {
        this.productRepository = productRepository;
        this.boostRepository = boostRepository;
        this.userRepository = userRepository;
        this.paystackClient = paystackClient;
    }

    @Transactional
    public BoostProductResponse initialize(UUID manufacturerId, UUID productId) {
        Product product = productRepository.findById(productId).orElseThrow(NotFoundException::new);
        if (!product.getManufacturer().getId().equals(manufacturerId)) {
            throw new ForbiddenException("NOT_OWNER", "You do not own this product");
        }
        User manufacturer = userRepository.getReferenceById(manufacturerId);

        String reference = "ZYNBOOST-" + productId + "-" + Instant.now().getEpochSecond();
        PaystackInitializeResponse.Data data = paystackClient.initialize(product.getManufacturer().getEmail(), BOOST_PRICE_KOBO, reference);

        ProductBoost boost = new ProductBoost();
        boost.setProduct(product);
        boost.setManufacturer(manufacturer);
        boost.setReference(reference);
        boost.setAmountKobo(BOOST_PRICE_KOBO);
        boost.setStatus(PaymentStatus.INITIALIZED);
        boostRepository.save(boost);

        return new BoostProductResponse(data.authorizationUrl(), reference);
    }

    @Transactional
    public BoostStatusDto verify(UUID manufacturerId, String reference) {
        ProductBoost boost = boostRepository.findByReference(reference).orElseThrow(NotFoundException::new);
        if (!boost.getManufacturer().getId().equals(manufacturerId)) {
            throw new ForbiddenException("FORBIDDEN", "You do not own this boost");
        }

        if (boost.getStatus() == PaymentStatus.SUCCESS) {
            return new BoostStatusDto(PaymentStatus.SUCCESS, boost.getProduct().getFeaturedUntil());
        }

        PaystackVerifyResponse.Data data = paystackClient.verify(reference);

        if ("success".equalsIgnoreCase(data.status()) && data.amount() == boost.getAmountKobo()) {
            boost.setStatus(PaymentStatus.SUCCESS);
            Product product = boost.getProduct();
            Instant base = product.getFeaturedUntil() != null && product.getFeaturedUntil().isAfter(Instant.now())
                ? product.getFeaturedUntil()
                : Instant.now();
            product.setFeaturedUntil(base.plus(BOOST_DURATION));
            return new BoostStatusDto(PaymentStatus.SUCCESS, product.getFeaturedUntil());
        }

        boost.setStatus(PaymentStatus.FAILED);
        return new BoostStatusDto(PaymentStatus.FAILED, null);
    }
}
