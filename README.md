# ⚡ Muhaiman — 3D Cyberpunk Portfolio Website

> **Production-Ready, Fully Responsive 3D Portfolio Website Codebase**  
> Engineered for a multi-disciplinary tech professional: **Software Engineer | AI Engineer | Web Developer | Graphic Designer | Cybersecurity Specialist**.

---

## 🌟 Visual Theme & Design Architecture

- **Aesthetic**: Cyberpunk & Futuristic Sci-Fi luxury with deep obsidian canvas (`#030712`), neon cyan (`#00f3ff`), purple/magenta (`#d946ef`), electric blue, and terminal matrix green (`#00ff9d`).
- **3D Canvas Technology (Three.js r128)**:
  - **Background Particle Constellation & Warp Field**: 1,000+ glowing additive particles, subtle drifting 3D wireframe polyhedra (icosahedrons, octahedrons, tetrahedrons, dodecahedrons) with smooth mouse parallax lerping.
  - **Hero Interactive 3D Cybernetic Core**: Geodesic wireframe icosahedron, dual spinning orbital toruses, glowing inner energy sphere, swarming telemetry point-cloud, and interactive drag-to-orbit controls with smooth rotational momentum.
- **Glassmorphism & Micro-Interactions**: Multi-layered backdrop blurs, 3D perspective tilt hover cards, dynamic neon laser scanlines, and audio synthesis feedback via Web Audio API.

---

## 📁 Project Directory Structure

```text
muhaiman-3d-portfolio/
│
├── index.html                   # Master semantic HTML5 document with Tailwind & custom HUD
├── style.css                    # Custom cyberpunk stylesheet, glassmorphism & 3D tilt styles
├── main.js                      # Core Three.js render loop, orbit controls & UI state managers
├── README.md                    # Project documentation & deployment manual
└── assets/
    ├── profile.jpg              # Engineered profile avatar (drop your photo here!)
    └── profile-placeholder.svg  # High-tech vector fallback avatar
```

---

## 🚀 Step 1: How to Open & Test Locally in VS Code

### Option A: VS Code "Live Server" Extension (Recommended)
1. Open **Visual Studio Code**.
2. Click **File > Open Folder...** and select the project directory:  
   `C:\Users\muhaiman awan\.gemini\antigravity\scratch\muhaiman-3d-portfolio`
3. If you don't already have it, install the **Live Server** extension by *Ritwick Dey* from the VS Code Extensions Marketplace (`Ctrl+Shift+X` -> search `Live Server`).
4. Right-click on `index.html` in the file explorer and select **"Open with Live Server"** (or click the **"Go Live"** button at the bottom-right status bar).
5. The portfolio will automatically launch in your browser at `http://127.0.0.1:5500`.

### Option B: Node.js / NPX
If you have Node.js installed, run:
```bash
npx serve .
```

### Option C: Python HTTP Server
If Python is available on your machine:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

---

## 🌐 Step 2: How to Host for Free on GitHub Pages

You can host this portfolio worldwide for free on GitHub Pages in under 2 minutes:

### 1. Initialize Git & Commit
Open your terminal inside the project directory:
```bash
cd "C:\Users\muhaiman awan\.gemini\antigravity\scratch\muhaiman-3d-portfolio"
git init
git add .
git commit -m "feat: initial release of 3D cyberpunk portfolio"
```

### 2. Push to GitHub
1. Create a new public repository on [GitHub](https://github.com/new) named `portfolio` (or `muhaimanawan.github.io`).
2. Link your local project to GitHub and push:
```bash
git remote add origin https://github.com/muhaimanawan/portfolio.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to your repository on GitHub: `https://github.com/muhaimanawan/portfolio`.
2. Click **Settings** (top tab) -> **Pages** (left sidebar).
3. Under **Build and deployment > Source**, select **Deploy from a branch**.
4. Set the branch to **`main`** and folder to **`/(root)`**, then click **Save**.
5. Within 60 seconds, your site will be live at:
   `https://muhaimanawan.github.io/portfolio/`

---

## 🖼️ How to Replace the Profile Picture

1. Prepare your headshot or photo in square or portrait aspect ratio (JPEG or PNG format).
2. Rename your image file to:
   ```text
   profile.jpg
   ```
3. Copy and replace it into the `assets/` folder:
   ```text
   muhaiman-3d-portfolio/assets/profile.jpg
   ```
4. The portfolio already includes the exact class `profile-img-container` and path `assets/profile.jpg`. Your image will instantly display inside the holographic 3D neon frame with animated laser scanning!

---

## 🎛️ Interactive Features Breakdown

1. **Dynamic Cycling Titles**:
   - Software Engineer
   - AI Engineer
   - Web Developer
   - Graphic Designer
   - Cybersecurity Specialist
2. **Interactive 3D Hero Core**:
   - Click and drag anywhere on the 3D core canvas to freely rotate and orbit the 3D model.
   - Smooth rotational inertia continues spinning when released.
3. **Interactive Cyber Terminal**:
   - Try typing commands in the terminal under the About section:
     - `help` — Lists all available terminal commands.
     - `skills` — Prints full technical stack breakdown.
     - `services` — Displays the 5 core engineering services.
     - `bio` — Outputs operator dossier.
     - `socials` — Links to verified LinkedIn and GitHub profiles.
     - `clear` — Wipes the terminal buffer.
4. **Interactive 3D Tilt Services Cards**:
   - Hover over any service card to experience physical 3D perspective depth with real-time matrix tilt calculations.
5. **Interactive Skills Matrix**:
   - Filter skills dynamically between *All*, *AI/ML*, *Full-Stack Web*, *Cybersecurity*, and *Graphic Design & 3D*.
6. **Project Showcase & Blueprint Modal**:
   - Filter projects by domain.
   - Click **"Inspect Blueprint"** on any project to open an interactive modal with telemetry specs and architecture details.
7. **Encrypted Uplink Contact Form**:
   - Real-time input validation (email RFC regex, minimum lengths, select boxes).
   - Simulates high-tech cryptographic payload transmission with status toasts.
8. **Direct Social Endpoints**:
   - Verified LinkedIn: `https://www.linkedin.com/in/atta-ul-muhaiman`
   - Verified GitHub: `https://github.com/muhaimanawan`
   - Direct WhatsApp: `+92 302 1173377` (`https://wa.me/923021173377`)
   - Direct Email: `attaulmuhaiman@gmail.com`
9. **Audio Synthesizer & Performance Controls**:
   - Toggle **SFX** in the header for futuristic UI sound tones (Web Audio API).
   - Toggle **3D: HIGH / ECO** to adjust device pixel ratios and antialiasing for battery saving.

---

## 🔒 Security & Performance Specifications

- **Zero External Audio File Footprint**: Audio effects are generated client-side using pure Web Audio oscillator synthesis.
- **GPU Scaling**: Renderer resolution is automatically capped on mobile devices to prevent thermal throttling while maintaining 60+ FPS.
- **Accessible & SEO Ready**: Full Open Graph social tags, semantic ARIA attributes, and accessible keyboard navigation.
