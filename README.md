# SinBoy OS 🕹️✨

```text
  ____  ___ _   _ ____   ______   __     ___  ____  
 / ___||_ _| \ | | __ ) / __ \ \ / /    / _ \/ ___| 
 \___ \ | ||  \| |  _ \| |  | \ V /    | | | \___ \ 
  ___) || || |\  | |_) | |__| || |     | |_| |___) |
 |____/|___|_| \_|____/ \____/ |_|      \___/|____/ 
```

> **"I built a procedural mathematics operating system where games, UI, typography, audio, graphics, and even the console hardware are generated from equations."**

SinBoy OS is a browser-based fantasy handheld console & mathematical operating system where every visual frame, text glyph, particle system, surface texture, hardware casing, shader effect, and sound effect is generated **100% procedurally in real-time from mathematical equations**.

Nothing is loaded. Nothing is drawn from static assets. Reality is evaluated every frame.

---

## 💎 The Golden Rule

**IF IT APPEARS ON THE SCREEN... IT MUST BE GENERATED.**

| Prohibited Assets ❌ | Procedural Math Substitutes ⚡ |
| :--- | :--- |
| **PNG / JPEG / WEBP / SVG** | Signed Distance Fields (SDF) & Bezier Curves |
| **TTF / OTF / Google Fonts** | Fourier Series Epicycles & Trigonometric Waves |
| **MP3 / WAV / Sound Samples** | Web Audio API Real-Time Wave Oscillators |
| **Premade Shaders & Sprites** | Procedural Noise & Differential Equations |

---

## 📱 Mobile Touch & Clickable Handheld Hardware Controls

Every single physical control rendered on the GameBoy console is **100% clickable and touchable on mobile devices and desktop**:
- **D-Pad (Up, Down, Left, Right)**: Precise screen hitboxes for continuous holding and directional steering.
- **Action Buttons (A, B, X, Y)**: Tactile spring physics and touch event triggers.
- **Select & Start Pills**: Interactive pill buttons for modal toggling and game launching.

---

## 💻 SinBoy OS Architecture

Booting SinBoy OS presents a complete procedural operating system:

```text
SinBoy OS
   │
   ├── 🕹️ 1. PLAY (9 Cartridge Games)
   ├── 🔤 2. FONT LAB (Live Vector Typography Generator)
   ├── 🎨 3. ICON LAB (Signed Distance Field Icon Builder)
   ├── 🖼️ 4. WALLPAPER LAB (Domain Warping & Flow Fields)
   ├── 🎵 5. AUDIO LAB (Procedural Web Audio Synthesizer)
   └── 🔬 6. MATH LIBRARY (Dictionary & Split-Screen Graph)
```

---

## 👁️ The "Reality Inspector" Overlay (`M` Key)

Press **`M`** anytime to freeze reality and inspect ANY element on screen:
- **Speaker Grille**: Polar Radial Array ($r = 0.08 \cdot \text{size}, \, \theta = \frac{2\pi i}{N}$)
- **D-Pad**: Signed Distance Cross ($\max(|x| - w, |y| - h) \le 0$)
- **Action Button A**: Circle Arc SDF & Specular Highlight Arc
- **Power LED**: Pulsing Glow Disc ($I(t) = 0.5 + 0.5 \sin(3t)$)
- **Screen Bezel**: Superellipse Geometry ($|x/a|^m + |y/b|^n \le 1$)

Click **`EDIT`** on any element to tune parameters and watch the console hardware, typography, or game graphics morph in real time!

---

## 🚀 Key Subsystems

### 1. 🔤 Procedural Vector Typography Engine & FONT LAB
- **Zero Font Files**: Every character (A–Z, 0–9, symbols, `(`, `)`, `=`, `%`, `,`, `'`) is defined mathematically and rendered dynamically.
- **3 Cleanest Font Engines**:
  1. `bezier`: Crisp smooth parametric curves.
  2. `fourier`: Glyphs reconstructed via rotating Fourier epicycles ($\sum c_n e^{i n \omega t}$).
  3. `wave`: Modulates strokes via trigonometric sine/cosine waves ($y' = y + A \sin(f x + \omega t)$).

### 2. 🎵 Polyphonic Synthesizer Engine & AUDIO LAB
- **Zero Audio Assets**: Multi-voice chiptune synthesis & real-time procedural sound generator.
- **Procedural Water Raindrop Splashes**: Realistic water droplet pitch sweeps ($1200\text{Hz} \to 2100\text{Hz}$) + noise splash envelopes synthesized live for `Ripple Wave Lab`!
- **Tailored Sound Effects for Every Cartridge**: Jump sweeps (`playJump()`), landing thuds (`playLand()`), laser plasma shots (`playLaser()`), EMP shockwaves (`playEmp()`), season chimes (`playSeasonChime()`), boss spark hits (`playBossHit()`), heavy water splashes (`playWaterSplash()`), and noise explosions (`playExplosion()`).
- **Live Oscilloscope Synthesizer Waveform Visualizer**: Web Audio `AnalyserNode` rendering live real-time oscilloscope waveforms across the status bar in Dev Mode (`TAB`)!

### 3. 📳 Dynamic Screen Shake & Impact Physics
- **Exponential Damped Oscillation Camera Shake**:
  $$dx(t) = A \cdot e^{-\gamma t} \sin(\omega_1 t), \quad dy(t) = A \cdot e^{-\gamma t} \cos(\omega_2 t)$$

### 4. 🎮 9 Included Mathematical Cartridges
1. **Wave Runner**: Multi-harmonic terrain ($y(x) = y_0 + A_1 \sin(f_1 x) + A_2 \sin(f_2 x + 1.4) + A_3 \cos(f_3 x + 2.8)$) with lower ground level ($y=255$) for full vertical headroom, endless positive modulo cloud & tree wrapping (`posMod`).
2. **Orbit Survivor**: Single-press plasma counter-missile laser shooting, orbital Lissajous track, glowing cyan player orb, ruby enemies.
3. **Particle Dodge**: Vector field grid with speed-colored boid arrows, glowing amber player vessel, EMP shockwave pulse (`playEmp()`) on Button A.
4. **Wave Snake**: Emerald green undulated snake utilizing full vertical screen bounds ($15 \le y \le 305$), golden glowing apples with pickup chimes (`playPickup()`).
5. **Fractal Forest**: Natural timber wood trunks branching into foliage with seasonal morphing (Spring, Autumn, Sakura, Cyber Neon) on Button A with harmonic season chimes (`playSeasonChime()`).
6. **Ripple Wave Lab**: Deep ocean blue water ripple simulation with turquoise caustics, heavy water splashes (`playWaterSplash()`), and procedural raindrop droplets (`playRaindrop()`).
7. **Chaos Laboratory**: Interactive 3D camera rotation using D-Pad across Lorenz Attractor & Logistic Map bifurcation.
8. **Fourier Epicycle Painter**: Reconstruct multi-shape vector artwork (Star, Heart, Butterfly) via rotating Fourier series epicycles.
9. **Lissajous Arena**: Multi-phase boss battle with dynamic Lissajous kinematics ($x=\sin(1.8t), y=\sin(2.7t)$), polar rose forcefields, targeted plasma projectiles, 8-way radial shockwaves, boss hit spark SFX (`playBossHit()`), and player combat.

### 5. 🛠️ Developer Mode & Education Mode
- **Developer Mode (`TAB` key)**: Transforms console & side panel into live equation editor. Click `[-]` / `[+]` or press Arrow Keys to tune variables ($A$, $f$, $v$, $\text{epicycles}$) in real-time.
- **Math Education Overlay (`M` key)**: Displays interactive mathematical lessons and function plots for every active game.
- **11 Procedural Themes (`T` key)**: Classic GameBoy Gray, Graph Paper, Holographic Spectrum, Pastel Aurora, Cyberpunk 2099, 80s Synthwave, Neon Vector, Aurora, Deep Galaxy, Magma Core, Oscilloscope.

---

## 🕹️ Controls & Shortcuts

| Key | Action |
| :--- | :--- |
| **Arrow Keys / WASD** | D-Pad Navigation / Movement / 3D Cam / Dev Var Tuning |
| **Z / Space / Enter** | Button A (Action / Jump / Shoot / Launch / Season / Splash) |
| **X** | Button B (Back / Cancel) |
| **TAB** | Toggle **Developer Mode Equation Inspector** |
| **M** | Toggle **Reality Inspector Overlay** |
| **T** | Cycle **Procedural Themes** |
| **F** | Cycle **Procedural Font Modes** |

---

## 🛠️ Quick Start & Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sinboy.git
cd sinboy

# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

Open your browser at `http://localhost:5173/` to launch SinBoy OS.

---

## 📐 Mathematical Foundations

### Superellipse Hardware Casing
$$\left|\frac{x}{a}\right|^m + \left|\frac{y}{b}\right|^n = 1$$

### Fourier Series Epicycles
$$f(t) = \frac{a_0}{2} + \sum_{n=1}^{\infty} \left( a_n \cos(n \omega t) + b_n \sin(n \omega t) \right)$$

### Lorenz Chaotic Attractor
$$\frac{dx}{dt} = \sigma (y - x), \quad \frac{dy}{dt} = x (\rho - z) - y, \quad \frac{dz}{dt} = x y - \beta z$$

---

## 📄 License

MIT License. Designed with craftsmanship. Everything is mathematics.
