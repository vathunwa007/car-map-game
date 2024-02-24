import styled from "@emotion/styled";

export const CarSteeringWheel = styled.div`
  position: absolute;
  width: 200px;
  height: 200px;
  background-image: url(https://korinvr.com/bin/drivingsimulatorgm/28/assets/steering.png);
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  user-select: none;
  z-index: 100;
  right: 60px;
  bottom: 60px;
  transition: 200ms linear all;
  transform: scale(1) rotate(0deg);
`;
