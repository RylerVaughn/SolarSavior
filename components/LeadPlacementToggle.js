import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // or react-native-vector-icons
import 'react-native-get-random-values';
import LeadPlacementMenu from "./LeadPlacementMenu";

export default function LeadPlacementToggle({ 
  setNewLeadState, 
  toggleStyleControl, 
  toggledButtonSetter, 
  menuState, 
  setMenuState, 
  setLeadMenuSpecificsIdx, 
  leadTypes 
}) {
  return (
    <>
      <View style={styles.toggleLeadMenuContainer}>
        <TouchableOpacity 
          style={[styles.iconButton, menuState && styles.iconButtonActive]}
          onPress={() => {
            setMenuState(!menuState);
            setLeadMenuSpecificsIdx(null);
          }}
        >
          <Ionicons 
            name={menuState ? "close" : "menu"} 
            size={22} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <LeadPlacementMenu 
        visible={menuState} 
        setNewLeadState={setNewLeadState}
        toggleStyleControl={toggleStyleControl}
        toggledButtonSetter={toggledButtonSetter}
        leadTypes={leadTypes} 
      />
    </>
  )
}

const styles = StyleSheet.create({
  toggleLeadMenuContainer: {
    position: "absolute",
    top: 110,
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
  iconButtonActive: {
    backgroundColor: "#FF3B30",
  },
});
