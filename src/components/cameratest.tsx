import Webcam from "react-webcam";

export default () => (
  <Webcam
    audio={false}
    screenshotFormat="image/jpeg"
    videoConstraints={{ width: 640, height: 480 }}
  />
);