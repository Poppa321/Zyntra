package com.zyntra.backend.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * SMS/WhatsApp fallback for delivery-tracking updates (shipped, out for
 * delivery, delivered) — order events a distributor needs to see even when
 * not actively in the app, alongside the push notification sent for every
 * notification. Not wired into every notification type: a courier-style SMS
 * for every low-stock alert or chat message would be noise, not fallback.
 *
 * Uses Twilio's plain REST API directly (no SDK dependency) so this stays as
 * lightweight as PushNotificationService. Gracefully no-ops when unconfigured
 * — same pattern as EmailService/GoogleTokenVerifier degrading rather than
 * failing when a third-party credential is absent.
 */
@Service
public class DeliveryMessagingService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryMessagingService.class);
    private static final String TWILIO_BASE_URL = "https://api.twilio.com/2010-04-01/Accounts/";

    private final RestClient restClient;
    private final String accountSid;
    private final String authToken;
    private final String smsFrom;
    private final String whatsappFrom;

    public DeliveryMessagingService(
        @Value("${zyntra.twilio.account-sid}") String accountSid,
        @Value("${zyntra.twilio.auth-token}") String authToken,
        @Value("${zyntra.twilio.sms-from}") String smsFrom,
        @Value("${zyntra.twilio.whatsapp-from}") String whatsappFrom
    ) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.smsFrom = smsFrom;
        this.whatsappFrom = whatsappFrom;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(8_000);
        requestFactory.setReadTimeout(8_000);
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
    }

    private boolean isConfigured() {
        return StringUtils.hasText(accountSid) && StringUtils.hasText(authToken);
    }

    /** Sends a delivery-tracking update over both SMS and WhatsApp (whichever channels are configured). */
    @Async
    public void sendDeliveryUpdate(String toPhone, String message) {
        if (!StringUtils.hasText(toPhone) || !isConfigured()) {
            log.debug("Skipping delivery SMS/WhatsApp — not configured or no phone on file");
            return;
        }
        if (StringUtils.hasText(smsFrom)) {
            send(smsFrom, toPhone, message);
        }
        if (StringUtils.hasText(whatsappFrom)) {
            send("whatsapp:" + whatsappFrom, "whatsapp:" + toPhone, message);
        }
    }

    private void send(String from, String to, String body) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("From", from);
        form.add("To", to);
        form.add("Body", body);

        try {
            restClient.post()
                .uri(TWILIO_BASE_URL + accountSid + "/Messages.json")
                .header(HttpHeaders.AUTHORIZATION, basicAuth())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .toBodilessEntity();
        } catch (Exception ex) {
            // Best-effort: an SMS/WhatsApp failure must never break the
            // delivery-status transition (ship/out-for-delivery/deliver) that
            // triggered it — the in-app + push notifications already landed.
            log.warn("Failed to send delivery message to {}", to, ex);
        }
    }

    private String basicAuth() {
        String credentials = accountSid + ":" + authToken;
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }
}
