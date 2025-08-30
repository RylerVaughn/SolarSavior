import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, Text, TextInput, View } from "react-native";
import { useState, useEffect } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';

const Tab = createBottomTabNavigator();

function Map({ hasPermission }) {
  const [initialCoordinates, setInitialCoordinates] = useState({latitude: 34, longitude: 118});
  const [mapType, mapTypeSetter] = useState("satellite");

  function switchMap(curMapType) {
    mapTypeSetter((curMapType) => (curMapType == "satellite" ? "standard" : "satellite"));
  }

  useEffect(() => {
    if (hasPermission) {
      (async () => {
        let location = await Location.getCurrentPositionAsync({});
        setInitialCoordinates(location.coords);
      })()
    } else {
      setInitialCoordinates({latitude: 34, longitude: 118});
    }
  }, []);

  console.log(initialCoordinates);
  
    return (
      <View>
        <MapView
        provider={PROVIDER_GOOGLE}
        showsUserLocation={hasPermission}
        mapType={mapType}
        style={{ width: '100%', height: '100%' }}
        region={{
          latitude: initialCoordinates.latitude,
          longitude: initialCoordinates.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        >
          <Marker
          title="MyMarker"
          coordinate={{
            latitude: initialCoordinates.latitude,
            longitude: initialCoordinates.longitude
          }}
          description="My Great Marker!!">
          </Marker>
        </MapView>
        <Button title="Swap" 
          onPress={() => switchMap(mapType)}
          style={{width: "20%", height: "10%", color: "white"}}
        ></Button>
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

export default Navigation;