// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from "react";
import * as Location from 'expo-location';

import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import { userLocationAvailable } from './utils/userLocation';

const leadTypes = {
  successful: require("./Images/successful.png"),
  unsuccessful: require("./Images/unsuccessful.png"),
  null: require("./Images/null.png")
}

const Tab = createBottomTabNavigator();

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
  const leadLookup = useRef(new Map());

  useEffect(() => {
    (async () => {
      const res = await userLocationAvailable();
      setHasPermission(res);
    })();
  }, []);

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
      })();
    }
  }, [hasPermission]);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#007BFF", // highlight color
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0,
            elevation: 4,
            height: 65,
            paddingBottom: 8,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = "home-outline";
            } else if (route.name === "Map") {
              iconName = "map-outline";
            }
            return <Ionicons name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Map">
          {() => (
            <MapScreen
              leadLookup={leadLookup}
              hasPermission={hasPermission}
              userInitialLocation={userInitialLocation}
              userFound={userFound}
              leads={leads}
              setLeads={setLeads}
              region={region}
              setRegion={setRegion}
              leadTypes={leadTypes}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
