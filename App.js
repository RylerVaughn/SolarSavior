// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
      console.log("WAITING");
      const res = await userLocationAvailable();
      setHasPermission(res);
      console.log(hasPermission);
    })();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      (async () => {
        console.log("waiting...")
        let { coords } = await Location.getCurrentPositionAsync({});
        console.log("done!!");
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
      <Tab.Navigator screenOptions={{ headerShown: false }}>
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
