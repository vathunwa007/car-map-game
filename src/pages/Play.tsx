/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getMapsApiOptions, loadMapsApi } from "../jsm/load-maps-api";
import "./Play.css";
import Player from "../class/Player";
import Controller from "../class/Controller";
import { Server, Socket, io } from "../server/sockets";
import { Vector3 } from "three";

function Play() {
  const [IServer, setIServer] = useState<Server | undefined>(undefined);

  const VIEW_PARAMS = {
    center: { lat: 53.554486, lng: 10.007479 },
    zoom: 21,
    heading: 40,
    tilt: 65,
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function initMap() {
    document.title = "CarMap-Multiplayer";
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

      // function convert_ToObject(classInstance: any) {
      //   const entries = Object.entries(classInstance);

      //   return Object.fromEntries(entries);
      // }

      // function mapToJSON(map: any) {
      //   const obj = {};

      //   map.forEach((value: any, key: any) => {
      //     obj[key] = value;
      //   });

      //   return JSON.stringify(obj);
      // }

      const clients = new Map<
        string,
        {
          socket: Socket;
          player: Player;
        }
      >();

      const getUpdate = () => {
        const playerValues = Array.from(clients.values()).map((v) => ({
          id: v.socket.id,
          position: v.player.car?.carModel.position,
          rotation: v.player.car?.carModel.rotation,
        }));
        return playerValues;
      };

      io()
        .then((socket) => {
          const UserPlayer = new Player(socket.id, map, true);
          UserPlayer.update();
          console.log("socketClient :>> ", socket);
          socket.on("disconnect", () => {
            console.error("connection got interrupt");
          });
          socket.on("connectPlayer", (py) => {
            const player: Array<{ id: string; player: string }> =
              JSON.parse(py);
            player.forEach((player) => {
              clients.set(socket.id, {
                socket: socket,
                player: new Player(player.player, map, false),
              });
            });
            Array.from(clients.values()).forEach((cli) => {
              if (cli.player.id !== socket.id) {
                cli.player.update();
              }
            });
          });

          socket.on("update_location", (data) => {
            const dataPlayer = data.filter(
              (player: any) => player.id !== socket.id
            );

            dataPlayer.map((player: any) => {
              clients
                .get(player.id)
                ?.player.car?.carModel.rotation.set(
                  dataPlayer.rotation._x,
                  dataPlayer.rotation._y,
                  dataPlayer.rotation._z
                );
              clients
                .get(player.id)
                ?.player.car?.carModel.position.set(
                  dataPlayer.position.x,
                  dataPlayer.position.y,
                  dataPlayer.position.z
                );
            });
          });
          UserPlayer.update(() => {
            socket.emit("location", {
              position: UserPlayer.car?.carModel.position,
              rotation: UserPlayer.car?.carModel.rotation,
            });
          });
        })
        .catch(() => {
          const server = new Server(
            async (serv) => {
              const Server = await serv;
              // setIServer(Server);
              console.log("Server :>> ", Server);
              const UserPlayer = new Player(Server.code, map, true);
              UserPlayer.update();
            },
            (socket, serv) => {
              clients.set(socket.id, {
                socket: socket,
                player: new Player(socket.id, map, false),
              });
              serv.emit = (event_name: string, args?: any) => {
                for (const xsocket of Array.from(clients.values()).map(
                  (v) => v.socket
                )) {
                  xsocket.emit(event_name, args);
                }
              };
              Array.from(clients.values()).forEach((cli) => {
                cli.player.update();
              });

              const newMap = Array.from(clients.values()).map((v) => ({
                id: v.socket.id,
                player: v.player.id,
              }));
              newMap.push({
                id: serv.code,
                player: serv.code,
              });
              serv.emit("connectPlayer", JSON.stringify(newMap));

              socket.on("connectPlayer", (lc) => {
                console.log("connectPlayer", lc);
              });

              socket.on("location", ({ position, rotation }) => {
                clients
                  .get(socket.id)
                  ?.player.car?.carModel.rotation.set(
                    rotation._x,
                    rotation._y,
                    rotation._z
                  );
                clients
                  .get(socket.id)
                  ?.player.car?.carModel.position.set(
                    position.x,
                    position.y,
                    position.z
                  );
                serv.emit("update_location", getUpdate());
              });
              // const a = convert_ToObject(UserPlayer);
              // console.log("a :>> ", a.toString());
            }
          );
        });
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

export default Play;
