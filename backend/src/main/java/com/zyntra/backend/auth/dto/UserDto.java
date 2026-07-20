package com.zyntra.backend.auth.dto;

import com.zyntra.backend.user.Role;
import com.zyntra.backend.user.User;

import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String fullName,
    String businessName,
    Role role,
    String phone,
    String city,
    String description,
    boolean verified,
    boolean darkMode
) {
    public static UserDto from(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getBusinessName(),
            user.getRole(),
            user.getPhone(),
            user.getCity(),
            user.getDescription(),
            user.isVerified(),
            user.isDarkMode()
        );
    }
}
