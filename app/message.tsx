import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const API_BASE =
  Platform.OS === "web"
    ? "http://localhost:3000/api"
    : `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export default function MessageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = makeStyles(colors, topPad, insets);

  const handleSend = async () => {
    if (!message.trim()) {
      setError("Please write a message before sending.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim() || undefined,
          phone: phone.trim() || undefined,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } catch (_e) {
      setError("Could not send message. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Feather name="arrow-left" size={22} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Message Shopkeeper</Text>
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={56} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Message Sent!</Text>
          <Text style={styles.successSubtitle}>
            The shopkeeper has received your message and will get back to you soon.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Back to Price Board</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Message Shopkeeper</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Feather name="message-circle" size={18} color={colors.accent} />
          <Text style={styles.infoText}>
            Send a message to the shopkeeper — ask about availability, bulk orders, or anything else.
          </Text>
        </View>

        <Text style={styles.label}>Your Name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ramesh Patel"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
          returnKeyType="next"
        />

        <Text style={styles.label}>Phone Number (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 9876543210"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          returnKeyType="next"
        />

        <Text style={styles.label}>
          Message <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Type your message here..."
          placeholderTextColor={colors.mutedForeground}
          value={message}
          onChangeText={(t) => {
            setMessage(t);
            if (error) setError("");
          }}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          returnKeyType="default"
        />
        <Text style={styles.charCount}>{message.length}/1000</Text>

        {error ? (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.85 }, sending && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          <Feather name="send" size={18} color="#FFF" />
          <Text style={styles.sendBtnText}>{sending ? "Sending..." : "Send Message"}</Text>
        </Pressable>

        <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(
  colors: ReturnType<typeof useColors>,
  topPad: number,
  insets: ReturnType<typeof import("react-native-safe-area-context").useSafeAreaInsets>
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingTop: topPad + 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    content: {
      padding: 20,
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 14,
      marginBottom: 24,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.accent,
      lineHeight: 19,
    },
    label: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
      marginBottom: 6,
    },
    required: {
      color: colors.destructive,
    },
    input: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.text,
      backgroundColor: colors.card,
      marginBottom: 16,
    },
    textArea: {
      height: 120,
      marginBottom: 4,
    },
    charCount: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
      marginBottom: 16,
    },
    errorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    errorText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.destructive,
    },
    sendBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 52,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    sendBtnDisabled: {
      opacity: 0.7,
    },
    sendBtnText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    successContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    successIcon: {
      marginBottom: 20,
    },
    successTitle: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      marginBottom: 12,
    },
    successSubtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
    doneBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 50,
      paddingHorizontal: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    doneBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#FFF",
    },
  });
}
