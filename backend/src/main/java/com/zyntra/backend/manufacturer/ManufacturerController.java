package com.zyntra.backend.manufacturer;

import com.zyntra.backend.manufacturer.dto.TrustScoreDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/manufacturers")
public class ManufacturerController {

    private final ManufacturerService manufacturerService;

    public ManufacturerController(ManufacturerService manufacturerService) {
        this.manufacturerService = manufacturerService;
    }

    // Public (like /api/products/**) — the trust score is meant to be seen by
    // any distributor evaluating a manufacturer before ordering, not gated behind
    // an existing relationship with them.
    @GetMapping("/{id}/trust-score")
    public TrustScoreDto trustScore(@PathVariable UUID id) {
        return manufacturerService.trustScore(id);
    }
}
