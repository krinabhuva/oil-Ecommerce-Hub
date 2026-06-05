import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOilContext } from "@/context/OilContext";
import { useColors } from "@/hooks/useColors";

export default function AdminLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { checkPassword } = useOilContext();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [secure, setSecure] = useState(true);
  const inputRef = useRef<TextInput>(null);

  const styles = makeStyles(colors, insets);

  const handleLogin = () => {
    Keyboard.dismiss();
    if (checkPassword(password)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setError("");
      router.replace("/admin");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.iconCircle}>
          <Feather name="lock" size={32} color={colors.primary} />
        </View>

        <Text style={styles.title}>Admin Access</Text>
        <Text style={styles.subtitle}>Enter the shopkeeper password to manage prices</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Enter password"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry={secure}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (error) setError("");
            }}
            onSubmitEditing={handleLogin}
            returnKeyType="done"
            autoFocus
          />
          <Pressable
            onPress={() => setSecure((s) => !s)}
            style={styles.eyeBtn}
            hitSlop={8}
          >
            <Feather
              name={secure ? "eye" : "eye-off"}
              size={18}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
          onPress={handleLogin}
        >
          <Feather name="unlock" size={18} color="#FFF" />
          <Text style={styles.loginBtnText}>Login</Text>
        </Pressable>

      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(
  colors: ReturnType<typeof useColors>,
  insets: ReturnType<typeof useSafeAreaInsets>
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingBottom: insets.bottom + 32,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 20,
    },
    inputWrapper: {
      width: "100%",
      position: "relative",
      marginBottom: 8,
    },
    input: {
      width: "100%",
      height: 52,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingRight: 48,
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: colors.text,
      backgroundColor: colors.card,
    },
    inputError: {
      borderColor: colors.destructive,
    },
    eyeBtn: {
      position: "absolute",
      right: 14,
      top: 0,
      bottom: 0,
      justifyContent: "center",
    },
    errorText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.destructive,
      alignSelf: "flex-start",
      marginBottom: 16,
      marginTop: 4,
    },
    loginBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      height: 52,
      borderRadius: 12,
      backgroundColor: colors.primary,
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    loginBtnPressed: {
      opacity: 0.85,
    },
    loginBtnText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    hintText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 20,
    },
  });
}
