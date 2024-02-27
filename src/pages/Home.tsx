import { useEffect } from "react";
import { Server } from "../server/sockets";

function Home() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    (async () => {
      const server = new Server(
        (serv) => {
          console.log("serv1 :>> ", serv);
        },
        (socket, serv) => {
          console.log("socket :>> ", socket);
          console.log("serv2 :>> ", serv);

          socket.on("location", (lc) => {
            console.log("location", lc);
          });
          socket.emit("location", "haha");
        }
      );
      console.log("server :>> ", server);
    })();
  }, []);

  return <div>Home</div>;
}

export default Home;
