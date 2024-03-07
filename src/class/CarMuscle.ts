import { Group, Object3D, Object3DEventMap } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Controller from "./Controller";
import CarGlb from "../assets/muscle_car.glb";

class CarMuscle {
  public carModel!: Group<Object3DEventMap>;
  public maxSpeed: number = 100;
  public speed: number = 0;
  public acceleration: number = 10;
  public turning: number = 0.05;
  public wheelTurning: number = 0.5;
  public wheelFrontLeft!: Object3D<Object3DEventMap> | undefined;
  public wheelFrontRight!: Object3D<Object3DEventMap> | undefined;
  public wheelBack!: Object3D<Object3DEventMap> | undefined;
  public ControllerCar!: Controller | undefined;
  public isControl: boolean = false;

  constructor(main?: boolean) {
    this.isControl = main || false;
  }

  setCar(car: Group<Object3DEventMap>) {
    this.carModel = car;
    if (this.isControl) this.ControllerCar = new Controller(this, car);
  }

  update() {
    if (this.isControl) this.ControllerCar?.update();
  }

  loadModel(): Promise<Group<Object3DEventMap>> {
    const loader = new GLTFLoader();

    return new Promise((resolve) => {
      loader.load(CarGlb, (gltf) => {
        const group = gltf.scene;
        const carModel = group.getObjectByName("Sketchfab_model") || group;
        carModel?.scale.setScalar(1);
        carModel?.rotation.set(0, 0, Math.PI, "ZXY");
        this.wheelFrontLeft = carModel?.getObjectByName("wheelBaseL_014");
        this.wheelFrontRight = carModel?.getObjectByName("wheelBaseR_017");
        this.wheelBack = carModel?.getObjectByName("wheels_013");
        resolve(group);
      });
    });
  }
}

export default CarMuscle;
