# React Photobooth

A modern photobooth application built with React, TypeScript, and Vite. This project is a complete rewrite of a PHP-based photobooth system, bringing it into the modern web development era.

## 🎯 Features

- **📸 Real-time Camera Preview**: Live camera feed using MediaDevices API
- **🖼️ Photo Capture**: High-quality photo capture with canvas rendering
- **🎨 Gallery System**: View, download, and manage captured photos
- **⚙️ Admin Panel**: Configure camera settings and application features
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🎭 Modern UI**: Clean, intuitive interface with smooth animations
- **⚡ Fast Performance**: Built with Vite for lightning-fast development and builds

## 🚀 Quick Start

### Prerequisites

- Node.js (≥ 20.15.0)
- npm (≥ 10.7.0)
- Modern web browser with camera support

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd BCP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - Allow camera permissions when prompted

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── CameraPreview.tsx
├── pages/              # Main application pages
│   ├── PhotoboothHome.tsx
│   ├── Gallery.tsx
│   └── Admin.tsx
├── hooks/              # Custom React hooks
│   └── useCamera.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── services/           # API and external service integrations
├── App.tsx             # Main app component with routing
└── main.tsx           # Application entry point
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: CSS3 with modern features (Grid, Flexbox, Custom Properties)
- **Camera API**: MediaDevices API for camera access
- **Image Processing**: HTML5 Canvas API

## 📋 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🎮 Usage

### Taking Photos
1. Click "Start Camera" to begin the camera preview
2. Position yourself in the frame
3. Click "📸 Take Photo" to capture
4. View your photo and choose to take another

### Viewing Gallery
1. Click "Gallery" in the navigation
2. Browse all captured photos
3. Download or delete photos as needed

### Admin Configuration
1. Access the "Admin" panel
2. Adjust camera resolution settings
3. Enable/disable features like filters, gallery, and printing
4. Save your configuration

## 🌐 Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support on macOS/iOS
- **Mobile browsers**: Support varies by device camera capabilities

## 🔐 Privacy & Security

- All photos are processed locally in your browser
- No data is sent to external servers
- Camera access requires explicit user permission
- Photos are stored locally in browser memory during the session

## 🚧 Roadmap

- [ ] Photo filters and effects
- [ ] Print integration
- [ ] Cloud storage options
- [ ] Social sharing features
- [ ] Collage and multi-photo modes
- [ ] Green screen (chroma key) support
- [ ] Hardware button integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the original photobooth project for details.

## 🙏 Acknowledgments

- Inspired by the original [Photobooth PHP project](https://github.com/PhotoboothProject/photobooth)
- Built with modern web technologies for enhanced performance and maintainability
- Thanks to the open-source community for the amazing tools and libraries
