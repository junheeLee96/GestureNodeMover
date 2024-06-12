import {
  DrawingUtils,
  FilesetResolver,
  GestureRecognizer,
  GestureRecognizerOptions,
} from "@mediapipe/tasks-vision";
import React, { useEffect, useRef } from "react";

const runningMode: "IMAGE" | "VIDEO" = "VIDEO"; // or '
const videoHeight: string = "360px";
const videoWidth: string = "480px";
const model_2 = "/model_2.task";
const model_type_2 = "/model_type_2.task";
const model_type_3 = "/model_type_3.task";
const model_type_4 = "/model_type_4.task";
const model_type_5 = "/model_type_5.task";
const model_type_6 = "/model_type_6.task";
const model_type_7 = "/model_type_7.task";
const model_type_8 = "/model_type_8.task";

const categoryNames = ["move", "pick"];

const Gesture = () => {
  const videoRef = useRef<any>(null);
  const lastVideoTime = useRef<any>(1);
  const results = useRef<any>(null);
  const gestureRecognizer = useRef<any>(null);
  const gestureOutput = useRef<any>(null);

  const canvasRef = useRef<any>(null);
  const ctxRef = useRef<any>(null);

  const dispatherEvent = (gesture: any) => {
    if (gesture.gestures.length === 0) return;
    if (!categoryNames.includes(gesture.gestures[0][0].categoryName)) return;
    const eventEmitter = new CustomEvent("gestured", {
      detail: gesture,
    });
    window.dispatchEvent(eventEmitter);
  };

  const predictWebcam = async () => {
    let nowInMs = Date.now();
    if (videoRef.current.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = videoRef.current.currentTime;
      results.current = gestureRecognizer.current.recognizeForVideo(
        videoRef.current,
        nowInMs
      );
    }
    ctxRef.current.save();
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const drawingUtils = new DrawingUtils(ctxRef.current);

    canvasRef.current.style.height = videoHeight;
    canvasRef.current.style.wdith = videoWidth;
    videoRef.current.style.height = videoHeight;
    videoRef.current.style.width = videoWidth;
    // console.log(results.current);
    dispatherEvent(results.current);

    //draw fingers
    if (results.current.landmarks) {
      for (const landmarks of results.current.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          GestureRecognizer.HAND_CONNECTIONS,
          {
            color: "#00FF00",
            lineWidth: 5,
          }
        );
        drawingUtils.drawLandmarks(landmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }
    }

    ctxRef.current.restore();
    requestAnimationFrame(predictWebcam);
  };

  async function getStream() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream: any) => {
      videoRef.current.srcObject = stream;
    });
  }
  async function initializeObjectDetector() {
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    gestureRecognizer.current = await GestureRecognizer.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath: model_type_8,
          // "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
          // "../app/shared/models/custom_gesture_recognizer.task",
          delegate: "GPU",
        },
        runningMode,
        numHands: 2,
      }
    );

    getStream();
  }

  useEffect(() => {
    initializeObjectDetector();
    canvasRef.current.width = 480;
    canvasRef.current.height = 360;
    ctxRef.current = canvasRef.current.getContext("2d");
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        zIndex: "99",
        bottom: "0",
        right: "0",
        background: "red",
        width: "480px",
        height: "360px",
      }}
    >
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ position: "absolute", top: "0", left: "0" }}
          onLoadedData={predictWebcam}
        />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: "0", left: "0" }}
        />
        <p
          ref={gestureOutput}
          style={{ position: "absolute", top: "0", left: "0" }}
        />
      </div>
    </div>
  );
};

export default Gesture;
