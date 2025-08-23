import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, Text, TextInput, View } from "react-native";
import { useState } from "react";
import MapView from "react-native-maps";

const Tab = createBottomTabNavigator();

function Map() {
  const [mapType, mapTypeSetter] = useState("satellite");

  function switchMap(curMapType) {
    if (curMapType == "satellite") {
      mapTypeSetter("standard");
    } else {
      mapTypeSetter("satellite");
    }
  }

  return (
    <View>
      <MapView
      mapType={mapType}
      style={{ width: '100%', height: '100%' }}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      >
        <Button title="Swap" 
        onPress={() => switchMap(mapType)}
        style={{width: "20%", height: "10%", color: "white"}}
        ></Button>
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
 
function Navigation() {
  return (
      <NavigationContainer>
        <Tab.Navigator>
            <Tab.Screen name="Welcome">
              {() => <Welcome></Welcome>}
            </Tab.Screen>
            <Tab.Screen name="Map">
              {() => <Map></Map>}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
  )
}

export default Navigation;