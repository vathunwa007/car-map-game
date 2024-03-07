/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { getMapsApiOptions, loadMapsApi } from "../jsm/load-maps-api";
import "./Play.css";
import Player from "../class/Player";
import Controller from "../class/Controller";
import { Server, Socket, io } from "../server/sockets";

function Play() {
  const VIEW_PARAMS = {
    // center: { lat: 53.554486, lng: 10.007479 },
    center: { lat: 13.7640367, lng: 100.5472515 },
    zoom: 23,
    heading: 10,
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
        // disableDefaultUI: true,
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
      const UserPlayer = new Player("Anonymouse", map, true);
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
        playerValues.push({
          id: UserPlayer.name,
          position: UserPlayer.car?.carModel.position,
          rotation: UserPlayer.car?.carModel.rotation,
        });
        return playerValues;
      };

      io()
        .then((socket) => {
          UserPlayer.name = socket.id.slice(0, 5);
          console.log("socketClient :>> ", socket);
          socket.on("disconnect", () => {
            console.error("connection got interrupt");
          });
          socket.on("connectPlayer", (py) => {
            const player: Array<{ id: string; player: string }> =
              JSON.parse(py);
            player.forEach((player) => {
              if (player.id !== UserPlayer.name) {
                clients.set(player.id, {
                  socket: socket,
                  player: new Player(player.id, map, false),
                });
              }
            });
            Array.from(clients.values()).forEach((cli) => {
              if (cli.player.name !== UserPlayer.name) {
                cli.player.update();
              }
            });
          });

          socket.on("update_location", (data) => {
            const dataPlayer = data.filter(
              (player: any) => player.id !== socket.id
            );
            dataPlayer.forEach((player: any) => {
              clients
                .get(player?.id)
                ?.player.car?.carModel.rotation.set(
                  player.rotation._x,
                  player.rotation._y,
                  player.rotation._z
                );
              clients
                .get(player?.id)
                ?.player.car?.carModel.position.set(
                  player.position.x,
                  player.position.y,
                  player.position.z
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
          new Server(
            async (serv: Server) => {
              const Server = await serv;
              // setIServer(Server);
              console.log("Server :>> ", Server);
              UserPlayer.name = "HostMapPlayer";
              UserPlayer.update();

              setInterval(() => {
                Array.from(clients.values()).forEach((client) => {
                  if (!client.socket.isOnline()) {
                    client.player.remove();
                    clients.delete(client.socket.id);
                  }
                });
              }, 5000);
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

              socket.on("disconnect", () => {
                const sId = socket.id;
                clients.delete(sId);
              });
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
