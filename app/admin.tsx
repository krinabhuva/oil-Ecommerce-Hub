import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOilContext } from "@/context/OilContext";
import imageMap from "@/data/imageMap";
import { OIL_PRODUCTS } from "@/data/oils";
import { useColors } from "@/hooks/useColors";

const API_BASE =
  Platform.OS === "web"
    ? "http://localhost:3000/api"
    : `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface Message {
  id: number;
  customerName: string | null;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

type Tab = "prices" | "messages";

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { prices, updatePrices, changePassword } = useOilContext();
  const [localPrices, setLocalPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("prices");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const styles = makeStyles(colors, insets, topPad);

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const oil of OIL_PRODUCTS) {
      init[oil.id] = String(prices[oil.id] ?? oil.defaultPrice);
    }
    setLocalPrices(init);
  }, [prices]);

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE}/messages`);
      if (!res.ok) throw new Error("Failed");
      const data: Message[] = await res.json();
      setMessages(data);
      setUnreadCount(data.filter((m) => !m.isRead).length);
    } catch (_e) {
      /* ignore */
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
    }
  }, [activeTab, fetchMessages]);

  const markRead = async (id: number) => {
    try {
      await fetch(`${API_BASE}/messages/${id}/read`, { method: "PATCH" });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
      );
      setUnreadCount((n) => Math.max(0, n - 1));
    } catch (_e) {}
  };

  const handleSave = async () => {
    const parsed: Record<string, number> = {};
    for (const [id, val] of Object.entries(localPrices)) {
      const num = parseInt(val, 10);
      if (isNaN(num) || num <= 0) {
        Alert.alert("Invalid Price", "All prices must be valid numbers.");
        return;
      }
      parsed[id] = num;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updatePrices(parsed);
    setSaving(false);
    Alert.alert("Saved!", "Prices updated successfully.");
  };

  const handleChangePassword = async () => {
    if (newPass.length < 4) {
      Alert.alert("Too Short", "Password must be at least 4 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    await changePassword(newPass);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNewPass("");
    setConfirmPass("");
    setShowChangePass(false);
    Alert.alert("Done", "Password changed successfully.");
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        {activeTab === "prices" && (
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save All"}</Text>
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === "prices" && styles.tabActive]}
          onPress={() => setActiveTab("prices")}
        >
          <Feather
            name="tag"
            size={15}
            color={activeTab === "prices" ? colors.primary : colors.mutedForeground}
          />
          <Text style={[styles.tabText, activeTab === "prices" && styles.tabTextActive]}>
            Prices
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "messages" && styles.tabActive]}
          onPress={() => setActiveTab("messages")}
        >
          <Feather
            name="message-circle"
            size={15}
            color={activeTab === "messages" ? colors.primary : colors.mutedForeground}
          />
          <Text style={[styles.tabText, activeTab === "messages" && styles.tabTextActive]}>
            Messages
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Prices Tab */}
      {activeTab === "prices" && (
        <FlatList
          data={OIL_PRODUCTS}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.infoCard}>
                <Feather name="info" size={14} color={colors.accent} />
                <Text style={styles.infoText}>
                  Edit the price per tin for each oil. Tap "Save All" when done.
                </Text>
              </View>

              <Pressable
                style={styles.changePwdRow}
                onPress={() => setShowChangePass((v) => !v)}
              >
                <View style={styles.changePwdLeft}>
                  <Feather name="key" size={16} color={colors.accent} />
                  <Text style={styles.changePwdLabel}>Change Password</Text>
                </View>
                <Feather
                  name={showChangePass ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </Pressable>

              {showChangePass && (
                <View style={styles.changePwdBox}>
                  <TextInput
                    style={styles.pwdInput}
                    placeholder="New password (min 4 chars)"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry
                    value={newPass}
                    onChangeText={setNewPass}
                    returnKeyType="next"
                  />
                  <TextInput
                    style={styles.pwdInput}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    returnKeyType="done"
                    onSubmitEditing={handleChangePassword}
                  />
                  <Pressable
                    style={({ pressed }) => [styles.changePwdBtn, pressed && { opacity: 0.8 }]}
                    onPress={handleChangePassword}
                  >
                    <Text style={styles.changePwdBtnText}>Update Password</Text>
                  </Pressable>
                </View>
              )}

              <Text style={styles.sectionLabel}>All Oils</Text>
            </>
          }
          ListFooterComponent={
            <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 80 }} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const isGroundnut = item.type === "Groundnut";
            return (
              <View style={styles.row}>
                <Image
                  source={imageMap[item.imageKey]}
                  style={styles.rowImage}
                  resizeMode="cover"
                />
                <View style={styles.rowInfo}>
                  <View style={[styles.typeDot, isGroundnut ? styles.groundnutDot : styles.sunflowerDot]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowBrand}>{item.brand}</Text>
                    <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.rowWeight}>{item.weightKg}kg</Text>
                  </View>
                </View>
                <View style={styles.priceInputWrap}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="numeric"
                    value={localPrices[item.id] ?? ""}
                    onChangeText={(v) =>
                      setLocalPrices((prev) => ({ ...prev, [item.id]: v }))
                    }
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    selectTextOnFocus
                  />
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loadingMessages}
              onRefresh={fetchMessages}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            !loadingMessages ? (
              <View style={styles.emptyContainer}>
                <Feather name="inbox" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtitle}>
                  Customer messages will appear here. Pull down to refresh.
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 24 }} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.msgCard, !item.isRead && styles.msgCardUnread]}
              onPress={() => !item.isRead && markRead(item.id)}
            >
              <View style={styles.msgHeader}>
                <View style={styles.msgSenderRow}>
                  <View style={styles.avatar}>
                    <Feather name="user" size={14} color={colors.mutedForeground} />
                  </View>
                  <View>
                    <Text style={styles.msgSender}>
                      {item.customerName || "Anonymous"}
                    </Text>
                    {item.phone ? (
                      <Text style={styles.msgPhone}>{item.phone}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.msgMeta}>
                  <Text style={styles.msgTime}>{formatTime(item.createdAt)}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
              </View>
              <Text style={styles.msgBody}>{item.message}</Text>
              {!item.isRead && (
                <Pressable
                  onPress={() => markRead(item.id)}
                  style={styles.markReadBtn}
                >
                  <Feather name="check" size={12} color={colors.primary} />
                  <Text style={styles.markReadText}>Mark as read</Text>
                </Pressable>
              )}
            </Pressable>
          )}
        />
      )}

      {/* Sticky Save for prices tab */}
      {activeTab === "prices" && (
        <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, Platform.OS === "web" ? 34 : 16) + 8 }]}>
          <Pressable
            style={({ pressed }) => [styles.stickyBtn, pressed && { opacity: 0.85 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Feather name="check" size={18} color="#FFF" />
            <Text style={styles.stickyBtnText}>{saving ? "Saving…" : "Save All Prices"}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function makeStyles(
  colors: ReturnType<typeof useColors>,
  insets: ReturnType<typeof useSafeAreaInsets>,
  topPad: number
) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingBottom: 14,
      gap: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 18,
      alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFF" },
    saveBtn: {
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.25)",
    },
    saveBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#FFF" },

    tabRow: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 6, paddingVertical: 12,
      borderBottomWidth: 2, borderBottomColor: "transparent",
    },
    tabActive: { borderBottomColor: colors.primary },
    tabText: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.mutedForeground },
    tabTextActive: { color: colors.primary, fontFamily: "Inter_600SemiBold" },
    badge: {
      backgroundColor: colors.destructive, borderRadius: 8,
      minWidth: 16, height: 16, alignItems: "center", justifyContent: "center",
      paddingHorizontal: 4,
    },
    badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#FFF" },

    list: { padding: 16, paddingBottom: 100 },
    infoCard: {
      flexDirection: "row", alignItems: "center", gap: 8,
      backgroundColor: colors.secondary, borderRadius: 10, padding: 12, marginBottom: 12,
    },
    infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: colors.accent, lineHeight: 18 },

    changePwdRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      backgroundColor: colors.card, borderRadius: 10, padding: 14,
      borderWidth: 1, borderColor: colors.border, marginBottom: 8,
    },
    changePwdLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    changePwdLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.text },
    changePwdBox: {
      backgroundColor: colors.card, borderRadius: 10, padding: 14,
      borderWidth: 1, borderColor: colors.border, marginBottom: 8, gap: 8,
    },
    pwdInput: {
      height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 8,
      paddingHorizontal: 12, fontSize: 14, fontFamily: "Inter_400Regular",
      color: colors.text, backgroundColor: colors.background,
    },
    changePwdBtn: {
      backgroundColor: colors.accent, borderRadius: 8, height: 40,
      alignItems: "center", justifyContent: "center", marginTop: 4,
    },
    changePwdBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFF" },
    sectionLabel: {
      fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 0.8, marginTop: 8, marginBottom: 10,
    },
    separator: { height: 8 },
    row: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.card, borderRadius: 12, overflow: "hidden",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
    },
    rowImage: { width: 60, height: 68 },
    rowInfo: { flex: 1, flexDirection: "row", alignItems: "flex-start", padding: 10, gap: 8 },
    typeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
    groundnutDot: { backgroundColor: "#D97706" },
    sunflowerDot: { backgroundColor: "#EAB308" },
    rowBrand: { fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    rowName: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.text },
    rowWeight: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    priceInputWrap: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.secondary, paddingHorizontal: 10,
      height: "100%", minWidth: 90, justifyContent: "center",
    },
    rupeeSymbol: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.accent, marginRight: 2 },
    priceInput: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.accent, minWidth: 60, textAlign: "right" },

    emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
    emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground },
    emptySubtitle: {
      fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground,
      textAlign: "center", lineHeight: 20, paddingHorizontal: 32,
    },

    msgCard: {
      backgroundColor: colors.card, borderRadius: 14, padding: 14,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
    },
    msgCardUnread: {
      borderLeftWidth: 3, borderLeftColor: colors.primary,
    },
    msgHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 },
    msgSenderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatar: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
    },
    msgSender: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.text },
    msgPhone: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    msgMeta: { alignItems: "flex-end", gap: 4 },
    msgTime: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
    msgBody: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.text, lineHeight: 21 },
    markReadBtn: {
      flexDirection: "row", alignItems: "center", gap: 4,
      marginTop: 10, alignSelf: "flex-end",
    },
    markReadText: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.primary },

    stickyFooter: {
      position: "absolute", bottom: 0, left: 0, right: 0,
      backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
      paddingHorizontal: 16, paddingTop: 10,
    },
    stickyBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      backgroundColor: colors.primary, borderRadius: 12, height: 50,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    stickyBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#FFF" },
  });
}
