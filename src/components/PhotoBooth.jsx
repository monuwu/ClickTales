import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import WebcamCapture from "./WebcamCapture";

function App() {
  const [isPhotoBoothOpen, setPhotoBoothOpen] = useState(false);

  const openPhotoBooth = () => {
    setPhotoBoothOpen(true);
  };

  const closePhotoBooth = () => {
    setPhotoBoothOpen(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-4xl font-bold">
          Welcome to the Photo Booth App
        </h1>
        <button
          onClick={openPhotoBooth}
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-full shadow hover:bg-blue-600"
        >
          Open Photo Booth
        </button>
      </header>

      {isPhotoBoothOpen && <PhotoBooth onClose={closePhotoBooth} />}
    </div>
  );
}

export default App;

export function BoothPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h2 className="text-3xl font-bold text-purple-600 mb-4">Photo Booth</h2>
      <WebcamCapture />
    </div>
  );
}
