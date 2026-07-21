import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle, XCircle } from "phosphor-react-native";

import { getApiErrorMessage } from "@/api/client";
import { verifyPayment } from "@/api/endpoints/payments";
import { verifyBoost } from "@/api/endpoints/products";
import { Button } from "@/components/Button";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Text } from "@/components/Text";
import { type ThemeColors, useTheme, useThemeColors } from "@/theme/ThemeContext";

// Fallback landing screen for the zyntra://payment/callback deep link, shared
// by both order payments and product-boost payments (Paystack only accepts
// one callback_url per initialize call config-wide). The primary path
// (WebBrowser.openAuthSessionAsync in usePayForOrderMutation /
// useBoostProductMutation) intercepts this redirect inside the browser
// session before it ever reaches the router — this screen only renders if
// that interception didn't fire (app backgrounded/killed mid-checkout,
// inconsistent Custom Tabs behavior on some Android browsers). Paystack
// appends ?reference= (or ?trxref=) to whatever callback_url it's given, and
// the reference prefix ("ZYNPAY-" vs "ZYNBOOST-") tells us which flow to verify.
export default function PaymentCallback() {
  const { reference, trxref } = useLocalSearchParams<{ reference?: string; trxref?: string }>();
  const [state, setState] = useState<"verifying" | "success" | "error">("verifying");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isBoost, setIsBoost] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const paymentReference = reference ?? trxref;

  useEffect(() => {
    if (!paymentReference) {
      setState("error");
      setErrorMessage("No payment reference was provided.");
      return;
    }

    if (paymentReference.startsWith("ZYNBOOST-")) {
      setIsBoost(true);
      verifyBoost(paymentReference)
        .then((boost) => {
          setState(boost.status === "SUCCESS" ? "success" : "error");
          if (boost.status !== "SUCCESS") {
            setErrorMessage("This payment was not successful.");
          }
        })
        .catch((error) => {
          setState("error");
          setErrorMessage(getApiErrorMessage(error, "Couldn't verify this payment."));
        });
      return;
    }

    verifyPayment(paymentReference)
      .then((payment) => {
        setOrderId(payment.orderId);
        setState(payment.status === "SUCCESS" ? "success" : "error");
        if (payment.status !== "SUCCESS") {
          setErrorMessage("This payment was not successful.");
        }
      })
      .catch((error) => {
        setState("error");
        setErrorMessage(getApiErrorMessage(error, "Couldn't verify this payment."));
      });
  }, [paymentReference]);

  function handleContinue() {
    if (isBoost) router.replace("/manufacturer/inventory");
    else if (orderId) router.replace(`/order-tracking/${orderId}`);
    else router.replace("/");
  }

  return (
    <ScreenContainer edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.content}>
        {state === "verifying" && (
          <>
            <ActivityIndicator size="large" color={colors.navy} />
            <Text weight="semiBold" style={styles.title}>
              Confirming your payment…
            </Text>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle size={56} color={colors.success} weight="fill" />
            <Text weight="extraBold" style={styles.title}>
              {isBoost ? "Product featured" : "Payment confirmed"}
            </Text>
            <Button label={isBoost ? "Back to inventory" : "View order"} onPress={handleContinue} style={styles.button} />
          </>
        )}
        {state === "error" && (
          <>
            <XCircle size={56} color={colors.error} weight="fill" />
            <Text weight="extraBold" style={styles.title}>
              Payment not confirmed
            </Text>
            <Text weight="regular" color={colors.textMuted} style={styles.body}>
              {errorMessage}
            </Text>
            <Button label="Continue" onPress={handleContinue} style={styles.button} />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: "center",
  },
  body: {
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    marginTop: 12,
    minWidth: 180,
  },
  });
}
