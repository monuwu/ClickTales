import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Carousel } from "./components/ui/carousel";
import { Switch } from "./components/ui/switch";
import { Camera, Instagram, X, HelpCircle, Sun, Moon } from "lucide-react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Webcam from "react-webcam";

// --- Hero Section ---
function Hero({ onStart }) {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-300 rounded-3xl shadow-xl mb-8">
      <div className="flex-1">
        <h1 className="text-5xl font-extrabold text-white mb-4">Snap. Smile. Share.</h1>
        <p className="text-lg text-white/80 mb-6">
          The fun, fast, and friendly way to capture and share your best moments. Try filters, frames, and share instantly!
        </p>
        <Button size="lg" onClick={onStart} className="bg-white text-indigo-600 font-bold rounded-full px-8 py-3 shadow-lg hover:bg-indigo-100 transition">
          Start Photobooth
        </Button>
      </div>
      <motion.div
        className="flex-1 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Camera className="w-32 h-32 text-white drop-shadow-lg" />
      </motion.div>
    </section>
  );
}

// --- Countdown ---
function Countdown({ seconds = 3, onComplete }) {
  const [count, setCount] = useState(seconds);
  React.useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 700);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        key={count}
        className="text-8xl font-extrabold text-white"
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

// --- Camera Preview ---
function CameraPreview({ onCapture, filter }) {
  const webcamRef = React.useRef(null);
  const [captured, setCaptured] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCaptured(imageSrc);
  };

  // Handler for the Capture button
  const handleCaptureClick = () => {
    setShowCountdown(true);
  };

  // When countdown completes, take the picture
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    capture();
  };

  return (
    <Card className="p-6 flex flex-col items-center bg-white rounded-2xl shadow-lg">
      {/* Countdown seconds selector */}
      {!captured && !showCountdown && (
        <div className="mb-4 flex items-center gap-2">
          <span className="font-semibold">Timer:</span>
          <select
            value={countdownSeconds}
            onChange={e => setCountdownSeconds(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={3}>3s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
          </select>
        </div>
      )}
      {showCountdown && <Countdown seconds={countdownSeconds} onComplete={handleCountdownComplete} />}
      {!captured && !showCountdown ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className={`rounded-xl shadow-lg ${filter}`}
            width={320}
            height={240}
          />
          <Button className="mt-6" onClick={handleCaptureClick}>
            Capture
          </Button>
        </>
      ) : captured ? (
        <>
          <img src={captured} alt="Captured" className={`rounded-xl shadow-lg ${filter}`} width={320} height={240} />
          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={() => setCaptured(null)}>
              Retake
            </Button>
            <Button onClick={() => onCapture(captured)}>
              Use Photo
            </Button>
          </div>
        </>
      ) : null}
    </Card>
  );
}

// --- Filters & Frames Carousel ---
function FiltersCarousel({ selected, onSelect }) {
  const filters = [
    { name: "None", class: "" },
    { name: "Sepia", class: "filter sepia" },
    { name: "B&W", class: "filter grayscale" },
    { name: "Vibrant", class: "filter saturate-200" },
    { name: "Birthday", class: "border-4 border-pink-400" },
    { name: "Travel", class: "border-4 border-blue-400" },
  ];
  return (
    <Carousel className="w-full flex gap-4 py-4 overflow-x-auto">
      {filters.map((f) => (
        <Card
          key={f.name}
          className={`p-2 rounded-xl cursor-pointer transition border-2 ${selected === f.class ? "border-indigo-500" : "border-transparent"}`}
          onClick={() => onSelect(f.class)}
        >
          <div className={`w-16 h-16 bg-gray-200 rounded-lg ${f.class}`}></div>
          <div className="text-xs text-center mt-2">{f.name}</div>
        </Card>
      ))}
    </Carousel>
  );
}

// --- Timeline / How it Works ---
function Timeline() {
  const steps = [
    { icon: <Camera />, title: "Allow Camera Access" },
    { icon: <Camera />, title: "Capture Image" },
    { icon: <Instagram />, title: "Apply Filter / Frame" },
    { icon: <X />, title: "Save / Share" },
  ];
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">How it Works</h2>
      <div className="flex flex-col md:flex-row gap-6">
        {steps.map((step, idx) => (
          <Card key={idx} className="flex items-center gap-4 p-4 rounded-xl shadow-md bg-white">
            <div className="bg-indigo-100 p-2 rounded-full">{step.icon}</div>
            <span className="font-semibold">{step.title}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}

// --- Gallery ---
function Gallery({ images }) {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Your Photos</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <Card key={idx} className="relative rounded-xl overflow-hidden shadow-lg">
            <img src={img} alt={`Captured ${idx}`} className="w-full h-32 object-cover" />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button size="sm" variant="ghost">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button size="sm" variant="ghost">
                <WhatsappLogo className="w-5 h-5" />
              </Button>
              <Button size="sm" variant="ghost">
                <X className="w-5 h-5" />
              </Button>
              <Button size="sm" variant="ghost" as="a" href={img} download>
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

// --- Progress Bar / Loader ---
function Loader({ loading }) {
  return loading ? (
    <motion.div
      className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-400 to-purple-400"
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
    />
  ) : null;
}

// --- Floating Action Button ---
function FAB({ onClick, tooltip }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        className="bg-indigo-600 text-white rounded-full p-4 shadow-lg flex items-center"
        onClick={onClick}
        aria-label={tooltip}
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>
      <span className="absolute bottom-16 right-0 bg-black text-white text-xs rounded px-2 py-1">{tooltip}</span>
    </div>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer className="mt-16 py-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-3xl shadow-lg flex flex-col md:flex-row items-center justify-between px-8">
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
      <div className="mt-4 md:mt-0">
        &copy; {new Date().getFullYear()} ClickTales. All rights reserved.
      </div>
    </footer>
  );
}

// --- Dark Mode Toggle ---
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

// --- Layout ---
function Layout({ children, dark, setDark }) {
  return (
    <div className={`${dark ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} min-h-screen flex flex-col transition-colors duration-500`}>
      <header className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6" />
          <span className="font-bold text-lg">ClickTales</span>
        </div>
        <nav className="flex gap-6 items-center">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/gallery" className="hover:underline">Gallery</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <DarkModeToggle dark={dark} setDark={setDark} />
        </nav>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}

// --- Main App ---
function App() {
  const [dark, setDark] = useState(false);

  return (
    <Router>
      <Layout dark={dark} setDark={setDark}>
        <Routes>
          <Route path="/" element={<HomePage dark={dark} setDark={setDark} />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

// --- Home Page ---
function HomePage({ dark, setDark }) {
  const [started, setStarted] = useState(false);
  const [countdown, setCountdown] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Loader loading={loading} />
      {!started ? (
        <Hero onStart={() => setStarted(true)} />
      ) : (
        <>
          {countdown && <Countdown onComplete={() => setCountdown(false)} />}
          <CameraPreview
            filter={filter}
            onCapture={(img) => {
              setLoading(true);
              setTimeout(() => {
                setCapturedImages([...capturedImages, img]);
                setLoading(false);
              }, 1200);
            }}
          />
          <FiltersCarousel selected={filter} onSelect={setFilter} />
          <Timeline />
        </>
      )}
      <FAB onClick={() => window.location.reload()} tooltip="Restart" />
    </>
  );
}

// --- Gallery Page ---
function GalleryPage() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">Your Photos</h2>
      <div className="text-gray-500">Gallery content goes here.</div>
    </section>
  );
}

// --- About Page ---
function AboutPage() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">About ClickTales</h2>
      <p className="text-lg">ClickTales is a fun, fast, and friendly way to capture and share your best moments!</p>
    </section>
  );
}

export default App;
