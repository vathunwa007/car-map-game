import { useEffect, useState } from "react";
import { CarSteeringWheel } from "./styles";
import { isHotkeyPressed } from "react-hotkeys-hook";
import { PropsControler } from "./types";

function Controler({ onWheelRotate }: PropsControler) {
  const [rotateWheel, setrotateWheel] = useState(0);

  useEffect(() => {
    function mainLoop() {
      if (isHotkeyPressed("left")) {
        rotateWheel > -440 && setrotateWheel((ct) => (ct -= 73.3));
      }
      if (isHotkeyPressed("right")) {
        rotateWheel < 440 && setrotateWheel((ct) => (ct += 73.3));
      }
      if (isHotkeyPressed("up") || isHotkeyPressed("down")) {
        if (!isHotkeyPressed("left") && !isHotkeyPressed("right")) {
          rotateWheel > 0
            ? setrotateWheel(rotateWheel - 48.8 <= 0 ? 0 : rotateWheel - 48.8)
            : setrotateWheel(rotateWheel + 48.8 >= 0 ? 0 : rotateWheel + 48.8);
        }
      }
      onWheelRotate?.((rotateWheel * 100) / 440);
    }

    const loop = setInterval(mainLoop, 30);

    return () => {
      clearInterval(loop);
    };
  }, [rotateWheel]);

  return <CarSteeringWheel rotateTions={rotateWheel} />;
}

export default Controler;
