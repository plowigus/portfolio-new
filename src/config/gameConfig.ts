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
    COMMODORE_64_INTRO: true,

    // Physics
    moveSpeed: 7,
    maxMoveSpeed: 10,
    characterScale: 0.3,
    animationSpeed: 0.25,
    gravity: 0.52,
    jumpPower: -12,

    // Camera
    scrollThresholdX: 300,
    leftBoundary: 40,
    maxFallSpeed: 20,
    friction: 0.95,
    deathFallThreshold: 200,

    // Player Health
    maxLives: 3,

    // Enemy Settings (Zostawiamy, ale bez ustawień fal)
    enemySpawnChance: 0.4,
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
            hitboxOffsetY: 0,

            wheelOffsetX: 25,
            wheelOffsetY: 45,
            wheelScale: 0.4,
            spawnHeightOffset: -10,
            rotationSpeed: 0.06,
            collisionOffsetTop: 0,

            // Dinner (Obiod) on cart
            hasDinnerChance: 0.4,
            dinnerOffsetX: 400,
            dinnerOffsetY: -230,
            dinnerSize: 40,
            dinnerScale: 0.20,
            dinnerAnimSpeed: 0.15
        },
        RED: {
            type: 'STATIONARY_SHOOTER',
            color: 0xFF0000,
            width: 50, height: 50,
            hp: 1,
            attackCooldown: 180,
            burstCount: 3,
            burstDelay: 50,
            safeEdgeBuffer: 150,

            // Visuals (New)
            assetName: 'klasyk',
            scale: 0.34,
            anchorX: 0.45,
            anchorY: 0.40,
            visualOffsetX: 0,
            visualOffsetY: 70,
            animationSpeed: 0.16,

            // Hitbox Offsets (if needed relative to sprite)
            hitboxOffsetX: 0,
            hitboxOffsetY: 0,

            // Muzzle Flash (Fire) Settings
            fireAssetName: 'fire',
            fireScale: 1.0,
            fireOffsetX: -40,
            fireOffsetY: -15,
            fireAnimationSpeed: 0.3,
            fireDuration: 20,

            // Projectile Settings (Trash Ball)
            projectileAsset: 'trashball',
            projectileSpeed: 5,
            projectileScale: 0.9,
            projectileHitboxSize: 15,
            projectileAnimationSpeed: 0.15,

            // Projectile Glow Settings
            projectileGlowColor: 0x005300,
            projectileGlowAlpha: 1,
            projectileGlowBlur: 10,
            projectileGlowSizeOffset: 5,
        },
        YELLOW: {
            color: 0xFFFF00,
            speed: 3,
            width: 60, height: 40,
            hp: 10,
            flyHeight: 280,
            attackCooldown: 180,
            burstCount: 3,
            burstDelay: 20,
            maxCount: 1,

            // Visuals
            assetName: 'pigeon',
            scale: 0.6,
            animationSpeed: 0.15,
            visualOffsetX: 0,
            visualOffsetY: 0,

            // Projectile (Pigeon Poop)
            projectileAsset: 'pigeon_poop',
            projectileScale: 1.5,
            projectileHitboxSize: 12,
            projectileAnimationSpeed: 0.4,
        },
        PROJECTILE: {
            bulletSpeed: 4,
            bombSpeed: 6,
            bombGravity: 0.7,
            fizzleTime: 100,
            size: 10
        }
    },

    spawnMinTime: 90,
    spawnMaxTime: 150,
    platformHeight: 100,
    minGap: 240,
    maxGap: 380,
    minPlatformWidth: 650,
    maxPlatformWidth: 1700,

    // 🆕 NOWE ZMIENNE BEZPIECZEŃSTWA
    safeEdgeBuffer: 450,
    platformEdgeBuffer: 350,
    obstacleMinGap: 450,
    enemySafeDistance: 300,

    // Visuals & Offsets
    characterVisualOffset: -15,
    coyoteTime: 6,
    jumpBuffer: 8,
    knockbackX: 100,
    knockbackY: -30,
    knockbackHighX: 100,
    knockbackHighY: -30,
    obstacleHighOffset: -45,
    coinSize: 30,
    coinHitbox: 20,
    kluskaScale: 0.13,
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
    bgOffsetY: 0,

    // Obstacle Settings (Barrel)
    barrelScale: 0.68,
    barrelVisualOffsetX: 0,
    barrelVisualOffsetY: -13,
    barrelAnchorX: 0.4,
    barrelAnchorY: 0.72,

    // NEW: Barrel Hitbox Settings
    barrelHitboxWidth: 40,
    barrelHitboxHeight: 80,
    barrelHitboxOffsetX: 0,
    barrelHitboxOffsetY: 60,

    // Obstacle Settings (Neon META - High)
    metaScale: 0.65,
    metaVisualOffsetX: 0,
    metaVisualOffsetY: -160, // High up for sliding under

    // Hitbox
    metaHitboxWidth: 300,
    metaHitboxHeight: 120,
    metaHitboxOffsetX: 0,
    metaHitboxOffsetY: -80,

    // Obstacle Settings (Opony - Low)
    oponyScale: 0.45,
    oponyHitboxWidth: 90,
    oponyHitboxHeight: 100,
    oponyHitboxOffsetX: 0,
    oponyHitboxOffsetY: 50, // 0 means exactly on ground level (if anchor is bottom)
    oponyVisualOffsetX: 0,
    oponyVisualOffsetY: 61,

    // Obstacle Settings (Bum/Bench - Low)
    bumScale: .6,
    bumVisualOffsetX: 0,
    bumVisualOffsetY: 120, // Adjust to align bench legs with ground

    // Hitbox (Physics)
    bumHitboxWidth: 160,  // Wider than a barrel (it's a bench)
    bumHitboxHeight: 40,  // Low enough to jump over
    bumHitboxOffsetX: 0,
    bumHitboxOffsetY: 0,  // 0 usually means sitting on the ground line

    // Obstacle Settings (Kafelok - Low)
    kafelokScale: .5,
    kafelokVisualOffsetX: 0,
    kafelokVisualOffsetY: 65,

    // Hitbox (Physics)
    kafelokHitboxWidth: 140,   // Irregular pile, slightly wider
    kafelokHitboxHeight: 60,  // Low enough to jump over
    kafelokHitboxOffsetX: 0,
    kafelokHitboxOffsetY: 45,
    kafelokCoinJumpHeight: 120, // Lower than default (150) because obstacle is higher

    // Obstacle Settings (Klopsztanga - High)
    klopsztangaScale: 0.7,

    // HITBOX (Physics) - Where the player dies
    klopsztangaHitboxWidth: 140,
    klopsztangaHitboxHeight: 120,
    klopsztangaHitboxOffsetX: 0,
    klopsztangaHitboxOffsetY: -80, // Higher negative value = higher hitbox (gap at bottom)

    // VISUAL (Sprite) - Where the image is drawn
    klopsztangaVisualOffsetX: 0,   // Shift the image LEFT/RIGHT
    klopsztangaVisualOffsetY: 70,   // Shift the image UP/DOWN (e.g. to sink legs into ground)

    // Szola (Elevator) Settings
    szolaScale: 1.0,
    szolaGapSize: 900,         // Width of the pit the player has to cross
    szolaMoveRange: 40,       // Amplitude of movement (up/down pixels)
    szolaMoveSpeed: 0.003,     // Speed of the sine wave

    // Visual & Hitbox
    szolaWidth: 120,           // Visual width (approx)
    szolaFloorHeight: 20,      // The thickness of the floor hitbox (player stands on this)
    szolaVisualOffsetX: 0,
    szolaVisualOffsetY: -180,
    szolaHitboxOffsetY: 90,  // Offset to place the hitbox at the BOTTOM of the cage image

    // Sprint & Trail Settings
    sprintSpeed: 11,
    trailInterval: 4,
    trailFadeSpeed: 0.05,
    trailStartAlpha: 0.3,
    trailTint: 0xffffff,

    // Death Sequence Settings
    deathSlowMotionScale: 0.2, // 20% speed
    deathDuration: 360, // Duration units (logic frames)
    deathGhostAlpha: 0.2, // Visual transparency
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
    ],

    // Momo Tattoo Shop Promo Event
    MOMO_EVENT: {
        triggerCoinCount: 200,
        reward: 100,
        question: "Hej! Szukasz dziarki z charakterem? Gdzie znajdziesz Serce na Dłoni?",
        answers: [
            "W Bytomiu!",
            "Na Marsie",
            "W Sosnowcu",
            "Pod ziemią"
        ],
        correctAnswerIndex: 0,

        // Shop (serce_tattoo) visuals
        shopScale: 1,
        shopOffsetX: 0,
        shopOffsetY: 79,

        // Momo NPC visuals
        momoScale: 0.5,
        momoOffsetX: -230,
        momoOffsetY: 70,

        // How far (px) onto the platform the player must walk before the quiz modal triggers
        modalTriggerDistance: 700,

        platformWidth: 2000
    }

} as const;

export type GameConfig = typeof GAME_CONFIG;
