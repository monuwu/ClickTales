// src/pages/LoginPage.js
import React from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { Button } from "../components/ui/button";

function LoginPage() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="text-white flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-3xl font-bold mb-6">Login with Google</h2>
      <Button onClick={handleLogin} className="bg-white text-black font-bold px-6 py-3 rounded-full shadow-lg hover:bg-gray-200">
        Sign In with Google
      </Button>
    </div>
  );
}

export default LoginPage;
