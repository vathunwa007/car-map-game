/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getMapsApiOptions, loadMapsApi } from "./jsm/load-maps-api";
import "./App.css";
import Player from "./class/Player";
import Controller from "./class/Controller";

function App() {
  const VIEW_PARAMS = {
    center: { lat: 53.554486, lng: 10.007479 },
    zoom: 21,
    heading: 40,
    tilt: 65,
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function initMap() {
    const { mapId } = getMapsApiOptions();
    const mapInstant = await loadMapsApi();

    const map = new mapInstant.Map(
      document.getElementById("map") as HTMLElement,
      {
        mapId: mapId,
        disableDefaultUI: true,
        backgroundColor: "transparent",
        gestureHandling: "greedy",
        keyboardShortcuts: false,
        mapTypeId: "satellite",
        ...VIEW_PARAMS,
      }
    );

    // Add the overlay to the map.
    return map;
  }

  useEffect(() => {
    (async () => {
      const map = await initMap();

      const UserPlayer = new Player("Aunwa", map);
      UserPlayer.update();
    })();
  }, [initMap]);

  return (
    <div
      id="wrapper"
      style={{ position: "relative", height: "100vh", width: "100vw" }}
    >
      <div
        id="map"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 0,
        }}
      ></div>
      <Controller />
    </div>
  );
}

export default App;
