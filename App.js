import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, Text, View, StyleSheet, 
  Animated, Dimensions, Image, TouchableOpacity, 
  ActivityIndicator, TextInput, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import GeoCoder from 'react-native-geocoding';
import { Clusterer } from "react-native-clusterer";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";


const API_KEY = "AIzaSyBDVrnV9wQ-aJfqsEWooFB4b5HpD2RrUvg";
GeoCoder.init(API_KEY);

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get("window");
const leadTypes = {
  successful: require("./Images/successful.png"),
  unsuccessful: require("./Images/unsuccessful.png"),
  null: require("./Images/null.png")
}

function Navigation() {
  const [hasPermission, setHasPermission] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [userInitialLocation, setUserInitialLocation] = useState();
  const [leads, setLeads] = useState([]);
  const [region, setRegion] = useState({
    latitude: 37.7749,    
    longitude: -122.4194,
    latitudeDelta: 0.0922,  
    longitudeDelta: 0.0421,
  });
  const leadLookup = new Map();

  useEffect(() => {
    (async () => {
      const res = await userLocationAvailable();
      setHasPermission(res);
    })()
  }, [])

  useEffect(() => {
    if (hasPermission) {
      (async () => {
        let { coords } = await Location.getCurrentPositionAsync({});
        setUserInitialLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });
        setUserFound(true);
      })()
    }
  }, [hasPermission]);

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Welcome" component={Welcome} />
        <Tab.Screen name="Map">
          {() => <MapTab  
          leadLookup={leadLookup}
          hasPermission={hasPermission} 
          userInitialLocation={userInitialLocation} 
          userFound={userFound} 
          leads={leads} 
          setLeads={setLeads} 
          region={region} 
          setRegion={setRegion}/>}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  )
}


function MapTab({ leadLookup, userInitialLocation, userFound, hasPermission, leads, setLeads, region, setRegion }) {
  const [userWantsLocationDisplayed, setUserWantsLocationDisplayed] = useState(true);
  const [displayMap, setDisplayMap] = useState(false);

  useEffect(() => {
    if (userFound) {
      setDisplayMap(true);
    }
  }, [userFound])

  return (
    <>
    {displayMap ?
        <CustomMap 
        hasPermission={hasPermission} 
        userInitialLocation={userInitialLocation} 
        leads={leads} 
        setLeads={setLeads} 
        region={region} 
        setRegion={setRegion}
        userWantsLocationDisplayed={userWantsLocationDisplayed}
        userFound={userFound}
        leadLookup={leadLookup}
        />
      :
        <MapLoadingScreen 
        setUserWantsLocationDisplayed={setUserWantsLocationDisplayed}
        setDisplayMap={setDisplayMap}/>
    }
    </>
  )
}




function MapLoadingScreen({ setUserWantsLocationDisplayed, setDisplayMap }) {
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





function CustomMap({ leadLookup, hasPermission, userFound, userInitialLocation, leads, setLeads, region, setRegion, userWantsLocationDisplayed }) {
  const [mapType, mapTypeSetter] = useState("satellite");
  const [newLeadState, setNewLeadState] = useState("");
  const [toggledButton, toggledButtonSetter] = useState(null);
  const [leadMenuSpecificsIdx, setLeadMenuSpecificsIdx] = useState(null);
  const [leadSpecificDetails, setLeadSpecificDetails] = useState({});
  const [menuState, setMenuState] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (userFound && userWantsLocationDisplayed) {
      setRegion(userInitialLocation);
    }
  }, [userFound, userWantsLocationDisplayed]);

  function toggleStyleControl(key) {
    if (toggledButton == key) {
      return styles.leadIconToggled;
    } else {
      return styles.null;
    };
  }

  async function handleMapPress(event) {
    if (leadMenuSpecificsIdx !== null) {
      setLeadMenuSpecificsIdx(null);
      return;
    }

    const coordinates = event.nativeEvent.coordinate;

    addLead(coordinates, newLeadState);
  }

  useEffect(() => {
    if (leadMenuSpecificsIdx != null && menuState) {
      setMenuState(false);
    }
  }, [leadMenuSpecificsIdx, menuState]);


  async function addLead(coordinates, leadState) {
    if (leadState !== "") {

      const leadId = uuidv4();

      const newLeadData = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            coordinates.longitude,
            coordinates.latitude
          ]
        },
        properties: {
          id: leadId,
          icon: leadState,
        }
      }

      leadLookup.set(id, newLeadData);
      setLeads(prev => [...prev, newLeadData]);
      setNewLeadState("");
      toggledButtonSetter(null);

      let address;
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${API_KEY}`
        );
        const data = await res.json();
        address = data.results && data.results[0] ? data.results[0].formatted_address : `${coordinates.latitude}, ${coordinates.longitude}`;
      } catch (e) {
        console.log(`Error occured while fetching address: ${e}`);
        address = `${coordinates.latitude}, ${coordinates.longitude}`;
      }

      setLeadSpecificDetails(prev => ({
        ...prev,
        [newLeadData.properties.id]: {
          icon: leadState,
          address: address
        }
      }));
    }
  }


  async function deleteLead(id) {
    leadLookup.delete(id);
    setLeads(Array.from(leadLookup.values()));
  }


  return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          onPress={handleMapPress}
          showsUserLocation={hasPermission}
          mapType={mapType}
          style={{ flex: 1 }}
          region={region}
          onRegionChangeComplete={(r) => {
            setRegion(r);
          }}
        >

          <Clusterer
            data={leads}
            region={region}
            mapDimensions={{ width, height }}
            options={{
              radius: 20,
              minPoints: 2,
              maxZoom: 16
            }}
            renderItem={(item) => {
              const { geometry, properties } = item;
              const coords = {
                latitude: geometry.coordinates[1],
                longitude: geometry.coordinates[0],
              }
              // For clusters, item.properties.cluster_id will exist (or some cluster flag)
              const isCluster = item.properties.cluster_id !== undefined;
              if (isCluster) {
                // render cluster marker
                return (
                  <Marker
                    key={`cluster-${properties.cluster_id}-${coords.latitude}-${coords.longitude}`}
                    coordinate={coords}
                    anchor={{ x: 0.5, y: 0.5 }}
                  >
                    <View style={styles.cluster}>
                      <Text style={styles.clusterText}>
                        {item.properties.point_count ?? "?"}
                      </Text>
                    </View>
                  </Marker>
                );
              } else {
                // render individual point
                return (
                  <Marker
                    key={properties.id}
                    coordinate={coords}
                    anchor={{ x: 0.5, y: 0.5 }}
                    onPress={() => setLeadMenuSpecificsIdx(properties.id)}
                  >
                    <View style={{ width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }}>
                      <Image source={leadTypes[item.properties.icon]} style={{ width: 30, height: 30 }} resizeMode="contain" />
                    </View>
                    
                  </Marker>
                );
              }
            }}
          />

        </MapView>

          {leadMenuSpecificsIdx != null && (
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
              <LeadMoreDetailsMenu 
                id={leadMenuSpecificsIdx} 
                leadSpecificDetails={leadSpecificDetails}
                leadSpecificDetailsSetter={setLeadSpecificDetails}
                deleteLead={deleteLead}
              />
            </View>
          )} 


        <SwapMapButton mapState={mapType} mapStateSetter={mapTypeSetter} />
        <LeadPlacementToggle
          setNewLeadState={setNewLeadState}
          toggledButtonSetter={toggledButtonSetter}
          toggleStyleControl={toggleStyleControl}
          menuState={menuState}
          setMenuState={setMenuState}
          setLeadMenuSpecificsIdx={setLeadMenuSpecificsIdx}
        />
      </View>
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




function LeadPlacementToggle({ setNewLeadState, toggleStyleControl, toggledButtonSetter, menuState, setMenuState, setLeadMenuSpecificsIdx }) {

  return (
    <>
      <View style={styles.toggleLeadMenuContainer}>
        <Button
          title={menuState ? "Close Menu" : "Open Menu"}
          onPress={() => {
            setMenuState(!menuState);
            setLeadMenuSpecificsIdx(null);
          }}
        />
      </View>
      <LeadPlacementMenu 
      visible={menuState} 
      setNewLeadState={setNewLeadState}
      toggleStyleControl={toggleStyleControl}
      toggledButtonSetter={toggledButtonSetter} />
    </>
  )
}




function LeadPlacementMenu({ visible, setNewLeadState, toggledButtonSetter, toggleStyleControl }) {
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




function LeadMoreDetailsMenu({ id, leadSpecificDetails, leadSpecificDetailsSetter, deleteLead }) {
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

      <Image style={styles.leadIcon} source={leadTypes[leadSpecifics.icon]} />

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

export default Navigation;
