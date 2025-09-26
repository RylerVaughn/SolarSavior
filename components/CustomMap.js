import { Text, View, Image, Dimensions, StyleSheet } from "react-native";
import { useState, useEffect, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Clusterer } from "react-native-clusterer";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";
import SwapMapButton from "./SwapMapButton";
import LeadMoreDetailsMenu from "./LeadMoreDetailsMenu";
import LeadPlacementToggle from "./LeadPlacementToggle";

const API_KEY = "AIzaSyBDVrnV9wQ-aJfqsEWooFB4b5HpD2RrUvg";


export default function CustomMap({ leadLookup, hasPermission, userFound, userInitialLocation, 
  leads, setLeads, region, setRegion, userWantsLocationDisplayed, leadTypes }) {

  const [mapType, mapTypeSetter] = useState("satellite");
  const [newLeadState, setNewLeadState] = useState("");
  const [toggledButton, toggledButtonSetter] = useState(null);
  const [leadMenuSpecificsIdx, setLeadMenuSpecificsIdx] = useState(null);
  const [leadSpecificDetails, setLeadSpecificDetails] = useState({});
  const [menuState, setMenuState] = useState(false);
  const mapRef = useRef(null);

  const { width, height } = Dimensions.get("window");

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
    await addLead(coordinates, newLeadState);
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

      leadLookup.current.set(leadId, newLeadData);
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
    setLeadMenuSpecificsIdx(null);
    leadLookup.current.delete(id);
    setLeads(Array.from(leadLookup.current.values()));
    setLeadSpecificDetails((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }

  function editLeadIcon(id, icon, leadSpecificDetailsSetter) {
    const targetLead = leadLookup.current.get(id);
    targetLead.properties.icon = icon;
    setLeads(Array.from(leadLookup.current.values()));
    leadSpecificDetailsSetter(prev => ({
      ...prev,
      [id]: { ...prev[id], icon: icon }
    }))
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
              radius: 10,
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
                editLeadIcon={editLeadIcon}
                leadTypes={leadTypes}
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
          leadTypes={leadTypes}
        />
      </View>
  )
}

const styles = StyleSheet.create({
  null: {},
  smallIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    marginHorizontal: 5,
  },
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


