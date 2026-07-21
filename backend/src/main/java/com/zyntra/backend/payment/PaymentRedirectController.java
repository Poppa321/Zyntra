package com.zyntra.backend.payment;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

// Paystack's hosted checkout only reliably auto-navigates to http(s) callback
// URLs — a bare custom scheme (zyntra://...) passed as callback_url just sits
// on Paystack's "payment complete" screen with no redirect ever firing. This
// endpoint is the public https callback_url instead: Paystack lands here,
// and this page immediately forwards into the app via the zyntra:// scheme,
// which the OS *does* know how to hand off to a real app since it's now a
// same-tab client-side navigation rather than a server redirect from a
// third-party host. A visible link is included too, since some in-app
// browsers block script-driven navigation to unfamiliar schemes.
@RestController
public class PaymentRedirectController {

    private static final String APP_CALLBACK = "zyntra://payment/callback";

    @GetMapping("/api/payments/redirect")
    public ResponseEntity<String> redirect(HttpServletRequest request) {
        String query = request.getQueryString();
        String deepLink = query == null || query.isEmpty() ? APP_CALLBACK : APP_CALLBACK + "?" + query;
        String safeDeepLink = HtmlUtils.htmlEscape(deepLink);

        String html = """
            <!doctype html>
            <html>
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Returning to Zyntra…</title>
                <script>window.location.replace("%s");</script>
              </head>
              <body style="font-family: sans-serif; text-align: center; padding-top: 3rem;">
                <p>Payment received — returning to the app…</p>
                <p><a href="%s">Tap here if you're not redirected automatically</a></p>
              </body>
            </html>
            """.formatted(safeDeepLink, safeDeepLink);

        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            .body(html);
    }
}
