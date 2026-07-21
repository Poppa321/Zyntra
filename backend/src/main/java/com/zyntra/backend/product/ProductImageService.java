package com.zyntra.backend.product;

import com.zyntra.backend.common.exception.BadRequestException;
import com.zyntra.backend.common.exception.ForbiddenException;
import com.zyntra.backend.common.exception.NotFoundException;
import com.zyntra.backend.product.dto.ProductDetailDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

/**
 * Stores product photos as base64 data URIs directly on the product row —
 * there's no object storage (S3/Cloudinary) wired up, so this is the
 * zero-infrastructure option: works immediately, at the cost of bloating the
 * row for large images. Revisit if product photos need to scale up.
 */
@Service
public class ProductImageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final ProductRepository productRepository;
    private final ProductReviewRepository productReviewRepository;

    public ProductImageService(ProductRepository productRepository, ProductReviewRepository productReviewRepository) {
        this.productRepository = productRepository;
        this.productReviewRepository = productReviewRepository;
    }

    @Transactional
    public ProductDetailDto upload(UUID productId, UUID manufacturerId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("EMPTY_FILE", "No image was uploaded");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("INVALID_IMAGE_TYPE", "Image must be JPEG, PNG, or WebP");
        }

        Product product = productRepository.findById(productId).orElseThrow(NotFoundException::new);
        if (!product.getManufacturer().getId().equals(manufacturerId)) {
            throw new ForbiddenException("NOT_OWNER", "You do not own this product");
        }

        String base64;
        try {
            base64 = Base64.getEncoder().encodeToString(file.getBytes());
        } catch (IOException ex) {
            throw new BadRequestException("UNREADABLE_IMAGE", "Couldn't read the uploaded image");
        }

        product.setImageUrl("data:" + contentType + ";base64," + base64);

        double averageRating = productReviewRepository.averageRating(productId);
        long reviewCount = productReviewRepository.countByProductId(productId);
        return ProductDetailDto.from(product, averageRating, reviewCount);
    }
}
