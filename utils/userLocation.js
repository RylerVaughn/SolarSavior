// utils/userLocation.js
import * as Location from 'expo-location';

export async function userLocationAvailable() {
  try {
    // Ask for permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn("Location permission not granted");
      return false;
    }

    // Check if services are enabled (GPS, etc.)
    let servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      console.warn("Location services not enabled");
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error checking location availability:", err);
    return false;
  }
}
