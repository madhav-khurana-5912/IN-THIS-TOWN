"""ANGRY WORDS BECOME REALITY - Theo's viral 5-step Roblox Short.

Build:   python scripts/make_short.py stories/angry_words.py --stills
Render:  python scripts/make_short.py stories/angry_words.py --render
"""
from shorts.scene import HALF, OFF, close_up, face, hold, kf, medium, shot, wide  # noqa: F401

TITLE = "ANGRY WORDS BECOME REALITY"

# 1. SCRIPT ------------------------------------------------------------------
BEATS = [
    # Step 1: Hook (0-2s) - 3 words + thumb-stopping rule + kid who lost control
    {"id": "b1", "text": "In this town, say something angry, and it instantly comes true.", "pause": 0.06},
    {"id": "b2", "text": "Then a kid who could not control his temper lost his mind.", "pause": 0.06},
    # Step 2: Say His Name (2-5s)
    {"id": "b3", "text": "My name is Theo, and my anger just signed my grandfather death certificate.", "pause": 0.06},
    # Step 3: Fast Stakes (<15s) - Bullies attack and fight outside school
    {"id": "b4", "text": "It started after school when bullies soaked my backpack in mud and laughed in my face.", "pause": 0.08},
    # Step 4: Plain-Sight Clue (15-28s) - Kitchen & Welder's Gloves
    {"id": "b5", "text": "I kicked open our front door, shaking with fury. The whole house went dead silent.", "pause": 0.06},
    {"id": "b6", "text": "Grandpa stood by the stove, quietly stirring dinner in his heavy welder gloves.", "pause": 0.06},
    {"id": "b7", "text": "He never takes them off. The fingertips are completely hollow.", "pause": 0.06},
    {"id": "b8", "text": "Decades ago, someone angrily screamed at him to cut off his own hands.", "pause": 0.08},
    {"id": "b9", "text": "Grandpa turned around, holding a burned pan. He had completely forgotten my birthday.", "pause": 0.08},
    {"id": "b10", "text": "Something inside me snapped. I gripped my fists and screamed:", "pause": 0.12},
    # Step 5: Climax Shouts + Payoff That Costs Something (28-42s)
    {"id": "w1", "text": "I!", "voice": "cloned_shout", "shout": True, "pause": 0.08},
    {"id": "w2", "text": "WISH!", "voice": "cloned_shout", "shout": True, "pause": 0.08},
    {"id": "w3", "text": "YOU!", "voice": "cloned_shout", "shout": True, "pause": 0.08},
    {"id": "w4", "text": "WERE!", "voice": "cloned_shout", "shout": True, "pause": 0.08},
    {"id": "w5", "text": "GONE!", "voice": "cloned_shout", "shout": True, "pause": 0.16},
    {"id": "b11", "text": "Grandpa did not even scream. He simply dissolved into thin air.", "pause": 0.08},
    {"id": "b12", "text": "His pan clattered against the floor, right in front of his empty rocking chair.", "pause": 0.10},
    {"id": "b13", "text": "And on the mantelpiece, our framed photo faded to show he died thirty years ago.", "pause": 0.25},
]

# 2. MUSIC + SFX -------------------------------------------------------------
MUSIC = {
    "file": "music/fallen-down.mp3",
    "under_voice": 0.022,
    "gaps": 0.05,
    "dropouts": [("b10+0.4", "w5.end")],
}

SFX = [
    ("b1", "whoosh"),
    ("b1+1.0", "bell_low"),
    ("b3", "pop"),
    ("b4", "whoosh"),
    ("b4+0.5", "impact"),
    ("b4+1.1", "thud"),
    ("b4+1.8", "laugh"),
    ("b5", "whoosh"),
    ("b5+0.8", "bell_low"),
    ("b6+0.8", "swish"),
    ("b7+0.8", "pop", {"f": 520}),
    ("b8+1.0", "impact"),
    ("b9+1.2", "sad"),
    ("b10", "riser", {"dur": 2.0}),
    ("w1", "impact"),
    ("w2", "impact"),
    ("w3", "impact"),
    ("w4", "impact"),
    ("w5", "reveal"),
    ("b11+0.2", "thud"),
    ("b12+0.6", "sad"),
    ("b13+1.6", "twist"),
]

# 3. CAST --------------------------------------------------------------------
HERO = {
    "skin": "light",
    "hair": {"style": "messyFringe", "color": "darkBrown"},
    "top": {"style": "hoodie", "color": "orange", "secondary": "white"},
    "bottom": {"style": "jeans", "color": "#1E3A8A"},
    "shoes": {"style": "sneakers", "color": "#111827"},
}

BULLY = {
    "skin": "tan",
    "hair": {"style": "spikyAnime", "color": "black"},
    "top": {"style": "jacket", "color": "#18181B", "secondary": "#DC2626"},
    "bottom": {"style": "jeans", "color": "#374151"},
    "shoes": {"style": "boots", "color": "#09090B"},
}

GRANDPA = {
    "skin": "light",
    "hair": {"style": "grandpa", "color": "grey"},
    "freckles": False,
    "facialHair": "stubble",
    "facialHairColor": "#64748B",
    "gloves": "welder",
    "top": {"style": "tshirt", "color": "#475569", "secondary": "#CBD5E1"},
    "bottom": {"style": "pants", "color": "#334155"},
    "shoes": {"style": "formal", "color": "#1E293B"},
}

CAST = {
    "hero": HERO,
    "bully": BULLY,
    "grandpa": GRANDPA,
}

# 4. SCENES (High-Action Brawl + Active Emotional Kitchen Drama) -------------
def scenes(T):
    B, E, END = T.B, T.E, T.END

    S1_END = B["b5"] - 1
    S2_START = S1_END

    # Actor positions
    # School Exterior: Hero at -1.9, Bully at +1.9 (gap = 3.8 studs >= MIN_GAP 3.6)
    HERO_S = [-1.9, 0, 0]
    BULLY_S = [1.9, 0, 0]

    # Kitchen: Hero at -2.4, Grandpa at +2.4 (gap = 4.8 studs >= MIN_GAP 3.6)
    HERO_K = [-2.4, 0, 1.2]
    GRANDPA_K = [2.4, 0, 1.2]

    scenes_list = []

    # -------------------------------------------------------------------------
    # SCENE 1: school_exterior (Frames 0 -> B["b5"] - 1)
    # Hook, Name, Physical Bully Brawl (Punches, Shoves, Mud Tackle)
    # -------------------------------------------------------------------------
    b4_start = B["b4"]
    b4_dur = S1_END - b4_start
    f1 = b4_start + round(b4_dur * 0.33)
    f2 = b4_start + round(b4_dur * 0.67)

    s1_shots = [
        # 1. Wide establishing school exterior
        wide(0, B["b2"], [0, 0, 0], dist=18.0, height=6.6, fov=56),
        # 2. Close-up Theo
        close_up(B["b2"], B["b3"], HERO_S, dist=6.0, side=0.2, fov=40),
        # 3. Medium Theo confronting bully
        medium(B["b3"], b4_start, [0, 0, 0], dist=10.0, height=5.2, fov=48),
        # 4. Brawl Shot 1: Bully lunges in and violently shoves Theo
        shot(b4_start, f1, [2.2, 4.2, 7.5], [2.0, 4.0, 7.0], [0, 4.0, 0], [0, 4.0, 0], 48, shake=0.06),
        # 5. Brawl Shot 2: Theo charges back throwing counter-punches
        shot(f1, f2, [-2.2, 4.2, 7.0], [-2.0, 4.0, 6.5], [0, 4.0, 0], [0, 4.0, 0], 46, shake=0.08),
        # 6. Brawl Shot 3: Bully strikes, knocking Theo down into muddy backpack
        shot(f2, S1_END, [0, 3.2, 7.8], [0, 2.8, 7.2], [-0.5, 2.0, 0], [-0.5, 2.0, 0], 48, shake=0.08),
    ]

    s1_hero_kfs = [
        kf(0, HERO_S, 0.35, "talk", "shocked", prop="backpack"),
        kf(B["b2"], HERO_S, 0.35, "walk", "shocked", prop="backpack"),
        kf(B["b3"], HERO_S, 0.40, "talk", "angry", prop="backpack"),
        # The brawl begins
        kf(b4_start, [-1.8, 0, 0], HALF, "recoil", "shocked", prop="backpack"),
        kf(f1, [-1.8, 0, 0], HALF, "punch", "angry", prop="backpack"),
        kf(f2, [-1.9, 0, 0], HALF, "knocked", "shocked"),
        kf(f2 + 30, [-1.9, 0, 0], HALF, "fume", "angry"),
        kf(S1_END, [-1.9, 0, 0], HALF, "fume", "angry"),
    ]

    s1_bully_kfs = [
        kf(0, BULLY_S, -0.45, "idle", "cool"),
        kf(B["b2"], BULLY_S, -0.45, "point", "laugh"),
        kf(B["b3"], BULLY_S, -0.45, "fight", "laugh"),
        # The brawl actions
        kf(b4_start, [1.8, 0, 0], -HALF, "shove", "angry"),
        kf(f1, [1.8, 0, 0], -HALF, "recoil", "shocked"),
        kf(f2, [1.8, 0, 0], -HALF, "punch", "angry"),
        kf(f2 + 30, [1.9, 0, 0], -HALF, "celebrate", "laugh"),
        kf(S1_END, [1.9, 0, 0], -HALF, "celebrate", "laugh"),
    ]

    scenes_list.append({
        "id": "scene-school-hook",
        "location": "school_exterior",
        "schoolName": "MAPLE OAKS HIGH",
        "startFrame": 0,
        "endFrame": S1_END,
        "cameraShots": s1_shots,
        "characters": {
            "hero": s1_hero_kfs,
            "bully": s1_bully_kfs,
            "grandpa": [kf(0, OFF, 0, "idle", "deadpan")],
        },
    })

    # -------------------------------------------------------------------------
    # SCENE 2: kitchen (Frames S1_END -> END)
    # Dynamic Grandpa Stirring / Cooking, Welder's Gloves Macro Zoom, Burnt Pan,
    # Anger Snap, Climax Shouts with Pan Drop, Grandpa Dissolve, Empty Rocking Chair
    # -------------------------------------------------------------------------
    b5_mid = S2_START + round((B["b6"] - S2_START) / 2)
    b6_mid = B["b6"] + round((B["b7"] - B["b6"]) / 2)
    b7_mid = B["b7"] + 40
    b8_mid = B["b8"] + round((B["b9"] - B["b8"]) / 2)
    b9_mid = B["b9"] + round((B["b10"] - B["b9"]) / 2)
    b11_mid = B["b11"] + 45
    b12_mid = B["b12"] + 50
    b13_mid = B["b13"] + 55

    s2_shots = [
        # b5 Shot 1: Front door bursts wide open as Theo kicks through the doorway!
        shot(S2_START, b5_mid, [-4.5, 3.6, 5.8], [-4.8, 3.4, 5.0], [-10.8, 3.2, 1.0], [-9.2, 3.2, 1.0], 48, shake=0.08),
        # b5 Shot 2: Medium Theo trembling with fury inside the dead-silent kitchen
        medium(b5_mid, B["b6"], HERO_K, dist=7.8, height=4.8, fov=44),
        # b6: Grandpa actively cooking & stirring dinner at stove
        medium(B["b6"], b6_mid, GRANDPA_K, dist=8.5, height=5.0, fov=46),
        close_up(b6_mid, B["b7"], GRANDPA_K, dist=5.8, side=-0.2, fov=40),
        # b7: Welder's gloves clue - Grandpa presents empty gloves + MACRO ZOOM ON HOLLOW FINGERTIPS
        medium(B["b7"], b7_mid, GRANDPA_K, dist=6.8, height=4.2, fov=42),
        shot(b7_mid, B["b8"], [3.3, 3.2, 5.4], [3.3, 3.1, 4.8], [3.3, 2.9, 3.0], [3.3, 2.9, 3.0], 36),
        # b8: Reverse medium cut: Theo reacting in horror
        close_up(B["b8"], b8_mid, HERO_K, dist=5.2, side=0.1, fov=38),
        medium(b8_mid, B["b9"], GRANDPA_K, dist=8.0, height=4.8, fov=44),
        # b9: Grandpa turns holding burned pan + Theo rage boiling
        medium(B["b9"], b9_mid, [0, 0, 1.2], dist=11.0, height=5.0, fov=46),
        close_up(b9_mid, B["b10"], HERO_K, dist=5.2, side=0.1, fov=38),
        # b10: Dramatic low-angle push on enraged Theo clenching trembling fists
        shot(B["b10"], B["w1"], [-2.4, 2.5, 5.0], [-2.4, 2.2, 4.2], [-2.4, 3.8, 1.2], [-2.4, 3.8, 1.2], 40, shake=0.06),
        # Climax Shouts: rapid cuts per shout group
        close_up(B["w1"], B["w4"], HERO_K, dist=4.8, fov=38, shake=0.10),
        wide(B["w4"], B["b11"], [0, 0, 1.2], dist=14.5, height=5.6, fov=52, shake=0.12),
        # b11: Empty space where Grandpa dissolved + Theo in shock
        shot(B["b11"], b11_mid, [2.4, 3.4, 5.8], [2.4, 3.0, 5.0], [2.4, 1.8, 1.2], [2.4, 1.8, 1.2], 42),
        close_up(b11_mid, B["b12"], HERO_K, dist=5.2, side=-0.1, fov=38),
        # b12 Shot 1: Clattering pan on floor + towering empty rocking chair behind it
        shot(B["b12"], b12_mid, [2.2, 3.2, 7.5], [2.4, 3.0, 6.8], [4.4, 1.5, 1.2], [4.5, 1.5, 1.2], 48),
        # b12 Shot 2: Medium push on empty rocking chair gently creaking in the stillness
        shot(b12_mid, B["b13"], [5.4, 2.5, 6.2], [5.4, 2.3, 5.2], [5.4, 1.8, 1.2], [5.4, 1.8, 1.2], 44),
        # b13: Slow push on mantelpiece framed photo twist + Final Theo cut
        shot(B["b13"], b13_mid, [0.0, 5.2, 8.5], [0.0, 4.8, 7.2], [0.0, 4.8, -3.0], [0.0, 4.8, -3.0], 44),
        close_up(b13_mid, END, HERO_K, dist=5.0, side=-0.1, fov=36),
    ]

    s2_hero_kfs = [
        # Starts at front door threshold kicking door open, then storms forward to HERO_K
        kf(S2_START, [-11.2, 0, 1.0], HALF, "shove", "angry"),
        kf(b5_mid, [-8.5, 0, 1.0], HALF, "fume", "angry"),
        kf(B["b6"], HERO_K, 0.45, "talk", "shocked"),
        kf(B["b7"], HERO_K, 0.45, "talk", "shocked"),
        kf(B["b8"], HERO_K, 0.45, "cower", "shocked"),
        kf(B["b9"], HERO_K, 0.55, "fume", "angry"),
        kf(B["b10"], HERO_K, 0.55, "fume", "angry"),
        # Climax shouts: high intensity shout stance
        kf(B["w1"], HERO_K, 0.55, "shout", "angry"),
        # Tragic aftermath: grief and devastation
        kf(B["b11"], HERO_K, 0.35, "despair", "sad"),
        kf(B["b12"], HERO_K, 0.25, "plead", "sad"),
        kf(B["b13"], HERO_K, 0.15, "despair", "sad"),
        kf(END, HERO_K, 0.15, "despair", "sad"),
    ]

    s2_grandpa_kfs = [
        # Cooking & actively stirring at stove (quiet, non-speaking)
        kf(S2_START, GRANDPA_K, -0.65, "cook", "deadpan", prop="pan"),
        kf(B["b6"], GRANDPA_K, -0.65, "cook", "deadpan", prop="pan"),
        # Steps forward presenting hollow welder's gloves in sorrow (hands free for visual clarity)
        kf(B["b7"], GRANDPA_K, -0.20, "plead", "sad"),
        kf(B["b8"], GRANDPA_K, -0.20, "plead", "sad"),
        # Turns toward Theo with burned pan
        kf(B["b9"], GRANDPA_K, -0.70, "plead", "sad", prop="pan"),
        kf(B["b10"], GRANDPA_K, -0.70, "cower", "shocked", prop="pan"),
        # Drops pan in shock as shout hits
        kf(B["w1"], GRANDPA_K, -0.70, "drop_pan", "shocked", prop="pan"),
        # Dissolves into thin air
        kf(B["b11"], OFF, 0, "knocked", "panic"),
        kf(END, OFF, 0, "knocked", "panic"),
    ]

    scenes_list.append({
        "id": "scene-kitchen-drama",
        "location": "kitchen",
        "variant": "red",
        "startFrame": S2_START,
        "endFrame": END,
        "cameraShots": s2_shots,
        "characters": {
            "hero": s2_hero_kfs,
            "grandpa": s2_grandpa_kfs,
            "bully": [kf(S2_START, OFF, 0, "idle", "deadpan")],
        },
    })

    return scenes_list
