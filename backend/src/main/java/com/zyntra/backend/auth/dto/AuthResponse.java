package com.zyntra.backend.auth.dto;

public record AuthResponse(
    String token,
    UserDto user
) {}
