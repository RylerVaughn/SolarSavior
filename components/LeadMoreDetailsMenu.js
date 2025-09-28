import { 
  Text, 
  View, 
  StyleSheet, 
  Animated, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Dimensions 
} from "react-native";
import { useState, useEffect, useRef } from "react";
import 'react-native-get-random-values';

const { width, height } = Dimensions.get("window");

export default function LeadMoreDetailsMenu({ 
  id, 
  leadSpecificDetails, 
  leadSpecificDetailsSetter, 
  deleteLead, 
  editLeadIcon, 
  leadTypes 
}) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const leadSpecifics = leadSpecificDetails[id];

  const [name, setName] = useState(leadSpecifics?.name || "");
  const [phone, setPhone] = useState(leadSpecifics?.phone || "");

  useEffect(() => {
    setName(leadSpecifics?.name || "");
    setPhone(leadSpecifics?.phone || "");
  }, [id]);

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
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setPhone(cleaned);
  };

  return (
    <Animated.View style={[styles.detailsMenu, { transform: [{ translateY: slideAnim }] }]}>
      
      {/* Close/Delete */}
      <TouchableOpacity 
        style={styles.removeButtonTopRight} 
        onPress={() => {
          Alert.alert(
            "Delete Lead?",
            "This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => deleteLead(id) }
            ]
          )
        }}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.header}>Lead Details</Text>

      {/* Lead Icon & Status */}
      <View style={styles.iconRow}>
        <Image style={styles.leadIcon} source={leadTypes[leadSpecifics.icon]} />
        <View style={styles.swapRow}>
          {["successful", "unsuccessful", "null"].map(type => (
            <TouchableOpacity 
              key={type} 
              onPress={() => editLeadIcon(id, type, leadSpecificDetailsSetter)}
              style={[
                styles.iconWrapper, 
                leadSpecifics.icon === type && styles.iconWrapperSelected
              ]}
            >
              <Image style={styles.smallIcon} source={leadTypes[type]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fields */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
          placeholderTextColor="#999"
        />

        <Text style={styles.fieldLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
          placeholderTextColor="#999"
        />

        <Text style={styles.fieldLabel}>Address</Text>
        <Text style={styles.fieldValue}>
          {leadSpecifics ? leadSpecifics.address : "Loading..."}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  detailsMenu: {
    position: "absolute",
    left: 0,
    right: 0,
    height: height * 0.48,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    bottom: 0,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#222",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  swapRow: {
    flexDirection: "row",
    marginLeft: 20,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 10,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  iconWrapperSelected: {
    borderColor: "#007BFF",
    backgroundColor: "rgba(0,123,255,0.1)",
  },
  smallIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  leadIcon: {
    width: 64,
    height: 64,
    resizeMode: "contain",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 6,
    marginBottom: 14,
    color: "#222",
    backgroundColor: "#fafafa",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: "#555",
    marginBottom: 14,
  },
  removeButtonTopRight: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "#eee",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  removeButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 18,
  },
});

