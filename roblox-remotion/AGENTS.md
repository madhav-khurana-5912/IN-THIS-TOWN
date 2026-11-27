# Roblox Shorts Engine — Agent Instructions

Whenever the user asks to create, write, or render a Roblox Short video (or gives a story topic/rule):

1. Read and follow the [`roblox-shorts-director`](./.agents/skills/roblox-shorts-director/SKILL.md) skill and its idea generation subskill [`roblox-idea-generation`](./.agents/skills/roblox-idea-generation/SKILL.md).
2. Write one story file `stories/<slug>.py` (copy `stories/_template.py`; full example: `stories/hair_color.py`) following Theo's 5-step retention formula: 3-word rule hook, named anchor ("Theo"), 15s stakes (grandpa/brother/house), plain-sight hidden clue, and high-cost "make it worse" ending.
3. Run the pipeline end-to-end without asking unnecessary permission questions:
   - `python scripts/make_short.py stories/<slug>.py --stills`
     - Fix every `RULE CHECKS FAILED` line.
     - Inspect `out/preview/<slug>/sheet-*.png`.
   - `python scripts/make_short.py stories/<slug>.py --skip-tts --render` → `out/<slug>.mp4`

Hard rules, enforced by the skill and the build checks:
- The script opens with "In this town," / "In this world,".
- Scene Anchoring: Use only 2 to 3 scenes total and extend them. Never jump across 5–6 locations.
- Hard Cuts: A camera cut every 1.5–2.5 s; no shot longer than 3.5 s, min 1.0 s.
- Narrator voice `cloned_viral` (speed 1.22, tight 0.06 s pauses; pitch ~216 Hz youth delivery).
- Music from `public/music/`.
- Soft SFX presets only.
- Actors at least 4.5 studs apart.
- Door Burst / Push Entryway Staging: When narration describes running into a room, kicking open, or pushing through a door (e.g. "kicked open our front door", "burst into the kitchen"), NEVER cut directly to the actor already standing passively inside. The camera MUST frame the doorway/threshold, staging the character physically bursting or kicking through the door before cutting to interior dialogue.
- Literal Spoken Prop & Costume Fidelity: Every spoken key noun, clue, and costume detail (e.g. "heavy welder's gloves", "limp hollow fingertips", "empty rocking chair", "burned pan", "church bell", "open all night sign", "stopwatch") MUST have an authentic 3D mesh model with direct camera zoom/framing on that exact spoken word. Never substitute generic chairs or default bare yellow hands.
- Word-to-Visual Coordination ("Open All Night" Principle): Spoken nouns and concepts (e.g. "church bell", "open all night" sign, "stopwatch", "welder's gloves", "burned pan", "bikes") must have a literal 3D prop, sign, or visual representation highlighted on that exact spoken word.
- Premium Textures (Walls, Tables, Surfaces): No flat single-color boxes for walls or furniture. Walls must use procedural ceramic subway tile (`wallSubwayTileTex`), designer striped wallpaper (`wallPaperTex`), or stippled plaster (`wallPlasterTex`). Tables, desks, countertops, and furniture must use authentic varnished wood grain (`woodGrainTex`), polished granite (`counterGraniteTex`), or veined marble (`counterMarbleTex`).
- Voiceover-Synchronized Facial Animation & Emotion Grounding: Characters MUST show what the voiceover is saying at that exact second with zero decal flickering. Lip-sync mouth movement (`isMouthOpen`) ONLY activates while the voiceover is actively speaking syllables; mouths stay naturally closed during pauses. Non-speaking/listening characters (e.g. Grandpa while Theo narrates) must NEVER have talking animations (`talk`/`argue`/`shout`). Standing poses keep feet planted vertically on the ground (`y = 0`) with ZERO pelvic oscillation/humping.

Never edit `src/story/currentStory.ts` by hand; it is generated.
