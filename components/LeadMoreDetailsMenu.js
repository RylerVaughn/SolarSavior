import { Text, View, StyleSheet, Animated, Image, TouchableOpacity, TextInput, Alert, Dimensions } from "react-native";
import { useState, useEffect, useRef } from "react";
import 'react-native-get-random-values';
const { width, height } = Dimensions.get("window");

export default function LeadMoreDetailsMenu({ id, leadSpecificDetails, leadSpecificDetailsSetter, deleteLead, editLeadIcon, leadTypes }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const leadSpecifics = leadSpecificDetails[id];

  const [name, setName] = useState(leadSpecifics?.name || "");
  const [phone, setPhone] = useState(leadSpecifics?.phone || "");

  // When `id` changes, reset the local state for the new lead
  useEffect(() => {
    setName(leadSpecifics?.name || "");
    setPhone(leadSpecifics?.phone || "");
  }, [id]);

  // Push local state back up to parent
  useEffect(() => {
    if (id && leadSpecificDetails) {
      leadSpecificDetailsSetter(prev => ({
        ...prev,
        [id]: { ...prev[id], name, phone },
      }));
    }
  }, [id, name, phone]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setPhone(cleaned);
  };

  return (
    <Animated.View style={[styles.detailsMenu, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.removeButtonTopRight} onPress={() => {
        Alert.alert(
          "Delete Lead?",
          "Are you sure you want to remove this lead?",
          [
            { text: "Cancel" },
            { text: "Delete", onPress: () => deleteLead(id) }
          ]
        )
      }}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Lead Details
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
    {/* Main lead icon */}
    <Image style={styles.leadIcon} source={leadTypes[leadSpecifics.icon]} />

    {/* Swap options */}
    <View style={{ flexDirection: "row", marginLeft: 15 }}>
      <TouchableOpacity
        onPress={() => editLeadIcon(id, "successful", leadSpecificDetailsSetter)}
      >
      <Image style={styles.smallIcon} source={leadTypes.successful} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => editLeadIcon(id, "unsuccessful", leadSpecificDetailsSetter)}
      >
        <Image style={styles.smallIcon} source={leadTypes.unsuccessful} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => editLeadIcon(id, "null", leadSpecificDetailsSetter)}
      >
        <Image style={styles.smallIcon} source={leadTypes.null} />
      </TouchableOpacity>
    </View>
  </View>

      <View style={{ marginTop: 20 }}>
        {/* Name input */}
        <Text style={styles.fieldLabel}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
        />

        {/* Phone input */}
        <Text style={styles.fieldLabel}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
        />

        {/* Address (read-only) */}
        <Text style={styles.fieldLabel}>Address:</Text>
        <Text style={styles.fieldValue}>
          {leadSpecifics != null ? leadSpecifics.address : "Loading..."}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  null: {},
  smallIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    marginHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  swapMapContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    padding: 5,
  },
  toggleLeadMenuContainer: {
    position: "absolute",
    top: 110,
    right: 20,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    padding: 5,
  },
  leadMenu: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 200, // height of popup
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leadMenuText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  leadMenuRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  leadIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginHorizontal: 10,
  },

  leadIconToggled: {
    borderWidth: 3,
    borderColor: "#007BFF",
    borderRadius: 30, // half of width/height → perfect circle
    padding: 5, // ensures the border doesn’t overlap the PNG
  },

  detailsMenu: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height * 0.4, // ~2/5 of screen
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    bottom: 0, // ensures it slides up from the bottom
  },

  // New field styles
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    color: "#333",
  },
  fieldValue: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  clusterContainer: {
  backgroundColor: "#007BFF",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: "#fff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 4,
},
clusterText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 14,
},
cluster: {
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    // Optional: add elevation for Android
    elevation: 5,
  },
  mapLoadingScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white", // change if you want a different background
  },
  mapLoadingScreenText: {
    marginTop: 15,
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  removeButtonTopRight: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF3B30",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

