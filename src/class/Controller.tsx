import { Group, Object3DEventMap } from "three";
import CarMuscle from "./CarMuscle";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { Component } from "react";
import CarSteering from "../components/carSteering/CarSteering";

class Controller extends Component {
  public CarUser: CarMuscle;
  public CarModel: Group<Object3DEventMap>;
  public rotateWheel: number = 0;
  public rotateWheelValue: number = 0;

  constructor(CarUser: CarMuscle, CarModel: Group<Object3DEventMap>) {
    super({});

    this.CarUser = CarUser;
    this.CarModel = CarModel;
    const mainLoop = () => {
      if (isHotkeyPressed("left")) {
        this.rotateWheel > -440 && (this.rotateWheel -= 55);
      }
      if (isHotkeyPressed("right")) {
        this.rotateWheel < 440 && (this.rotateWheel += 55);
      }
      if (this.CarUser.speed > 1) {
        if (!isHotkeyPressed("left") && !isHotkeyPressed("right")) {
          this.rotateWheel > 0
            ? (this.rotateWheel =
                this.rotateWheel - (this.CarUser.speed * 44) / 100 <= 0
                  ? 0
                  : this.rotateWheel - (this.CarUser.speed * 44) / 100)
            : (this.rotateWheel =
                this.rotateWheel + (this.CarUser.speed * 44) / 100 >= 0
                  ? 0
                  : this.rotateWheel + (this.CarUser.speed * 44) / 100);
        }
      } else if (this.CarUser.speed < 1) {
        if (!isHotkeyPressed("left") && !isHotkeyPressed("right")) {
          this.rotateWheel > 0
            ? (this.rotateWheel =
                this.rotateWheel + (this.CarUser.speed * 44) / 100 <= 0
                  ? 0
                  : this.rotateWheel + (this.CarUser.speed * 44) / 100)
            : (this.rotateWheel =
                this.rotateWheel - (this.CarUser.speed * 44) / 100 >= 0
                  ? 0
                  : this.rotateWheel - (this.CarUser.speed * 44) / 100);
        }
      }
      this.rotateWheelValue = (this.rotateWheel * 100) / 440;
    };
    setInterval(mainLoop, 30);
  }
  calculateRadiusValue(
    speed: number,
    min: number,
    max: number,
    speedMax: number
  ) {
    const cal = (max - min) * (speed / speedMax) + min;
    return cal > max ? max : cal;
  }

  getRotateWheel() {
    return this.rotateWheel;
  }

  update() {
    const wheel = document?.getElementById("car-steering");
    if (wheel) {
      wheel.style.transform = `scale(1) rotate(${this.rotateWheel}deg)`;
    }

    this.CarModel?.translateY((this.CarUser.speed * 1) / this.CarUser.maxSpeed); //เดินรถไปข้างหน้าตามความเร็ว
    //เลี้ยวรถตอนเดินหน้ากับถอยหลัง
    if (this.CarUser.speed > 1) {
      this.CarModel?.rotateZ(
        (-this.rotateWheelValue *
          this.calculateRadiusValue(
            this.CarUser.speed,
            0.01,
            0.05,
            this.CarUser.maxSpeed
          )) /
          100
      );
    } else if (this.CarUser.speed < -1) {
      this.CarModel?.rotateZ(
        (this.rotateWheelValue *
          this.calculateRadiusValue(
            -this.CarUser.speed,
            0.01,
            0.05,
            this.CarUser.maxSpeed
          )) /
          100
      );
    }
    //เดินหน้า
    if (isHotkeyPressed("up")) {
      if (this.CarUser.speed < this.CarUser.maxSpeed)
        this.CarUser.speed += (this.CarUser.acceleration * 1) / 100;

      this.CarUser?.wheelFrontLeft?.rotateX(10);
      this.CarUser?.wheelBack?.rotateX(10);
      this.CarUser?.wheelFrontRight?.rotateX(10);
    } else {
      if (this.CarUser.speed > 0) this.CarUser.speed -= 0.5;
    }
    //ถอยหลัง
    if (isHotkeyPressed("down")) {
      if (this.CarUser.speed > 0) {
        this.CarUser.speed -= 5;
      } else {
        this.CarUser.speed -= (this.CarUser.acceleration * 1) / 100;
      }
      this.CarUser?.wheelFrontLeft?.rotateX(-10);
      this.CarUser?.wheelBack?.rotateX(-10);
      this.CarUser?.wheelFrontRight?.rotateX(-10);
    } else {
      if (this.CarUser.speed < 0) this.CarUser.speed += 0.5;
    }

    // หมุนล้อตามพวงมาลัย
    this.CarUser?.wheelFrontLeft?.rotation.set(
      0,
      -(this.rotateWheelValue * this.CarUser.wheelTurning) / 100,
      0,
      "ZXY"
    );
    this.CarUser?.wheelFrontRight?.rotation.set(
      0,
      -(this.rotateWheelValue * this.CarUser.wheelTurning) / 100,
      0,
      "ZXY"
    );
  }

  render() {
    return <CarSteering />;
  }
}

export default Controller;
