import { Alert, Platform } from "react-native";

/** Cross-platform alert — Alert.alert is a no-op on react-native-web. */
export function showAlert(title: string, message?: string) {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

/** Cross-platform confirm dialog; runs onConfirm only if the user agrees. */
export function confirmAlert(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
