# Roblox Shorts 3D Engine

An end-to-end 9:16 vertical 3D Roblox storytelling video engine powered by **Remotion**, **React Three Fiber (Three.js)**, and offline **Kokoro ONNX TTS**.

Each video is created from a single Python story file (`stories/<slug>.py`) and compiled into a high-quality 1080x1920 30fps MP4 short.

---

## 🚀 Quick Start

### 1. Preview a Story (Stills & Contact Sheet)
```bash
cd roblox-remotion
python scripts/make_short.py stories/hair_color.py --stills
```
This generates:
- Voice narration, music ducking, and SFX into `public/soundtrack.wav` + `public/kokoro-cues.json`.
- Typed scene composition into `src/story/currentStory.ts`.
- Preview stills and contact sheet into `out/preview/hair_color/sheet-1.png`.

### 2. Render Full MP4 Video
```bash
cd roblox-remotion
python scripts/make_short.py stories/hair_color.py --skip-tts --render
```
The final video will be generated at `roblox-remotion/out/hair_color.mp4`.

### 3. Open Remotion Studio (Visual Interactive Preview)
```bash
npm run dev
# Or: cd roblox-remotion && npm run dev
```
Opens Remotion Studio in your browser at `http://localhost:3000` to scrub through frames, inspect cameras, and preview 3D scenes in real time.

---

## 🛠️ Environment & Setup Details

The folder is fully configured:

- **Node.js dependencies**: Configured in `roblox-remotion/node_modules` with Linux x64 Remotion compositor binaries (`@remotion/compositor-linux-x64-gnu`).
- **Python environment**: Virtual environment configured in `roblox-remotion/.venv` using Python 3.12 with all required libraries:
  - `kokoro-onnx` & `onnxruntime` (local neural TTS)
  - `numpy`, `scipy` (audio synthesis, filter curves & ducking)
  - `pillow` (contact sheet image assembly)
  - `scripts/make_short.py` automatically detects and uses `.venv`.
- **System Tools**: `ffmpeg` (system version 9.0+ and Remotion bundled fallback).
- **Agent Skill**: Registered in `~/.gemini/config/skills/roblox-shorts-director` and `.agents/skills/roblox-shorts-director`.

---

## 📁 Project Structure

```
roblox-engine/
├── package.json                   # Root workspace scripts (npm run dev/short/build)
├── README.md                      # This guide
├── AGENTS.md                      # Agent execution instructions
└── roblox-remotion/               # Core engine
    ├── .venv/                     # Python 3.12 virtual environment (kokoro-onnx, scipy, pillow)
    ├── models/
    │   ├── kokoro-v1.0.onnx       # Kokoro TTS ONNX model (offline)
    │   └── voices-v1.0.bin        # Voice embeddings (af_heart, am_michael, etc.)
    ├── stories/
    │   ├── _template.py           # Boilerplate template for new stories
    │   ├── hair_color.py          # Complete reference story
    │   ├── one_hundred_words.py   # "100 words a day" story
    │   └── word_limit.py          # Word limit story
    ├── scripts/
    │   ├── make_short.py          # Master CLI pipeline runner
    │   └── shorts/
    │       ├── audio.py           # Narration, music levelling, soft SFX synthesis
    │       └── scene.py           # Keyframes, camera cuts, rule validator
    ├── src/
    │   ├── components/            # R6Character, HairSystem, ShortsHUD
    │   ├── characters/            # Character presets, outfits, accessories
    │   ├── environments/          # TownMap, interior rooms, buildings, props
    │   └── story/currentStory.ts  # Generated story file (do not edit manually)
    ├── public/
    │   ├── music/                 # Background music tracks
    │   ├── soundtrack.wav         # Generated audio mix
    │   └── kokoro-cues.json       # Generated subtitle and beat timings
    └── out/                       # Rendered MP4s and contact sheet previews
```

---

## 💡 Viral Story Formula Subskill (`roblox-idea-generation`)

All concepts are powered by Theo's 5-step viral retention formula:
> *"Find a kid who loves his family. Give him a rule. Take something away. And watch the numbers."*

1. **Step 1: The Hook (0–2s)**: 3 words (`"In this world, ..."` or `"In this town, ..."`), the absurd rule (*"complain and your house shrinks"*), and a kid about to break it. Zero fluff.
2. **Step 2: Say His Name (2–5s)**: `"My name is Theo"`. Anchors the viewer to an individual rather than an abstract rule.
3. **Step 3: Fast Personal Stakes (<15s)**: Puts Grandpa, little brother/sister, or the family house directly on the line.
4. **Step 4: Plain-Sight Clue (15–28s)**: A subtle visual clue (*basement mud on bunny feet*, *robot bear tapping nose twice*) that rewards smart viewers and triggers rewatches.
5. **Step 5: The Ending Has to Cost (28–42s)**: Tragic or existential loop endings (*lost sister forever*, *turned to stone by family*, *trapped in an author's loop*) drive 1M+ views and comments demanding to *"make it worse"*.

---

## 🎬 Creating a New Video

1. Copy `roblox-remotion/stories/_template.py` to `roblox-remotion/stories/<slug>.py`.
2. Define:
   - `TITLE`: Video title.
   - `BEATS`: Sentence-by-sentence narration with optional `shout: True` and pauses. (Must begin with `"In this town, ..."` or `"In this world, ..."`).
   - `MUSIC`: Background music file from `public/music/` and dropout timings.
   - `SFX`: Sound effect cues (`whoosh`, `pop`, `impact`, `reveal`, `twist`, etc.).
   - `CAST`: Characters extending presets (`kid_boy`, `schoolgirl`, `bully`, `principal`, etc.).
   - `scenes(T)`: Timed 3D scene definitions with camera cuts (1.0s to 3.5s per shot).
3. Test stills:
   ```bash
   cd roblox-remotion && python scripts/make_short.py stories/<slug>.py --stills
   ```
4. Render final video:
   ```bash
   cd roblox-remotion && python scripts/make_short.py stories/<slug>.py --skip-tts --render
   ```
