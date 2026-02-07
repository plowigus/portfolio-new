export const GAME_CONFIG = {
    width: 1080,
    height: 450,
    debugMode: false,
    moveSpeed: 7,
    maxMoveSpeed: 12,
    characterScale: 0.3,
    animationSpeed: 0.25,
    gravity: 0.52,
    jumpPower: -12,
    groundY: 450 / 2,
    obstacleSpeed: 5,
    spawnMinTime: 60,
    spawnMaxTime: 150,
    knockbackX: 100, // Barrels (Low)
    knockbackY: -30,
    knockbackHighX: 100, // Blue (High)
    knockbackHighY: -30,
    platformHeight: 100,
    minGap: 240,
    maxGap: 320,
    minPlatformWidth: 400,
    maxPlatformWidth: 1000,
    safeEdgeBuffer: 300,
    characterVisualOffset: -15,
    coyoteTime: 6,
    jumpBuffer: 8,
    obstacleLowOffset: -25,
    obstacleHighOffset: -45,
    coinSize: 30, // Keep for fallback or refactor rename
    coinHitbox: 20,
    kluskaScale: 0.13, // 40px / 300px
    kluskaAnimationSpeed: 0.1,
    kluskaHitbox: 20,
    coinSpawnChance: 0.6,
    maxCoinGroupSize: 5,
    coinSpacing: 50,
    coinArcCurve: 20,
    coinGapHeight: 150,
    coinLowObsHeight: 150,
    coinHighJumpHeight: 140,
    coinSlideHeight: -10,

    // Background Settings
    bgScaleMultiplier: 1,
    bgParallaxSpeed: 0.03,
    bgOffsetY: 0, // Adjust to lift background up/down

    // Obstacle Settings (Barrel)
    barrelScale: 1,
    barrelOffsetX: 0,
    barrelOffsetY: -500,

    // Obstacle Settings (Opony - Low)
    oponyScale: 0.45,
    oponyHitboxWidth: 40,
    oponyHitboxHeight: 40,
    oponyHitboxOffsetX: 0,
    oponyHitboxOffsetY: 0, // 0 means exactly on ground level (if anchor is bottom)
    oponyVisualOffsetX: 0,
    oponyVisualOffsetY: 61,

    // Obstacle Settings (Klopsztanga - High)
    klopsztangaScale: 0.7,

    // HITBOX (Physics) - Where the player dies
    klopsztangaHitboxWidth: 40,
    klopsztangaHitboxHeight: 120,
    klopsztangaHitboxOffsetX: -30,
    klopsztangaHitboxOffsetY: -80, // Higher negative value = higher hitbox (gap at bottom)

    // VISUAL (Sprite) - Where the image is drawn
    klopsztangaVisualOffsetX: 0,   // Shift the image LEFT/RIGHT
    klopsztangaVisualOffsetY: 70,   // Shift the image UP/DOWN (e.g. to sink legs into ground)

    // Sprint & Trail Settings
    sprintSpeed: 12,
    trailInterval: 4,
    trailFadeSpeed: 0.05,
    trailStartAlpha: 0.5,
    trailTint: 0xffffff,

    // Death Sequence Settings
    deathSlowMotionScale: 0.2, // 20% speed
    deathDuration: 180, // Duration units (logic frames)
    deathGhostAlpha: 0.6, // Visual transparency
    deathGhostTint: 0xffffff, // Red
    deathTrailIntervalMultiplier: 10, // Spawns trails less frequently than sprint


    // UI & Talking Head
    faceAnimationSpeed: 150,      // ms per frame
    quoteDuration: 4000,          // ms
    SILESIAN_QUOTES: [
        "Jeronie, ale mosz apetyt!",
        "Toż to prawdziwy Kluskożerca!",
        "Nigdzie nie ma takich klusek jak w Bytomiu!",
        "Dej pozór! Gumiklejzy!",
        "Badej, jak on szkubie te kluski!",
        "Godej co chcesz, kluski to życie!",
        "Wcina jakby tydzień nie jadł!",
        "O pierona, ale tempo!",
        "Fest dobry zawodnik!"
    ]
} as const;

export type GameConfig = typeof GAME_CONFIG;
