package com.zyntra.backend.auth;

import com.zyntra.backend.common.exception.UnauthenticatedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Verifies a Google Identity Services ID token via Google's tokeninfo endpoint —
 * no service-account credentials needed, just checking the token Google already
 * signed. Sufficient for a mobile app that only needs "is this really a Google
 * account with this email", not a full OAuth2 authorization-code flow.
 */
@Component
public class GoogleTokenVerifier {

    private final RestClient restClient;
    private final Set<String> allowedClientIds;

    // Web, iOS, and Android each use a distinct OAuth client id, so a token's
    // "aud" claim can legitimately be any one of them depending on which
    // client the mobile app signed in with — not just the web client id.
    public GoogleTokenVerifier(
        RestClient.Builder builder,
        @Value("${zyntra.google.client-id:}") String clientIdsRaw
    ) {
        this.restClient = builder.baseUrl("https://oauth2.googleapis.com").build();
        this.allowedClientIds = Arrays.stream(clientIdsRaw.split(","))
            .map(String::trim)
            .filter(id -> !id.isBlank())
            .collect(Collectors.toSet());
    }

    public record GoogleIdentity(String googleId, String email, String name) {
    }

    @SuppressWarnings("unchecked")
    public GoogleIdentity verify(String idToken) {
        Map<String, Object> body;
        try {
            body = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/tokeninfo").queryParam("id_token", idToken).build())
                .retrieve()
                .body(Map.class);
        } catch (RestClientException ex) {
            throw new UnauthenticatedException("Invalid Google token");
        }

        if (body == null || body.get("sub") == null || body.get("email") == null) {
            throw new UnauthenticatedException("Invalid Google token");
        }

        if (allowedClientIds.isEmpty()) {
            throw new UnauthenticatedException("Google sign-in is not configured");
        }

        if (!allowedClientIds.contains(String.valueOf(body.get("aud")))) {
            throw new UnauthenticatedException("Google token was not issued for this app");
        }

        if (!"true".equals(String.valueOf(body.get("email_verified")))) {
            throw new UnauthenticatedException("Google account email is not verified");
        }

        return new GoogleIdentity(
            String.valueOf(body.get("sub")),
            String.valueOf(body.get("email")),
            body.get("name") != null ? String.valueOf(body.get("name")) : String.valueOf(body.get("email"))
        );
    }
}
