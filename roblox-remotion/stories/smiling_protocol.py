"""THE SMILING PROTOCOL (The Forced Grin) - Theo's viral 5-step Roblox Horror Short.

Build:   python scripts/make_short.py stories/smiling_protocol.py --stills
Render:  python scripts/make_short.py stories/smiling_protocol.py --render
"""
from shorts.scene import HALF, OFF, close_up, face, hold, kf, medium, shot, wide  # noqa: F401

TITLE = "THE SMILING PROTOCOL"

# 1. SCRIPT ------------------------------------------------------------------
BEATS = [
    # Step 1: Hook (0-2s) - 3 words + thumb-stopping rule + kid about to break it
    {"id": "b1", "text": "In this world, stop smiling for three seconds, and the Watchers take you.", "pause": 0.06},
    {"id": "b2", "text": "Until my eight-year-old sister could not hold her grin for another second.", "pause": 0.06},
    # Step 2: Say His Name (2-5s) - Anchor protagonist
    {"id": "b3", "text": "My name is Theo, and dried blood was crusting the corners of my mouth.", "pause": 0.06},
    # Step 3: Fast Stakes (<15s) - Lily passes out, timer starts
    {"id": "b4", "text": "Lily had been awake for thirty-six straight hours, her face twitching in pure agony.", "pause": 0.08},
    {"id": "b5", "text": "Suddenly, her fever spiked. Her eyes rolled back, and she collapsed onto the rug.", "pause": 0.08},
    {"id": "b6", "text": "Her mouth fell completely slack. The three-second death timer began.", "pause": 0.08},
    {"id": "b7", "text": "I froze, forcing my gritted teeth into a grin as tears ran down my cheeks.", "pause": 0.08},
    # Step 4: Plain-Sight Clue (15-28s) - Grandfather Clock Tongue & Eyes
    {"id": "b8", "text": "In the corner of our living room, the grandfather clock began to tick violently.", "pause": 0.06},
    {"id": "b9", "text": "Its pendulum was a human tongue... and two wet bloodshot eyes blinked behind the glass.", "pause": 0.10},
    {"id": "b10", "text": "Then from inside the dark chimney flue, a pale claw slithered toward Lily.", "pause": 0.08},
    {"id": "b11", "text": "Something inside me snapped. I threw myself across the room and roared:", "pause": 0.12},
    # Step 5: Climax Shouts + Payoff That Costs Something (28-42s)
    {"id": "w1", "text": "LEAVE!", "voice": "cloned_shout", "shout": True, "pause": 0.08},
    {"id": "w2", "text": "HER!", "voice": "cloned_shout", "shout": True, "pause": 0.08},
    {"id": "w3", "text": "ALONE!", "voice": "cloned_shout", "shout": True, "pause": 0.16},
    {"id": "b12", "text": "The scream broke my smile. The red siren shrieked through the walls.", "pause": 0.08},
    {"id": "b13", "text": "The claws whipped around my neck, dragging my snapping bones into the chimney soot.", "pause": 0.10},
    {"id": "b14", "text": "And on the rug below, Lily opened her eyes... with a carved bloody grin cut into her cheeks.", "pause": 0.25},
]

# 2. MUSIC + SFX -------------------------------------------------------------
MUSIC = {
    "file": "music/fallen-down.mp3",
    "under_voice": 0.022,
    "gaps": 0.05,
    "dropouts": [("b11+0.4", "w3.end")],
}

SFX = [
    ("b1", "bell_low"),
    ("b1+1.0", "whoosh"),
    ("b3", "bell_low"),
    ("b4", "sad"),
    ("b5", "thud"),
    ("b6", "riser", {"dur": 2.5}),
    ("b8", "whoosh"),
    ("b9", "twist"),
    ("b10", "bell_low"),
    ("b11", "riser", {"dur": 2.0}),
    ("w1", "impact"),
    ("w2", "impact"),
    ("w3", "reveal"),
    ("b12", "impact"),
    ("b13", "thud"),
    ("b14+0.8", "twist"),
]

# 3. CAST --------------------------------------------------------------------
HERO = {
    "skin": "light",
    "hair": {"style": "messyFringe", "color": "darkBrown"},
    "top": {"style": "hoodie", "color": "orange", "secondary": "white"},
    "bottom": {"style": "jeans", "color": "#1E3A8A"},
    "shoes": {"style": "sneakers", "color": "#111827"},
}

LILY = {
    "skin": "fair",
    "hair": {"style": "pigtails", "color": "blonde"},
    "top": {"style": "tshirt", "color": "pink"},
    "bottom": {"style": "skirt", "color": "purple"},
    "shoes": {"style": "sneakers", "color": "white"},
    "accessories": [{"type": "bow", "color": "pink"}],
    "scale": 0.85,
}

WATCHER = {
    "skin": "#09090B",
    "hair": {"style": "none"},
    "top": {"style": "jacket", "color": "#09090B", "secondary": "#DC2626"},
    "bottom": {"style": "pants", "color": "#09090B"},
    "shoes": {"style": "boots", "color": "#09090B"},
    "scale": 1.25,
}

CAST = {
    "hero": HERO,
    "lily": LILY,
    "watcher": WATCHER,
}

# 4. SCENES ------------------------------------------------------------------
def scenes(T):
    B, E, END = T.B, T.E, T.END

    # Safe Actor staging coordinates in Living Room:
    # Theo on the left: x = -3.5, z = -0.5
    HERO_POS = [-3.5, 0, -0.5]
    # Lily on the rug in front of coffee table: x = 2.5, z = 1.0 (hypot(-6.0, -1.5) = 6.18 > MIN_GAP 3.33)
    LILY_POS = [2.5, 0, 1.0]
    # Watcher at fireplace on the right: x = 5.2, z = -6.5 (distance to Lily = hypot(2.7, -7.5) = 7.97 > MIN_GAP 3.6)
    WATCHER_POS = [5.2, 0, -6.5]
    # Theo choked position (facing Watcher at fireplace): x = 0.8, z = -4.5
    # (distance to Watcher = hypot(4.4, -2.0) = 4.83 > min 4.05; distance to Lily = hypot(1.7, 5.5) = 5.75 > min 3.33)
    HERO_CHOKE_POS = [0.8, 0, -4.5]

    # Grandfather clock position for macro zoom clue: x = -5.0, y = 5.0, z = -7.0
    CLOCK_TARGET = [-5.0, 5.0, -7.0]

    # Midpoints for 2-3s camera pacing
    b1_mid = B["b1"] + round((B["b2"] - B["b1"]) / 2)
    b5_mid = B["b5"] + round((B["b6"] - B["b5"]) / 2)
    b7_mid = B["b7"] + round((B["b8"] - B["b7"]) / 2)
    b9_mid = B["b9"] + round((B["b10"] - B["b9"]) / 2)
    b10_mid = B["b10"] + round((B["b11"] - B["b10"]) / 2)
    b12_mid = B["b12"] + round((B["b13"] - B["b12"]) / 2)
    b13_mid = B["b13"] + round((B["b14"] - B["b13"]) / 2)
    b14_mid = B["b14"] + round((END - B["b14"]) / 2)

    shots = [
        # 1. Wide establishing: dark living room with eerie red fireplace glow
        wide(0, b1_mid, [0, 0, 0], dist=16.0, height=6.2, fov=56),
        # 2. Medium on Lily & Theo with strained forced smiles
        medium(b1_mid, B["b2"], [0, 0, 0], dist=11.0, height=5.2, fov=48),
        # 3. Close-up Theo: blood trickling down grinning mouth (b2 -> b3)
        close_up(B["b2"], B["b3"], HERO_POS, dist=5.5, side=0.1, fov=40),
        # 4. Medium Theo: declaring his name and the agony (b3 -> b4)
        medium(B["b3"], B["b4"], HERO_POS, dist=8.5, height=5.0, fov=46),
        # 5. Medium Lily: shivering, high fever, knees trembling (b4 -> b5)
        close_up(B["b4"], B["b5"], LILY_POS, scale=0.85, dist=5.5, side=-0.1, fov=40),
        # 6. Lily collapses onto the rug!
        shot(B["b5"], b5_mid, [2.5, 4.0, 6.8], [2.5, 2.5, 5.5], [2.5, 0.8, 1.0], [2.5, 0.5, 1.0], 44, shake=0.06),
        # 7. Close-up Theo: gasping in pure panic
        close_up(b5_mid, B["b6"], HERO_POS, dist=5.2, side=0.15, fov=38),
        # 8. Low angle: slack-jawed Lily on the rug, 3-second death timer begins
        shot(B["b6"], B["b7"], [1.5, 3.2, 5.2], [1.5, 2.6, 4.5], [2.5, 0.4, 1.0], [2.5, 0.4, 1.0], 42),
        # 9. Theo frozen in agony: gritting teeth into forced grin
        close_up(B["b7"], b7_mid, HERO_POS, dist=5.0, side=-0.1, fov=38),
        medium(b7_mid, B["b8"], HERO_POS, dist=8.0, height=4.8, fov=44),
        # 10. b8: Grandfather clock begins ticking violently
        shot(B["b8"], B["b9"], [-5.0, 6.0, 1.5], [-5.0, 5.8, 0.5], [-5.0, 5.5, -6.5], [-5.0, 5.5, -6.5], 40),
        # 11. b9: MACRO ZOOM ON TONGUE PENDULUM AND TWITCHING BLOODSHOT EYES (Clue at second 19!)
        shot(B["b9"], b9_mid, [-5.0, 3.8, -1.8], [-5.0, 3.8, -2.5], [-5.0, 3.8, -6.5], [-5.0, 3.8, -6.5], 32),
        shot(b9_mid, B["b10"], [-5.0, 8.6, -1.8], [-5.0, 8.6, -2.6], [-5.0, 8.6, -6.2], [-5.0, 8.6, -6.2], 30),
        # 12. b10: Pale claw / Watcher slithers out of chimney flue
        shot(B["b10"], b10_mid, [5.2, 4.5, -2.5], [5.2, 4.0, -3.2], WATCHER_POS, WATCHER_POS, 42, shake=0.05),
        close_up(b10_mid, B["b11"], HERO_POS, dist=5.2, side=0.1, fov=38),
        # 13. b11: Dramatic push on enraged Theo clenching trembling fists
        shot(B["b11"], B["w1"], [-3.5, 3.5, 4.0], [-3.5, 3.2, 3.0], [-3.5, 3.8, -0.5], [-3.5, 3.8, -0.5], 40, shake=0.08),
        # 14. Climax Shouts: One continuous massive cinematic scream (w1..b12 = 55 frames = 1.83s)
        shot(B["w1"], B["b12"], [-1.0, 4.2, 5.5], [0.5, 3.8, 3.8], [1.0, 2.5, -2.0], [1.0, 2.5, -2.0], 44, shake=0.14),
        # 15. b12: Red siren wails, claws whip around Theo's neck
        shot(B["b12"], b12_mid, [0.5, 4.8, 1.5], [0.8, 4.5, 0.8], [1.0, 4.2, -4.5], [1.0, 4.2, -4.5], 42, shake=0.08),
        close_up(b12_mid, B["b13"], HERO_CHOKE_POS, dist=5.2, fov=38, shake=0.08),
        # 16. b13: Theo hoisted up and dragged toward chimney flue
        shot(B["b13"], b13_mid, [2.5, 5.5, 0.0], [3.0, 6.0, -1.5], [3.5, 5.0, -5.5], [3.5, 5.0, -5.5], 44),
        medium(b13_mid, B["b14"], [2.5, 0, 1.0], dist=8.5, height=4.5, fov=44),
        # 17. b14: Devastating final twist - slow macro push on Lily opening eyes with bloody carved grin
        shot(B["b14"], b14_mid, [2.5, 3.5, 4.8], [2.5, 2.8, 3.8], [2.5, 0.6, 1.0], [2.5, 0.6, 1.0], 36),
        shot(b14_mid, END, [2.5, 2.2, 3.2], [2.5, 1.8, 2.5], [2.5, 0.5, 1.0], [2.5, 0.5, 1.0], 28),
    ]

    hero_kfs = [
        # Beginning: standing with forced unnatural trembling smile
        kf(0, HERO_POS, 0.25, "talk", "forced_smile"),
        kf(B["b2"], HERO_POS, 0.25, "walk", "forced_smile"),
        kf(B["b3"], HERO_POS, 0.35, "talk", "forced_smile"),
        kf(B["b4"], HERO_POS, 0.35, "panting", "forced_smile"),
        # Lily collapses: Theo reacts in terror but forces smile to stay
        kf(B["b5"], HERO_POS, 0.40, "cower", "forced_smile"),
        kf(B["b6"], HERO_POS, 0.40, "plead", "forced_smile"),
        kf(B["b7"], HERO_POS, 0.45, "fume", "forced_smile"),
        kf(B["b8"], HERO_POS, 0.45, "cower", "forced_smile"),
        kf(B["b9"], HERO_POS, 0.45, "despair", "forced_smile"),
        # Claws emerge: boiling rage
        kf(B["b10"], HERO_POS, 0.55, "fume", "angry"),
        kf(B["b11"], HERO_POS, 0.55, "fight", "angry"),
        # Climax shouts: roaring scream (breaks smile!)
        kf(B["w1"], HERO_POS, 0.55, "shout", "angry"),
        # Watcher claws grab Theo by the neck at b12: hoisted in choke pose
        kf(B["b12"], HERO_CHOKE_POS, -0.35, "choke", "panic"),
        kf(B["b13"], [1.0, 0, -4.5], -0.35, "choke", "panic"),
        # Dragged into the chimney flue
        kf(B["b14"], OFF, 0, "knocked", "panic"),
        kf(END, OFF, 0, "knocked", "panic"),
    ]

    lily_kfs = [
        # Awake for 36 hours: standing trembling with forced smile
        kf(0, LILY_POS, -0.25, "panting", "forced_smile"),
        kf(B["b2"], LILY_POS, -0.25, "cower", "forced_smile"),
        kf(B["b3"], LILY_POS, -0.30, "panting", "forced_smile"),
        kf(B["b4"], LILY_POS, -0.30, "despair", "forced_smile"),
        # Faints & collapses onto the rug!
        kf(B["b5"], LILY_POS, -0.30, "collapse", "deadpan"),
        kf(B["b6"], LILY_POS, -0.30, "collapse", "deadpan"),
        kf(B["b7"], LILY_POS, -0.30, "collapse", "deadpan"),
        kf(B["b8"], LILY_POS, -0.30, "collapse", "deadpan"),
        kf(B["b9"], LILY_POS, -0.30, "collapse", "deadpan"),
        kf(B["b10"], LILY_POS, -0.30, "collapse", "deadpan"),
        kf(B["b11"], LILY_POS, -0.30, "collapse", "deadpan"),
        kf(B["w1"], LILY_POS, -0.30, "collapse", "deadpan"),
        kf(B["b12"], LILY_POS, -0.30, "collapse", "deadpan"),
        kf(B["b13"], LILY_POS, -0.30, "collapse", "deadpan"),
        # End twist: Lily wakes up on the rug with carved bloody permanent grin!
        kf(B["b14"], LILY_POS, 0.10, "talk", "bloody_smile"),
        kf(END, LILY_POS, 0.10, "talk", "bloody_smile"),
    ]

    watcher_kfs = [
        # Hiding inside chimney until b10
        kf(0, OFF, 0, "idle", "watcher_face"),
        kf(B["b9"], OFF, 0, "idle", "watcher_face"),
        # Emerging at fireplace chimney
        kf(B["b10"], WATCHER_POS, -0.65, "walk", "watcher_face"),
        kf(B["b11"], WATCHER_POS, -0.65, "shove", "watcher_face"),
        kf(B["w1"], WATCHER_POS, -0.65, "shove", "watcher_face"),
        kf(B["b12"], WATCHER_POS, -0.65, "punch", "watcher_face"),
        kf(B["b13"], WATCHER_POS, -0.65, "point", "watcher_face"),
        kf(B["b14"], WATCHER_POS, -0.65, "idle", "watcher_face"),
        kf(END, WATCHER_POS, -0.65, "idle", "watcher_face"),
    ]

    return [{
        "id": "scene-smiling-protocol",
        "location": "living_room",
        "variant": "red",
        "isNight": True,
        "startFrame": 0,
        "endFrame": END,
        "cameraShots": shots,
        "characters": {
            "hero": hero_kfs,
            "lily": lily_kfs,
            "watcher": watcher_kfs,
        },
    }]
