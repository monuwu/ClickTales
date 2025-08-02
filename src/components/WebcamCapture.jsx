import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase"; // adjust path if needed

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const maxPhotos = 30;

  // Load existing session photo count from localStorage
  useEffect(() => {
    const storedPhotos = JSON.parse(localStorage.getItem("clicktales_photos")) || [];
    setCapturedPhotos(storedPhotos);
  }, []);

  const capture = async () => {
    if (capturedPhotos.length >= maxPhotos) {
      alert("You've reached the 30 photo limit for this session.");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) return;

    try {
      // Upload image to Firebase Storage
      const filename = `clicktales_${Date.now()}.jpg`;
      const imageRef = ref(storage, `uploads/${filename}`);
      const blob = await fetch(imageSrc).then(res => res.blob());
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      // Save metadata to Firestore
      await addDoc(collection(db, "photos"), {
        url: downloadURL,
        timestamp: serverTimestamp(),
        sessionId: "anonymous" // You can replace this with a userID or QR session value
      });

      const updatedPhotos = [...capturedPhotos, downloadURL];
      setCapturedPhotos(updatedPhotos);
      localStorage.setItem("clicktales_photos", JSON.stringify(updatedPhotos));

      alert("Photo captured & uploaded!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload. Try again.");
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={300}
        className="rounded-xl shadow-md"
      />
      <button
        onClick={capture}
        disabled={capturedPhotos.length >= maxPhotos}
        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
      >
        Capture ({capturedPhotos.length} / {maxPhotos})
      </button>
    </div>
  );
};

export default WebcamCapture;
