export const GAME_CONFIG = {
    width: 1080,
    height: 450,
    debugMode: false,
    moveSpeed: 7,
    maxMoveSpeed: 12,
    characterScale: 0.3,
    animationSpeed: 0.25,
    gravity: 0.22,
    jumpPower: -11,
    groundY: 450 / 2,
    obstacleSpeed: 5,
    spawnMinTime: 60,
    spawnMaxTime: 150,
    knockbackX: 20,
    knockbackY: -10,
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
    coinSize: 30,
    coinHitbox: 20,
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
    barrelOffsetY: -400
} as const;

export type GameConfig = typeof GAME_CONFIG;
