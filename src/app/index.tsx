import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { checkBackendHealth } from "../services/api";

export default function HomeScreen() {
  const [status, setStatus] = useState("Not connected");

  const handleGetStarted = async () => {
    try {
      setStatus("Connecting...");

      const result = await checkBackendHealth();

      setStatus(`Backend: ${result.status}`);
    } catch (error) {
      console.error("Backend connection error:", error);
      setStatus("Backend connection failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dating App</Text>

      <Text style={styles.subtitle}>
        Your journey starts here.
      </Text>

      <Pressable
        style={styles.button}
        onPress={handleGetStarted}
      >
        <Text style={styles.buttonText}>
          Get Started
        </Text>
      </Pressable>

      <Text style={styles.status}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 17,
    color: "#666666",
    marginBottom: 32,
    textAlign: "center",
  },

  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: "#111111",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  status: {
    marginTop: 24,
    fontSize: 15,
  },
});