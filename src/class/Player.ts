/* eslint-disable @typescript-eslint/no-unused-vars */
import { Group, Object3DEventMap, Scene, Vector3 } from "three";
import ThreeJSOverlayView from "../lib/ThreeJSOverlayView";
import CarMuscle from "./CarMuscle";
import MapLabel from "../lib/MapLabel";

export default class Player {
  public id!: string;
  public name!: string;
  public car?: CarMuscle;
  public map: google.maps.Map;
  public overlay: ThreeJSOverlayView;
  protected scene: Scene;
  public isControl: boolean = false;
  public label: MapLabel | undefined;

  constructor(name: string, map: google.maps.Map, main?: boolean) {
    this.id = Math.floor(Math.random() * 10).toString();
    this.name = name || "Anonymous";
    this.map = map;
    this.isControl = main || false;

    const overlay = new ThreeJSOverlayView({
      lat: map.getCenter()?.lat() || 1,
      lng: map.getCenter()?.lng() || 1,
    });
    overlay.setMap(map);
    this.overlay = overlay;
    this.scene = overlay.getScene();
  }

  setCar(car: CarMuscle) {
    this.car = car;
  }

  remove() {
    const selectedObject = this.scene.getObjectByName(this.name);
    if (selectedObject) this.scene.remove(selectedObject);
    this.label?.onRemove();
  }

  async update(callbackLoop?: () => void) {
    const mapLabel = new MapLabel({
      text: this.name,
      map: this.map,
      fontSize: 20,
      align: "top",
    });
    this.label = mapLabel;
    const CarUser = new CarMuscle(this.isControl);
    const CarModel = await CarUser.loadModel();
    CarUser.setCar(CarModel);
    this.setCar(CarUser);
    CarModel.name = this.name;

    this.scene.add(CarModel);

    this.overlay.requestRedraw();

    this.overlay.update = () => {
      callbackLoop?.();
      if (!this.car?.carModel) return;
      CarUser.update();

      const coordinates = this.overlay.vector3ToLatLngAlt(
        CarUser.carModel?.position || new Vector3()
      );
      const zoomSpeed = Math.max(
        20,
        Math.min(21 - (CarUser.speed / 100) * (21 - 20), 21)
      );
      mapLabel.setPosition(coordinates);
      if (this.isControl) {
        this.map.moveCamera({
          center: coordinates,
          zoom: zoomSpeed,
        });
      }

      this.overlay.requestRedraw();
    };
  }
}
