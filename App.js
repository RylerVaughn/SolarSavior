import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, Text, View, StyleSheet, Animated, Dimensions, Image, TouchableOpacity } from "react-native";
import { useState, useEffect, useRef } from "react";
import MapView from "react-native-map-clustering";
import { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import GeoCoder from 'react-native-geocoding';

const API_KEY = "AIzaSyBDVrnV9wQ-aJfqsEWooFB4b5HpD2RrUvg";

GeoCoder.init(API_KEY);


const Tab = createBottomTabNavigator();
const { height } = Dimensions.get("window");
const leadTypes = {
  successful: require("./Images/successful.png"),
  unsuccessful: require("./Images/unsuccessful.png"),
  null: require("./Images/null.png")
}


function Map({ hasPermission }) {
  const [initialCoordinates, setInitialCoordinates] = useState({ latitude: 34, longitude: -118 });
  const [mapType, mapTypeSetter] = useState("satellite");
  const [newLeadState, setNewLeadState] = useState("");
  const [leads, setLeads] = useState([]);
  const [toggledButton, toggledButtonSetter] = useState(null);
  const [leadMenuSpecificsIdx, setLeadMenuSpecificsIdx] = useState(null);
  const [leadSpecificDetails, setLeadSpecificDetails] = useState([]);
  const [menuState, setMenuState] = useState(false);
  const [iconLoaded, setIconLoaded] = useState(false);
  const [loadedIcons, setLoadedIcons] = useState({});


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
        coordinates,
        icon: newLeadState
      };

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

      const leadSpecs = { address };
      setLeadSpecificDetails(prev => [...prev, leadSpecs]);
    }
  }

  // defensive helper to extract count & coordinate from whatever cluster shape the lib provides
  const extractClusterInfo = (cluster) => {
    // cluster may be shaped like: { properties: { point_count: X }, geometry: { coordinates: [lng, lat] } }
    // or like: { pointCount: X, coordinate: { latitude, longitude } } depending on versions
    const count =
      cluster?.properties?.point_count ??
      cluster?.properties?.pointCount ??
      cluster?.pointCount ??
      cluster?.point_count ??
      0;

    let coord;
    if (cluster?.geometry?.coordinates) {
      // geometry: [lng, lat]
      const [lng, lat] = cluster.geometry.coordinates;
      coord = { latitude: lat, longitude: lng };
    } else if (cluster?.coordinate) {
      coord = cluster.coordinate;
    } else if (cluster?.geometry?.coordinates === undefined && cluster?.latitude && cluster?.longitude) {
      coord = { latitude: cluster.latitude, longitude: cluster.longitude };
    } else {
      coord = { latitude: initialCoordinates.latitude, longitude: initialCoordinates.longitude };
    }

    return { count, coord };
  };

  // custom cluster renderer — shows circular badge with count
  const renderCluster = (cluster, onPress) => {
    const { count, coord } = extractClusterInfo(cluster);

    // size scales a bit with count (clamped)
    const size = Math.min(64, 30 + Math.floor(Math.log10(Math.max(1, count))) * 10);

    return (
      <Marker
        key={`cluster-${cluster.id ?? count}-${coord.latitude}-${coord.longitude}`}
        coordinate={coord}
        onPress={() => {
          // default library onPress is usually passed, call it if available
          if (typeof onPress === "function") onPress();
          // zoom a little further just in case onPress wasn't provided or you want to ensure zoom
          if (mapRef.current && mapRef.current.animateToRegion) {
            mapRef.current.animateToRegion({
              latitude: coord.latitude,
              longitude: coord.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 250);
          }
        }}
        tracksViewChanges={false}
      >
        <View style={[
            styles.clusterContainer,
            { width: size, height: size, borderRadius: size / 2 }
          ]}>
          <Text style={styles.clusterText}>{count}</Text>
        </View>
      </Marker>
    );
  };

  useEffect(() => {
    if (hasPermission) {
      (async () => {
        let location = await Location.getCurrentPositionAsync({});
        setInitialCoordinates(location.coords);
      })()
    }
  }, [hasPermission]);

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
        // clustering visual props
        clusterColor="#007BFF"
        clusterTextColor="#fff"
        clusterBorderColor="#fff"
        clusterBorderWidth={1}
        spiderLineColor="#007BFF"
        onClusterPress={(cluster) => {
          // prefer using library's onClusterPress (if it provides the cluster geometry)
          // but also fallback to our renderCluster onPress behavior
          const { coord } = extractClusterInfo(cluster);
          if (mapRef.current && mapRef.current.animateToRegion) {
            mapRef.current.animateToRegion({
              latitude: coord.latitude,
              longitude: coord.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 300);
          }
        }}
        // give the library our custom renderer
        renderCluster={renderCluster}
        initialRegion={{
          latitude: initialCoordinates.latitude,
          longitude: initialCoordinates.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}

      >
        {leads.map((lead, idx) => {
          return (
            <Marker
              key={`${lead.coordinates.latitude}-${lead.coordinates.longitude}-${lead.icon}`}
              coordinate={lead.coordinates}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => setLeadMenuSpecificsIdx(idx)}
              tracksViewChanges={!loadedIcons[idx]} // false once loaded
            >
              <Image
                source={leadTypes[lead.icon]}
                style={{ width: 30, height: 30 }}
                resizeMode="contain"
                onLoad={() => setLoadedIcons(prev => ({ ...prev, [idx]: true }))}
              />
            </Marker>
          )
        })}


      </MapView>

        {leadMenuSpecificsIdx != null && (
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
            <LeadMoreDetailsMenu 
              idx={leadMenuSpecificsIdx} 
              leads={leads} 
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


function LeadMoreDetailsMenu({ idx, leads, leadSpecificDetails }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const lead = leads[idx];
  const leadSpecifics = leadSpecificDetails[idx];

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

      <Image style={styles.leadIcon} source={leadTypes[lead.icon]} />

      {/* Info fields (placeholders for now) */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.fieldLabel}>Name:</Text>
        <Text style={styles.fieldValue}>[Placeholder Name]</Text>

        <Text style={styles.fieldLabel}>Phone Number:</Text>
        <Text style={styles.fieldValue}>[Placeholder Phone]</Text>

        <Text style={styles.fieldLabel}>Address:</Text>
        <Text style={styles.fieldValue}>{leadSpecifics.address}</Text>
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
});




export default Navigation;