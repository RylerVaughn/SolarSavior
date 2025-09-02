import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, Text, View, StyleSheet, Animated, Dimensions, Image, TouchableOpacity } from "react-native";
import { useState, useEffect, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';

const Tab = createBottomTabNavigator();
const { height } = Dimensions.get("window");
const leadTypes = {
  successful: require("./Images/successful.png"),
  unsuccessful: require("./Images/unsuccessful.png"),
  null: require("./Images/null.png")
}


function Map({ hasPermission }) {
  const [initialCoordinates, setInitialCoordinates] = useState({ latitude: 34, longitude: 118 });
  const [mapType, mapTypeSetter] = useState("satellite");
  const [newLeadState, setNewLeadState] = useState("");
  const [leads, setLeads] = useState([]);

  function handleMapPress(event) {
    if (newLeadState == "") {
      return;
    }
    
    const newLeadData = {
      coordinates: event.nativeEvent.coordinate,
      icon: newLeadState
    };

    setNewLeadState("");
    setLeads([...leads, newLeadData]);
  }

  useEffect(() => {
    if (hasPermission) {
      (async () => {
        let location = await Location.getCurrentPositionAsync({});
        setInitialCoordinates(location.coords);
      })()
    }
  }, [hasPermission]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        onPress={handleMapPress}
        showsUserLocation={hasPermission}
        mapType={mapType}
        style={{ flex: 1 }}
        region={{
          latitude: initialCoordinates.latitude,
          longitude: initialCoordinates.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
          {leads.map((lead, idx) => {
            return (
              <Marker coordinate={lead.coordinates} 
              key={idx}
              anchor={{x: 0.5, y: 0.5}}>
                <Image 
                  source={leadTypes[lead.icon]}
                  style={{ width: 40, height: 40 }} // smaller size
                  resizeMode="contain"
                />
              </Marker>
            )
          })}
      </MapView>

      <SwapMapButton mapState={mapType} mapStateSetter={mapTypeSetter} />
      <LeadPlacementToggle setNewLeadState={setNewLeadState} />
    </View>
  )
}

function LeadPlacementMenu({ visible, setNewLeadState}) {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
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
        <TouchableOpacity onPress={() => setNewLeadState("null")}>
          <Image style={styles.leadIcon} source={leadTypes.null} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setNewLeadState("unsuccessful")}>
          <Image style={styles.leadIcon} source={leadTypes.unsuccessful} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setNewLeadState("successful")}>
          <Image style={styles.leadIcon} source={leadTypes.successful} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}


function LeadPlacementToggle({ setNewLeadState }) {
  const [menuState, setMenuState] = useState(false);

  return (
    <>
      <View style={styles.toggleLeadMenuContainer}>
        <Button
          title={menuState ? "Close Menu" : "Open Menu"}
          onPress={() => setMenuState(!menuState)}
        />
      </View>
      <LeadPlacementMenu visible={menuState} setNewLeadState={setNewLeadState} />
    </>
  )
}

function SwapMapButton({ mapState, mapStateSetter }) {
  const switchMap = () => {
    mapStateSetter(mapState === "satellite" ? "standard" : "satellite");
  }

  return (
    <View style={styles.swapMapContainer}>
      <Button title="Swap Map" onPress={switchMap} />
    </View>
  )
}

function Welcome() {
  return (
    <View style={styles.centered}>
      <Text style={{ fontSize: 24 }}>Welcome!</Text>
    </View>
  )
}

async function userLocationAvailable() {
  const req = await Location.requestForegroundPermissionsAsync();
  if (!req.status) {
    console.log("User location access not granted.");
    return false;
  }
  console.log("User location access granted.");
  return true;
}

function Navigation() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await userLocationAvailable();
      setHasPermission(res);
    })()
  }, [])

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Welcome" component={Welcome} />
        <Tab.Screen name="Map">
          {() => <Map hasPermission={hasPermission} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
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
    height: 200,             // height of popup
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
});


export default Navigation;