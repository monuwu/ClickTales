// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Camera, Instagram, X, Sun, Moon } from "lucide-react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// ===== Hero Section with Slideshow =====
function Slideshow() {
  const images = ["/img/slide1.jpg", "/img/slide2.jpg", "/img/slide3.jpg"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="flex-1 flex items-center justify-center rounded-xl overflow-hidden shadow-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.img
        key={index}
        src={images[index]}
        alt="Slideshow"
        className="w-96 h-64 object-cover rounded-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
    </motion.div>
  );
}

function Hero({ onStart }) {
  return (
    <section className="backdrop-blur-lg bg-white/10 border border-white/20 flex flex-col md:flex-row items-center justify-between px-8 py-16 rounded-3xl shadow-xl mb-8">
      <div className="flex-1">
        <h1 className="text-5xl font-extrabold text-white mb-4">Snap. Smile. Share.</h1>
        <p className="text-lg text-white/80 mb-6">
          The fun, fast, and friendly way to capture and share your best moments. Try filters, frames, and share instantly!
        </p>
        <Button size="lg" onClick={onStart} className="bg-white/80 text-indigo-700 font-bold rounded-full px-8 py-3 shadow-lg hover:bg-white">
          Start Photobooth
        </Button>
      </div>
      <Slideshow />
    </section>
  );
}

// ===== Countdown Overlay =====
function Countdown({ seconds = 3, onComplete }) {
  const [count, setCount] = useState(seconds);
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 700);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);
  return (
    <motion.div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/60 z-50">
      <motion.span
        key={count}
        className="text-8xl font-extrabold text-white drop-shadow-lg"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {count > 0 ? count : null}
      </motion.span>
    </motion.div>
  );
}

// ===== Feature Section =====
function Features() {
  const features = [
    { title: "Live Filters", desc: "Real-time filters and effects.", icon: <Camera className="text-indigo-500" /> },
    { title: "Instant Share", desc: "Post to social media in one tap.", icon: <Instagram className="text-pink-500" /> },
    { title: "Cloud Gallery", desc: "Securely store your memories.", icon: <X className="text-blue-400" /> },
  ];
  return (
    <section className="my-16 px-6 grid md:grid-cols-3 gap-8">
      {features.map((feat, idx) => (
        <motion.div
          key={idx}
          className="bg-white/10 p-6 rounded-2xl backdrop-blur shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: idx * 0.2 }}
        >
          <div className="mb-4">{feat.icon}</div>
          <h3 className="text-xl font-bold">{feat.title}</h3>
          <p className="text-white/70">{feat.desc}</p>
        </motion.div>
      ))}
    </section>
  );
}

// ===== Testimonials =====
function Testimonials() {
  const testimonials = [
    { name: "Jane Doe", feedback: "Such a fun experience! Love the filters!" },
    { name: "Mike Smith", feedback: "Perfect for parties and events!" },
    { name: "Lisa Ray", feedback: "ClickTales made our wedding extra special." },
  ];
  return (
    <section className="my-16 px-6 text-center">
      <h2 className="text-3xl font-extrabold mb-8">What people say</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            className="bg-white/10 p-6 rounded-xl backdrop-blur shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <p className="text-white/80 italic">"{t.feedback}"</p>
            <p className="mt-4 font-bold">{t.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ===== CTA Section =====
function CallToAction() {
  return (
    <section className="my-20 px-6 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-12 rounded-3xl shadow-xl text-white">
      <h2 className="text-3xl font-extrabold mb-4">Ready to Capture the Moment?</h2>
      <p className="mb-6 text-white/90">Try ClickTales now and experience the magic!</p>
      <Button className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-white/90">
        Get Started
      </Button>
    </section>
  );
}

// ===== HomePage =====
function HomePage({ dark, setDark }) {
  const [startBooth, setStartBooth] = useState(false);
  const handleStart = () => {
    setStartBooth(true);
    setTimeout(() => setStartBooth(false), 3000);
  };

  return (
    <>
      {startBooth && <Countdown onComplete={() => alert("Photo Taken!")} />}
      <Hero onStart={handleStart} />
      <Features />
      <Testimonials />
      <CallToAction />
    </>
  );
}

// ===== Placeholder Pages =====
const GalleryPage = () => <div className="text-white text-center">Gallery coming soon!</div>;
const AboutPage = () => <div className="text-white text-center">About us content coming soon!</div>;

// ===== Layout =====
function Layout({ children, dark, setDark, user, onLogout }) {
  return (
    <div className={`dark bg-gray-900 text-white min-h-screen flex flex-col transition-colors duration-500`}>
      <header className="w-full backdrop-blur-sm bg-white/10 border-b border-white/20 text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6" />
          <span className="font-bold text-lg">ClickTales</span>
        </div>
        <nav className="flex gap-6 items-center">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/gallery" className="hover:underline">Gallery</Link>
          <Link to="/about" className="hover:underline">About</Link>
          {user && (
            <button onClick={onLogout} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full">
              Logout
            </button>
          )}
          <DarkModeToggle dark={dark} setDark={setDark} />
        </nav>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 transition-all duration-500 ease-in-out">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// ===== Dark Mode Toggle =====
function DarkModeToggle({ dark, setDark }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      className="ml-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition"
      aria-label="Toggle dark mode"
    >
      {dark ? <Moon className="text-yellow-300" /> : <Sun className="text-yellow-400" />}
      <span className="text-sm">{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

// ===== Footer =====
function Footer() {
  return (
    <footer className="mt-16 py-8 backdrop-blur-lg bg-white/10 text-white rounded-t-3xl shadow-inner flex flex-col md:flex-row items-center justify-between px-8">
      <div className="flex items-center gap-2">
        <Camera className="w-6 h-6" />
        <span className="font-bold text-lg">ClickTales</span>
      </div>
      <div className="flex gap-4 mt-4 md:mt-0">
        <a href="https://instagram.com/yourprofile" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
          <Instagram />
        </a>
        <a href="https://wa.me/your-number" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
          <WhatsappLogo />
        </a>
        <a href="https://x.com/yourprofile" aria-label="X" target="_blank" rel="noopener noreferrer">
          <X />
        </a>
      </div>
      <div className="mt-4 md:mt-0 text-sm">
        &copy; {new Date().getFullYear()} ClickTales. All rights reserved.
      </div>
    </footer>
  );
}

// ===== Main App =====
function App() {
  const [dark, setDark] = useState(true); // 🌑 Dark mode by default
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log("Auth state changed:", currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Router>
      <Layout dark={dark} setDark={setDark} user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<HomePage dark={dark} setDark={setDark} />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
