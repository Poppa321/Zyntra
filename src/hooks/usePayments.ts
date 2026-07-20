import { useMutation } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";

import * as paymentsApi from "@/api/endpoints/payments";

// Matches the backend's default zyntra.paystack.callback-url and the app's
// registered deep link scheme (app.json "scheme": "zyntra"), so Paystack's
// hosted checkout redirects straight back into the app when payment finishes.
const PAYSTACK_CALLBACK_URL = "zyntra://payment/callback";

/** Initializes a Paystack payment, opens the hosted checkout, then verifies on return. */
export function usePayForOrderMutation() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { authorizationUrl, reference } = await paymentsApi.initializePayment(orderId);

      await WebBrowser.openAuthSessionAsync(authorizationUrl, PAYSTACK_CALLBACK_URL);

      return paymentsApi.verifyPayment(reference);
    },
  });
}
