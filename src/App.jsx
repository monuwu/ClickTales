import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Camera, Instagram, X, Sun, Moon } from "lucide-react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, storage } from "./lib/firebase";
import { Button } from "./components/ui/button";
import PhotoBooth from "./components/PhotoBooth"; // ✅ Camera Component
import WebcamCapture from "./components/WebcamCapture";
import { QRCode } from "qrcode.react";

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
    <motion.div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/80 z-50">
      <motion.span
        key={count}
        className="text-9xl font-extrabold text-orange-400 drop-shadow-lg"
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

// ===== Slideshow Component =====
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
    <motion.div className="flex-1 flex items-center justify-center rounded-xl overflow-hidden shadow-xl"
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

// ===== Hero Section =====
function Hero({ onStart }) {
  return (
    <section className="bg-[#2b261d] text-white border border-orange-500 p-10 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex-1">
        <h1 className="text-5xl font-extrabold text-orange-400 mb-4 leading-tight">
          Who has a <span className="text-white">special look</span>?
        </h1>
        <p className="text-md text-white/80 mb-6">
          Celebrate World Photography Day with ClickTales. Capture, share, and stand out!
        </p>
        <Button
          size="lg"
          onClick={onStart}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-6 py-3 shadow-lg"
        >
          Start Photobooth
        </Button>
      </div>
      <Slideshow />
    </section>
  );
}

// ===== Features Section =====
function Features() {
  const features = [
    { title: "Live Filters", desc: "Real-time filters and effects.", icon: <Camera className="text-orange-400" /> },
    { title: "Instant Share", desc: "Post to social media in one tap.", icon: <Instagram className="text-pink-500" /> },
    { title: "Cloud Gallery", desc: "Securely store your memories.", icon: <X className="text-blue-400" /> },
  ];

  return (
    <section className="my-16 px-6 grid md:grid-cols-3 gap-8">
      {features.map((feat, idx) => (
        <motion.div
          key={idx}
          className="bg-[#2b261d] border border-white/10 p-6 rounded-2xl text-white shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: idx * 0.2 }}
        >
          <div className="mb-4">{feat.icon}</div>
          <h3 className="text-xl font-bold text-orange-400">{feat.title}</h3>
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
      <h2 className="text-3xl font-extrabold text-white mb-8">What people say</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            className="bg-[#2b261d] border border-white/10 p-6 rounded-xl text-white shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <p className="text-white/80 italic">"{t.feedback}"</p>
            <p className="mt-4 font-bold text-orange-300">{t.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ===== Call to Action =====
function CallToAction() {
  return (
    <section className="my-20 px-6 text-center bg-orange-500 p-12 rounded-3xl shadow-xl text-white">
      <h2 className="text-3xl font-extrabold mb-4">Ready to Capture the Moment?</h2>
      <p className="mb-6 text-white/90">Try ClickTales now and experience the magic!</p>
      <Button className="bg-white text-orange-600 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-white/90">
        Get Started
      </Button>
    </section>
  );
}

// ===== Home Page Composition =====
function HomePage({ dark, setDark }) {
  const [startBooth, setStartBooth] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleStart = () => {
    setStartBooth(true);
    setTimeout(() => {
      setStartBooth(false);
      setShowCamera(true);
    }, 3000);
  };

  return (
    <>
      {startBooth && <Countdown onComplete={() => {}} />}
      {showCamera && <PhotoBooth onClose={() => setShowCamera(false)} />}
      <Hero onStart={handleStart} />
      <Features />
      <Testimonials />
      <CallToAction />
    </>
  );
}

const GalleryPage = () => (
  <div className="text-white text-center bg-[#2b261d] p-16 rounded-3xl shadow-xl">
    <h1 className="text-3xl font-bold text-orange-400 mb-4">Gallery</h1>
    <p>Gallery coming soon!</p>
  </div>
);

const AboutPage = () => (
  <div className="text-white text-center bg-[#2b261d] p-16 rounded-3xl shadow-xl">
    <h1 className="text-3xl font-bold text-orange-400 mb-4">About Us</h1>
    <p>We are passionate about capturing your special moments.</p>
  </div>
);

function BoothPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#2b261d] text-white">
      <h1 className="text-4xl font-bold mb-6">Photo Booth</h1>
      <WebcamCapture />
    </div>
  );
}

// ===== Layout & Footer =====
function Layout({ children, dark, setDark, user, onLogout }) {
  return (
    <div className={`${dark ? 'dark' : ''}`}>
      <div className="bg-[#1a1a1a] text-white min-h-screen flex flex-col">
        <header className="w-full bg-[#2b261d] text-white py-4 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-orange-400" />
            <span className="font-bold text-lg">ClickTales</span>
          </div>
          <nav className="flex gap-6 items-center">
            <Link to="/" className="hover:text-orange-400">Home</Link>
            <Link to="/gallery" className="hover:text-orange-400">Gallery</Link>
            <Link to="/about" className="hover:text-orange-400">About</Link>
            {user && (
              <button onClick={onLogout} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full">
                Logout
              </button>
            )}
            <DarkModeToggle dark={dark} setDark={setDark} />
          </nav>
        </header>
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

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

function Footer() {
  return (
    <footer className="mt-16 py-8 bg-[#2b261d] text-white rounded-t-3xl shadow-inner flex flex-col md:flex-row items-center justify-between px-8">
      <div className="flex items-center gap-2">
        <Camera className="w-6 h-6 text-orange-400" />
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
      <div className="mt-4 md:mt-0 text-sm text-white/70">
        &copy; {new Date().getFullYear()} ClickTales. All rights reserved.
      </div>
    </footer>
  );
}

// ===== App Entry =====
function App() {
  const [dark, setDark] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
          <Route path="/booth" element={<BoothPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
