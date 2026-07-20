package com.zyntra.backend.dashboard;

import com.zyntra.backend.dashboard.dto.ManufacturerDashboardDto;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/manufacturer")
    @PreAuthorize("hasRole('MANUFACTURER')")
    public ManufacturerDashboardDto manufacturerDashboard(Authentication authentication) {
        return dashboardService.manufacturerDashboard(UUID.fromString(authentication.getName()));
    }
}
