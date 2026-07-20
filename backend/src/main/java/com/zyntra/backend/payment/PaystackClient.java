package com.zyntra.backend.payment;

import com.zyntra.backend.common.exception.BadGatewayException;
import com.zyntra.backend.payment.dto.PaystackInitializeResponse;
import com.zyntra.backend.payment.dto.PaystackVerifyResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Component
public class PaystackClient {

    private final RestClient restClient;
    private final String callbackUrl;

    public PaystackClient(
        RestClient.Builder builder,
        @Value("${zyntra.paystack.base-url}") String baseUrl,
        @Value("${zyntra.paystack.secret-key}") String secretKey,
        @Value("${zyntra.paystack.callback-url}") String callbackUrl
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(10_000);
        requestFactory.setReadTimeout(10_000);

        this.restClient = builder
            .baseUrl(baseUrl)
            .requestFactory(requestFactory)
            .defaultHeader("Authorization", "Bearer " + secretKey)
            .build();
        this.callbackUrl = callbackUrl;
    }

    public PaystackInitializeResponse.Data initialize(String email, long amountKobo, String reference) {
        try {
            PaystackInitializeResponse response = restClient.post()
                .uri("/transaction/initialize")
                .body(Map.of(
                    "email", email,
                    "amount", amountKobo,
                    "currency", "GHS",
                    "reference", reference,
                    "callback_url", callbackUrl
                ))
                .retrieve()
                .body(PaystackInitializeResponse.class);

            if (response == null || response.data() == null) {
                throw new BadGatewayException("PAYSTACK_UNAVAILABLE", "Paystack returned an empty response");
            }
            return response.data();
        } catch (RestClientException ex) {
            throw new BadGatewayException("PAYSTACK_UNAVAILABLE", "Paystack initialize request failed");
        }
    }

    public PaystackVerifyResponse.Data verify(String reference) {
        try {
            PaystackVerifyResponse response = restClient.get()
                .uri("/transaction/verify/{reference}", reference)
                .retrieve()
                .body(PaystackVerifyResponse.class);

            if (response == null || response.data() == null) {
                throw new BadGatewayException("PAYSTACK_UNAVAILABLE", "Paystack returned an empty response");
            }
            return response.data();
        } catch (RestClientException ex) {
            throw new BadGatewayException("PAYSTACK_UNAVAILABLE", "Paystack verify request failed");
        }
    }
}
