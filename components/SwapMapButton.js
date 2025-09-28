import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // or react-native-vector-icons
import 'react-native-get-random-values';

export default function SwapMapButton({ mapState, mapStateSetter }) {
  const switchMap = () => {
    mapStateSetter(mapState === "satellite" ? "standard" : "satellite");
  };

  return (
    <View style={styles.swapMapContainer}>
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={switchMap}
      >
        <Ionicons 
          name={mapState === "satellite" ? "map-outline" : "layers-outline"} 
          size={22} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  swapMapContainer: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  iconButton: {
    backgroundColor: "#007BFF",
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

