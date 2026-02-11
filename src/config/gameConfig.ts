// Collision Categories (Powers of 2 bitmasks)
export const COLLISION_CATEGORIES = {
    PLAYER: 0x0001,
    GROUND: 0x0002,
    ENEMY: 0x0004,
    PLAYER_ATTACK: 0x0008,
    ENEMY_PROJECTILE: 0x0010,
};

export const GAME_CONFIG = {
    width: 1080,
    height: 450,
    debugMode: false,
    COMMODORE_64_INTRO: false,

    // Physics
    moveSpeed: 7,
    maxMoveSpeed: 12,
    characterScale: 0.3,
    animationSpeed: 0.25,
    gravity: 0.52,
    jumpPower: -12,

    // Camera
    scrollThresholdX: 200,
    leftBoundary: 40,
    maxFallSpeed: 20,
    friction: 0.9,
    deathFallThreshold: 200,

    // Player Health
    maxLives: 3,

    // Enemy Settings (Zostawiamy, ale bez ustawień fal)
    enemySpawnChance: 0.4, // Szansa na spawn na platformie
    yellowSpawnInterval: 300,

    ENEMY_CONFIG: {
        BLUE: {
            type: 'MINE_CART',
            baseSpeed: 1.5,
            hp: 10,
            maxCount: 2,

            // Assets
            bodyAsset: 'wozek',
            wheelAsset: 'wheel',

            // Physics Dimensions
            width: 100,
            height: 60,

            // Visual Offsets & Scaling
            hitboxOffsetX: 0,
            hitboxOffsetY: 0,   // Adjust body sprite Y relative to physics center

            wheelOffsetX: 25,   // Distance from center to wheel (Spread)
            wheelOffsetY: 45,   // Distance from center down to wheel axle (Height)
            wheelScale: 0.4,    // Scale of wheel sprite
            spawnHeightOffset: -10,
            rotationSpeed: 0.06, // Speed of wheel rotation
            collisionOffsetTop: 0, // Tolerance for standing on top

            // Dinner (Obiod) on cart
            hasDinnerChance: 0.33,   // 1.0 = 100% for testing
            dinnerOffsetX: 250,       // X offset from cart center
            dinnerOffsetY: -230,    // Y offset (was dinnerOffset, renamed for clarity but keeping fallback)
            dinnerSize: 40,         // Hitbox diameter
            dinnerScale: 0.23,      // Visual scale
            dinnerAnimSpeed: 0.15    // Animation speed
        },
        RED: {
            color: 0xFF0000,
            width: 50, height: 50,
            hp: 1,
            attackCooldown: 180, // Strzał co 2 sekundy
            burstCount: 3,       // Czerwony strzela pojedynczo
            burstDelay: 50,
            safeEdgeBuffer: 150  // 🆕 Musi być min. 150px od krawędzi platformy
        },
        YELLOW: {
            color: 0xFFFF00,
            speed: 3,
            width: 60, height: 40,
            hp: 1,
            flyHeight: 280,      // Wysoko nad głową
            attackCooldown: 180, // Co 3 sekundy seria
            burstCount: 3,       // 🆕 SERIA 3 BOMBA
            burstDelay: 15,      // 🆕 Szybkie odstępy (15 klatek = 0.25s)
            maxCount: 2
        },
        PROJECTILE: {
            bulletSpeed: 4,
            bombSpeed: 4,       // Bardzo szybki spad
            bombGravity: 0.5,    // Ciężka bomba
            fizzleTime: 100,     // Szybko znika po uderzeniu w ziemię
            size: 10
        }
    },

    // Spawner Settings (Bez Areny)
    // Spawner Settings (Bez Areny)
    spawnMinTime: 90,
    spawnMaxTime: 150,
    platformHeight: 100,
    minGap: 240,
    maxGap: 380,
    minPlatformWidth: 650, // Zwiększamy minimum, żeby zmieściły się bufory
    maxPlatformWidth: 1700,

    // 🆕 NOWE ZMIENNE BEZPIECZEŃSTWA
    safeEdgeBuffer: 450,   // Margines od krawędzi (było 300 w 'safeEdgeBuffer', ale to dla generowania platform, dodajmy specificzne dla przeszkód)
    platformEdgeBuffer: 350, // Przeszkoda min. 150px od początku/końca
    obstacleMinGap: 450,     // Przeszkoda min. 350px od innej przeszkody
    enemySafeDistance: 400,  // Min distance between enemy and obstacle

    // Visuals & Offsets
    characterVisualOffset: -15,
    coyoteTime: 6,
    jumpBuffer: 8,
    knockbackX: 100,
    knockbackY: -30,
    knockbackHighX: 100,
    knockbackHighY: -30,
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
