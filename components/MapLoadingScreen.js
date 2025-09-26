
import { Button, Text, View, StyleSheet, 
  ActivityIndicator } from "react-native";
import 'react-native-get-random-values';


export default function MapLoadingScreen({ setUserWantsLocationDisplayed, setDisplayMap }) {
  return (
    <View style={styles.mapLoadingScreenContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.mapLoadingScreenText}>Fetching Location...</Text>
      <Button title="Cancel" onPress={() => {
        setUserWantsLocationDisplayed(false)
        setDisplayMap(true);
        }}></Button>
    </View>
  )
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
