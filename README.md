# SinBoy 🕹️✨

```text
  ____  ___ _   _ ____   ______   __
 / ___||_ _| \ | | __ ) / __ \ \ / /
 \___ \ | ||  \| |  _ \| |  | \ V / 
  ___) || || |\  | |_) | |__| || |  
 |____/|___|_| \_|____/ \____/ |_|  
```

> **"The handheld console where mathematics creates reality."**

SinBoy is a browser-based fantasy handheld console where every visual frame, text glyph, particle system, surface texture, hardware casing, shader effect, and sound effect is generated **100% procedurally in real-time from mathematical equations**.

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

## 🎨 Visual Language & Hardware Design

Imagine if an authentic GameBoy had been invented by modern creative technologists and mathematicians:
- **Classic GameBoy Slate Gray Casing**: Authentic retro industrial slate gray superellipse body shell (`#c4cad4` to `#a0a8b6`).
- **Dark Slate Screen Bezel**: High-contrast dark charcoal screen frame (`#2c323f` to `#1e232e`) that makes full-color screen graphics pop.
- **Interactive Side Controls & Dev Studio Panel**: Compact desktop side panel on the right with key legends (`[WASD / ARROWS]`, `[Z / SPACE]`, `[X]`, `[TAB]`, `[M]`, `[T]`, `[F]`), clickable theme buttons, font mode selectors, and live math parameter sliders (`[-]` / `[+]`).
- **Full-Color Natural Environments**: Cerulean sky blue gradients, golden suns, white Perlin clouds, timber brown tree trunks (`#78350f`), emerald green foliage (`#22c55e`), and vibrant player avatars.

---

## 🚀 Key Subsystems

### 1. 🔤 Procedural Vector Typography Engine
- **Zero Font Files**: Every character (A–Z, 0–9, symbols, `(`, `)`, `=`, `%`, `,`, `'`) is defined mathematically and rendered dynamically.
- **9 Font Modes**:
  1. `bezier`: Smooth parametric curves.
  2. `fourier`: Glyphs reconstructed via rotating Fourier epicycles ($\sum c_n e^{i n \omega t}$).
  3. `wave`: Modulates strokes via trigonometric sine/cosine waves ($y' = y + A \sin(f x + \omega t)$).
  4. `sdf`: Distance-field thresholded letterforms.
  5. `noise`: Perlin noise-displaced stroke paths.
  6. `skeleton`: Clean vector stroke centerlines.
  7. `geometric`: Sharp primitive circle & line compositions.
  8. `parametric`: Polar trigonometric equations ($r(\theta)$).
  9. `lissajous`: Harmonic orthogonal oscillation curves ($x = \sin(a t), y = \sin(b t)$).

### 2. 🎵 Polyphonic Procedural Synthesizer Engine
- **Zero Audio Assets**: Multi-voice chiptune synthesis using Web Audio API math.
- **Auto-Gesture Audio Unlocking**: Resumes `AudioContext` automatically on user gesture across all modern browsers.
- **3-Voice Polyphony + Percussion**:
  - Voice 1: Lead Melody (Sine/Square with vibrato & glide).
  - Voice 2: Harmony Arpeggiator (Triangle wave).
  - Voice 3: Deep Bassline (Sawtooth wave with filter decay).
  - Voice 4: Percussion (Procedural white noise snare/hi-hat).
- **Procedural Sound FX**: Harmonic chord boot chime, arcade jump sweeps, laser shots, item pickup chimes, multi-stage noise explosions.

### 3. 🎮 9 Included Mathematical Cartridges
1. **Wave Runner**: Multi-harmonic terrain ($y(x) = y_0 + A_1 \sin(f_1 x) + A_2 \sin(f_2 x + 1.4) + A_3 \cos(f_3 x + 2.8)$) with endless positive modulo cloud & tree wrapping (`posMod`), balanced single-press jump controls.
2. **Orbit Survivor**: Single-press plasma counter-missile laser shooting, orbital Lissajous track, glowing cyan player orb, ruby enemies.
3. **Particle Dodge**: Vector field grid with speed-colored boid arrows, glowing amber player vessel, EMP shockwave pulse on Button A.
4. **Wave Snake**: Emerald green undulated snake, golden glowing apples, soft meadow background, single-press restart logic.
5. **Fractal Forest**: Natural timber wood trunks branching into foliage with seasonal morphing (Spring, Autumn, Sakura, Cyber Neon) on Button A.
6. **Ripple Wave Lab**: Deep ocean blue water ripple simulation with turquoise caustics, single-press splashes, and automatic raindrop generator.
7. **Chaos Laboratory**: Interactive 3D camera rotation using D-Pad across Lorenz Attractor & Logistic Map bifurcation.
8. **Fourier Epicycle Painter**: Reconstruct multi-shape vector artwork (Star, Heart, Butterfly) via rotating Fourier series epicycles.
9. **Lissajous Arena**: Multi-phase boss battle with dynamic Lissajous kinematics ($x=\sin(1.8t), y=\sin(2.7t)$), polar rose forcefields, targeted plasma projectiles, 8-way radial shockwaves, and player combat.

### 4. 🛠️ Developer Mode & Education Mode
- **Developer Mode (`TAB` key)**: Transforms console & side panel into live equation editor. Click `[-]` / `[+]` or press Arrow Keys to tune variables ($A$, $f$, $v$, $\text{epicycles}$) in real-time.
- **Math Education Overlay (`M` key)**: Displays interactive mathematical lessons and function plots for every active game.
- **11 Procedural Themes (`T` key)**: Classic GameBoy Gray, Graph Paper, Holographic Spectrum, Pastel Aurora, Cyberpunk 2099, 80s Synthwave, Neon Vector, Aurora, Deep Galaxy, Magma Core, Oscilloscope.

---

## 🕹️ Controls & Shortcuts

| Key | Action |
| :--- | :--- |
| **Arrow Keys / WASD** | D-Pad Navigation / Movement / 3D Cam / Dev Var Tuning |
| **Z / Space / Enter** | Button A (Action / Jump / Shoot / Launch / Season) |
| **X** | Button B (Back / Cancel) |
| **TAB** | Toggle **Developer Mode Equation Inspector** |
| **M** | Toggle **Math Education Overlay** |
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

Open your browser at `http://localhost:5173/` to launch SinBoy.

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
