import { Group, Object3DEventMap } from "three";

export default class Player {
  public id!: string;
  public name!: string;
  public car?: Group<Object3DEventMap>;
  public map: google.maps.Map;

  constructor(
    name: string,
    map: google.maps.Map,
    car?: Group<Object3DEventMap>
  ) {
    this.id = Math.floor(Math.random() * 10).toString();
    this.name = name || "Anonymous";
    this.car = car;
    this.map = map;
  }

  setCar(car: Group<Object3DEventMap>) {
    this.car = car;
  }

  update() {}
}
