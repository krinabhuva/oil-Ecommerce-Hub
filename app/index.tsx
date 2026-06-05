import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOilContext } from "@/context/OilContext";
import { OIL_PRODUCTS, OilType } from "@/data/oils";
import imageMap from "@/data/imageMap";
import { useColors } from "@/hooks/useColors";

type Filter = "All" | OilType;
const FILTERS: Filter[] = ["All", "Groundnut", "Sunflower"];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { prices, lastUpdated } = useOilContext();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    if (activeFilter === "All") return OIL_PRODUCTS;
    return OIL_PRODUCTS.filter((o) => o.type === activeFilter);
  }, [activeFilter]);

  const topPad =
    Platform.OS === "web" ? 67 : insets.top;

  const styles = makeStyles(colors, topPad);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.shopName}>Shree Ram Treding</Text>
            <Text style={styles.headerDate}>{today}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/admin-login")}
            style={styles.adminBtn}
            hitSlop={12}
          >
            <Feather name="lock" size={20} color={colors.primaryForeground} />
          </Pressable>
        </View>

        {/* Filter pills + Message button row */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterPill,
                activeFilter === f && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push("/message")}
            style={styles.msgPill}
            hitSlop={8}
          >
            <Feather name="message-circle" size={14} color="#FFF" />
            <Text style={styles.msgPillText}>Message Us</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          lastUpdated ? (
            <View style={styles.updatedBadge}>
              <Feather name="clock" size={12} color={colors.mutedForeground} />
              <Text style={styles.updatedText}>
                Updated: {lastUpdated}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={<View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 16 }} />}
        renderItem={({ item }) => {
          const price = prices[item.id] ?? item.defaultPrice;
          const pricePerLtr = (price / item.weightLtr).toFixed(0);
          const isGroundnut = item.type === "Groundnut";

          return (
            <View style={styles.card}>
              <Image
                source={imageMap[item.imageKey]}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardBody}>
                <View style={[styles.typeBadge, isGroundnut ? styles.groundnutBadge : styles.sunflowerBadge]}>
                  <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>
                <Text style={styles.brandName}>{item.brand}</Text>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.weight}>
                  {item.weightKg} kg / {item.weightLtr.toFixed(2)} L
                </Text>
              </View>
              <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>Per Tin</Text>
                <Text style={styles.price}>₹{price.toLocaleString("en-IN")}</Text>
                <Text style={styles.pricePerLtr}>₹{pricePerLtr}/L</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>, topPad: number) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: topPad + 12,
      paddingHorizontal: 16,
      paddingBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    shopName: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      letterSpacing: 0.3,
    },
    headerDate: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.8)",
      marginTop: 2,
    },
    adminBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterPill: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    filterPillActive: {
      backgroundColor: "#FFFFFF",
    },
    filterText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.9)",
    },
    filterTextActive: {
      color: colors.primary,
    },
    msgPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.4)",
      marginLeft: "auto",
    },
    msgPillText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: "#FFF",
    },
    list: {
      padding: 16,
    },
    updatedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: colors.muted,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    updatedText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    separator: {
      height: 10,
    },
    card: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 14,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    cardImage: {
      width: 80,
      height: 90,
    },
    cardBody: {
      flex: 1,
      padding: 10,
      justifyContent: "center",
    },
    typeBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
      marginBottom: 4,
    },
    groundnutBadge: {
      backgroundColor: "#FEF3C7",
    },
    sunflowerBadge: {
      backgroundColor: "#FEF9C3",
    },
    typeBadgeText: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
      color: "#92400E",
    },
    brandName: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    productName: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
      marginTop: 1,
    },
    weight: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    priceBlock: {
      alignItems: "flex-end",
      justifyContent: "center",
      padding: 10,
      backgroundColor: colors.secondary,
      minWidth: 78,
    },
    priceLabel: {
      fontSize: 10,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    price: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.accent,
      marginTop: 2,
    },
    pricePerLtr: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
  });
}
