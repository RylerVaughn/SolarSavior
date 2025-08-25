import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, Text, TextInput, View } from "react-native";
import { useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';

const Tab = createBottomTabNavigator();

function Map({ hasPermission }) {
  const [mapType, mapTypeSetter] = useState("satellite");

  function switchMap(curMapType) {
    mapTypeSetter((curMapType) => (curMapType == "satellite" ? "standard" : "satellite"));
  }

  const initialCoordinates = getUserCoordinates(hasPermission);

  return (
    <View>
      <MapView
      showsUserLocation={hasPermission}
      mapType={mapType}
      style={{ width: '100%', height: '100%' }}
      initialRegion={{
        latitude: initialCoordinates.latitude,
        longitude: initialCoordinates.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      >
        <Button title="Swap" 
        onPress={() => switchMap(mapType)}
        style={{width: "20%", height: "10%", color: "white"}}
        ></Button>
        <Marker
        title="MyMarker"
        coordinate={{
          latitude: initialCoordinates.latitude,
          longitude: initialCoordinates.longitude
        }}
        description="My Great Marker!!">
        </Marker>
      </MapView>
    </View>
  )
}

function Welcome() {
  return (
    <View>
      <Text>Welcome!</Text>
    </View>
  )   
}
 
async function userLocationAvailable() {
  const req =  await Location.requestForegroundPermissionsAsync();
  if (!req.status) {
    console.log("User location access not granted.");
    return false;
  }
  console.log("User location access granted.");
  return true;
}

function Navigation() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect((() => {
    (async () => {
      const res = await userLocationAvailable();
      setHasPermission(res);
    })()
  }), [])

  return (
      <NavigationContainer>
        <Tab.Navigator>
            <Tab.Screen name="Welcome">
              {() => <Welcome></Welcome>}
            </Tab.Screen>
            <Tab.Screen name="Map">
              {() => <Map hasPermission={hasPermission}></Map>}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
  )
}

function getUserCoordinates(hasPermission) {
  let coordinates;

  if (hasPermission) {
    Location.getCurrentPositionAsync()
      .then((coords) => coordinates = coords)
      .catch((coords) => console.log("Failed to retrieve current user position even though access was granted."));
  } else {
    coordinates = {"latitude": 37.78825, "longitude": -122.4324,};
  } 
  console.log(`Permission: ${hasPermission}`);
  console.log(coordinates);

  return coordinates;
}

export default Navigation;