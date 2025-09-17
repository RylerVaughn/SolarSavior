import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, Text, View, StyleSheet, Animated, Dimensions, Image, TouchableOpacity } from "react-native";
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


function Map({ hasPermission }) {
  const [mapType, mapTypeSetter] = useState("satellite");
  const [newLeadState, setNewLeadState] = useState("");
  const [leads, setLeads] = useState([]);
  const [toggledButton, toggledButtonSetter] = useState(null);
  const [leadMenuSpecificsIdx, setLeadMenuSpecificsIdx] = useState(null);
  const [leadSpecificDetails, setLeadSpecificDetails] = useState({});
  const [menuState, setMenuState] = useState(false);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 34.4208,
    longitude: -119.6982,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  })
  const [region, setRegion] = useState(initialRegion);

  useEffect(() => {
    if (hasPermission) {
      (async () => {
        let location = await Location.getCurrentPositionAsync({});
        setInitialRegion(location.coords);
        setRegion(location.coords);
      })()
    }
  }, [hasPermission]);

  const mapRef = useRef(null);

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

    if (newLeadState !== "") {
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
          id: uuidv4(),
          icon: newLeadState,
        }
      }

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
          icon: newLeadState,
          address: address
        }
      }));
    }
  }

  useEffect(() => {
    if (leadMenuSpecificsIdx != null && menuState) {
      setMenuState(false);
    }
  }, [leadMenuSpecificsIdx, menuState]);


  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        onPress={handleMapPress}
        showsUserLocation={hasPermission}
        mapType={mapType}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
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
                  <Image
                    source={leadTypes[item.properties.icon]}
                    style={{ width: 30, height: 30 }}
                    resizeMode="contain"
                  />
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


function LeadMoreDetailsMenu({ id, leadSpecificDetails }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const leadSpecifics = leadSpecificDetails[id];

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0, // final position at bottom
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.detailsMenu,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Lead Details
      </Text>

      <Image style={styles.leadIcon} source={leadTypes[leadSpecifics.icon]} />

      {/* Info fields (placeholders for now) */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.fieldLabel}>Name:</Text>
        <Text style={styles.fieldValue}>[Placeholder Name]</Text>

        <Text style={styles.fieldLabel}>Phone Number:</Text>
        <Text style={styles.fieldValue}>[Placeholder Phone]</Text>

        <Text style={styles.fieldLabel}>Address:</Text>
        <Text style={styles.fieldValue}>{leadSpecifics != null ? leadSpecifics.address : "Loading..."}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  null: {},
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
});

export default Navigation;

// import React, { useState, useRef } from "react";
// import { View, Text, StyleSheet, Dimensions } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import { Clusterer } from "react-native-clusterer";

// const { width, height } = Dimensions.get("window");

// const INITIAL_REGION = {
//   latitude: 34.42,
//   longitude: -119.7,
//   latitudeDelta: 0.5,
//   longitudeDelta: 0.5,
// };

// const generateRandomPoints = (count) => {
//   const arr = [];
//   for (let i = 0; i < count; i++) {
//     arr.push({
//       // For clusterer, data point should be a GeoJSON-like feature
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [
//           -119.7 + (Math.random() - 0.5) * 1, // longitude
//           34.42 + (Math.random() - 0.5) * 1,   // latitude
//         ],
//       },
//       properties: {
//         id: `pt-${i}`,
//       },
//     });
//   }
//   return arr;
// };

// export default function ClustererTestMap() {
//   const [region, setRegion] = useState(INITIAL_REGION);
//   const [points] = useState(() => generateRandomPoints(50)); // 50 random markers
//   const mapRef = useRef(null);

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         provider={PROVIDER_GOOGLE}
//         initialRegion={INITIAL_REGION}
//         style={styles.map}
//         onRegionChangeComplete={(r) => {
//           setRegion(r);
//         }}
//       >
//         <Clusterer
//           data={points}
//           region={region}
//           mapDimensions={{ width, height }}
//           options={{
//             radius: 20,
//             minPoints: 2,
//             maxZoom: 16,
//             // you can adjust other supercluster options if needed
//           }}
//           renderItem={(item) => {
//             const { geometry, properties } = item;
//             const coords = {
//               latitude: geometry.coordinates[1],
//               longitude: geometry.coordinates[0],
//             };

//             // For clusters, item.properties.cluster_id will exist (or some cluster flag)
//             const isCluster = item.properties.cluster_id !== undefined;
//             if (isCluster) {
//               // render cluster marker
//               return (
//                 <Marker
//                   key={`cluster-${properties.cluster_id}-${coords.latitude}-${coords.longitude}`}
//                   coordinate={coords}
//                   anchor={{ x: 0.5, y: 0.5 }}
//                 >
//                   <View style={styles.cluster}>
//                     <Text style={styles.clusterText}>
//                       {item.properties.point_count ?? "?"}
//                     </Text>
//                   </View>
//                 </Marker>
//               );
//             } else {
//               // render individual point
//               return (
//                 <Marker
//                   key={properties.id}
//                   coordinate={coords}
//                 >
//                   <View style={styles.marker}>
//                     <Text>•</Text>
//                   </View>
//                 </Marker>
//               );
//             }
//           }}
//         />
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   cluster: {
//     backgroundColor: "#007AFF",
//     borderWidth: 2,
//     borderColor: "#fff",
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     // Optional: add elevation for Android
//     elevation: 5,
//   },
//   clusterText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   marker: {
//     justifyContent: "center",
//     alignItems: "center",
//     width: 40,
//     height: 40,
//   }
// });

