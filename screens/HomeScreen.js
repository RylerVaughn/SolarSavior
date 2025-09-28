import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>WayFinder</Text>
        <Text style={styles.subtitle}>Your business at a glance</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Leads" value="24" icon="people-outline" />
        <StatCard label="Jobs Scheduled" value="12" icon="calendar-outline" />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Revenue" value="$3.2k" icon="cash-outline" />
        <StatCard label="Active Clients" value="18" icon="briefcase-outline" />
      </View>

      {/* Dashboard Menu */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        <DashboardCard icon="map-outline" label="Map" />
        <DashboardCard icon="navigate-outline" label="Routes" />
        <DashboardCard icon="document-text-outline" label="Quotes" />
        <DashboardCard icon="settings-outline" label="Settings" />
      </View>
    </ScrollView>
  );
}

function DashboardCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={26} color="#007BFF" />
      <Text style={styles.cardText}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color="#007BFF" style={{ marginBottom: 6 }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // clean white
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 50,
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
    elevation: 2, // Android
    shadowColor: "#000", // iOS
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 25,
    marginBottom: 12,
    color: "#111",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

