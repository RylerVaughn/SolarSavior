import { Text, View, StyleSheet, 
  Animated, Image, TouchableOpacity, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import 'react-native-get-random-values';

export default function LeadPlacementMenu({ visible, setNewLeadState, toggledButtonSetter, toggleStyleControl, leadTypes }) {

  const { width, height } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // Ensure the lead state is set to "" when the menu is opened and closed.
    setNewLeadState("");
    toggledButtonSetter(null);
    Animated.timing(slideAnim, {
      toValue: visible ? height - 200 : height, // 200 is the height of the popup
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.leadMenu, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.leadMenuText}>Choose Lead Type</Text>

      <View style={styles.leadMenuRow}>
        <TouchableOpacity onPress={() => {
          setNewLeadState("null");
          toggledButtonSetter(1);
        }}>
          <Image style={[styles.leadIcon, toggleStyleControl(1)]} source={leadTypes.null} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setNewLeadState("unsuccessful");
          toggledButtonSetter(2);
        }}>
          <Image style={[styles.leadIcon, toggleStyleControl(2)]} source={leadTypes.unsuccessful} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setNewLeadState("successful");
          toggledButtonSetter(3);
        }}>
          <Image style={[styles.leadIcon, toggleStyleControl(3)]} source={leadTypes.successful} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
});
