/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { getMapsApiOptions, loadMapsApi } from "./jsm/load-maps-api";
import ThreeJSOverlayView from "./lib/ThreeJSOverlayView";
import { CatmullRomCurve3, Vector3 } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./App.css";
function App() {
  const CAR_FRONT = new Vector3(0, 1, 0);
  const tmpVec3 = new Vector3();

  const VIEW_PARAMS = {
    center: { lat: 53.554486, lng: 10.007479 },
    zoom: 18,
    heading: 40,
    tilt: 65,
  };

  const ANIMATION_DURATION = 12000;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ANIMATION_POINTS = [
    { lat: 53.554473, lng: 10.008226 },
    { lat: 53.554913, lng: 10.008124 },
    { lat: 53.554986, lng: 10.007928 },
    { lat: 53.554775, lng: 10.006363 },
    { lat: 53.554674, lng: 10.006383 },
    { lat: 53.554473, lng: 10.006681 },
    { lat: 53.554363, lng: 10.006971 },
    { lat: 53.554453, lng: 10.008091 },
    { lat: 53.554424, lng: 10.008201 },
    { lat: 53.554473, lng: 10.008226 },
  ];

  function createTrackLine(curve: any) {
    const numPoints = 10 * curve.points.length;
    const curvePoints = curve.getSpacedPoints(numPoints);
    const positions = new Float32Array(numPoints * 3);

    for (let i = 0; i < numPoints; i++) {
      curvePoints[i].toArray(positions, 3 * i);
    }

    const trackLine = new Line2(
      new LineGeometry(),
      new LineMaterial({
        color: 0x40e0d0,
        linewidth: 5,
      })
    );

    trackLine.geometry.setPositions(positions);

    return trackLine;
  }

  async function loadCarModel() {
    const loader = new GLTFLoader();

    return new Promise((resolve) => {
      loader.load(
        "/src/muscle_car.glb",
        // "https://ubilabs.github.io/threejs-overlay-view/lowpoly-sedan.0f076009.glb",
        (gltf) => {
          const group = gltf.scene;
          // console.log("group :>> ", group);
          const carModel = group.getObjectByName("Sketchfab_model") || group;
          // console.log("carModel :>> ", carModel);
          // carModel?.scale.setScalar(0.05);
          carModel?.scale.setScalar(3);
          carModel?.rotation.set(0, 0, Math.PI, "ZXY");
          // carModel.rotation.set(Math.PI / 2, 0, Math.PI, "ZXY");
          resolve(group);
        }
      );
    });
  }

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
        // mapTypeId: "satellite",
        ...VIEW_PARAMS,
      }
    );

    // Add the overlay to the map.
    return map;
  }

  useEffect(() => {
    (async () => {
      const map = await initMap();
      const overlay = new ThreeJSOverlayView(VIEW_PARAMS.center);
      overlay.setMap(map);
      const scene = overlay.getScene();
      const points = ANIMATION_POINTS.map((p) => overlay.latLngAltToVector3(p));
      const curve = new CatmullRomCurve3(points, true, "catmullrom", 0.2);
      curve.updateArcLengths();

      const trackLine = createTrackLine(curve);
      scene.add(trackLine);

      let carModel: GLTF["scene"];
      loadCarModel().then((obj) => {
        carModel = obj as GLTF["scene"];
        scene.add(carModel);

        // since loading the car-model happened asynchronously, we need to
        // explicitly trigger a redraw.
        overlay.requestRedraw();
      });

      // the update-function will animate the car along the spline
      overlay.update = () => {
        trackLine.material.resolution.copy(overlay.getViewportSize());

        if (!carModel) return;

        const animationProgress =
          (performance.now() % ANIMATION_DURATION) / ANIMATION_DURATION;
        curve.getPointAt(animationProgress, carModel.position);
        curve.getTangentAt(animationProgress, tmpVec3);
        carModel.quaternion.setFromUnitVectors(CAR_FRONT, tmpVec3);

        overlay.requestRedraw();
      };
    })();
  }, [ANIMATION_POINTS, CAR_FRONT, VIEW_PARAMS.center, initMap, tmpVec3]);

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
      <div id="whell" />
    </div>
  );
}

export default App;
