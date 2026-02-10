export interface PlayerAnimationConfig {
    animationSpeed: number; // Speed of playback (0.1 - 1.0)
    scale: { x: number, y: number }; // Visual scaling (e.g., 1 or 2)
    anchor: { x: number, y: number }; // Pivot point (usually 0.5, 0.5)
    offset: { x: number, y: number }; // Visual offset in pixels from the physics body center
    flipCorrectionX?: number; // Pixel offset applied ONLY when facing left
    attackHitbox?: {
        width: number;
        height: number;
        offsetX: number; // Distance in front of the player center
        offsetY: number; // Vertical offset from player center
    };
}

export const PLAYER_CONFIG: Record<string, PlayerAnimationConfig> = {
    IDLE: {
        animationSpeed: 0.25,
        scale: { x: 1, y: 1 },
        anchor: { x: 0.5, y: 0.5 },
        offset: { x: 0, y: 0 }
    },
    RUN: {
        animationSpeed: 0.30, // Will be modulated by move speed in logic
        scale: { x: 1, y: 1 },
        anchor: { x: 0.5, y: 0.5 },
        offset: { x: 0, y: 0 }
    },
    JUMP: {
        animationSpeed: 0.25,
        scale: { x: 1, y: 1 },
        anchor: { x: 0.5, y: 0.46 },
        offset: { x: 0, y: 0 }
    },
    SLIDE: {
        animationSpeed: 0.35,
        scale: { x: 1.0, y: 1.0 },
        anchor: { x: 0.5, y: 0.5 },
        offset: { x: 0, y: 0 }
    },
    DEAD: {
        animationSpeed: 0.25,
        scale: { x: 1, y: 1 },
        anchor: { x: 0.5, y: 0.5 },
        offset: { x: 0, y: 0 }
    },
    KICK: {
        animationSpeed: 0.60,
        scale: { x: 2.3, y: 2.3 }, // Upscaled to match 400px assets
        anchor: { x: 0.45, y: 0.5 },
        offset: { x: 0, y: 0 },
        attackHitbox: {
            width: 60,
            height: 50,
            offsetX: 20,
            offsetY: 0
        }
    },
    PUNCH: {
        animationSpeed: 0.60,
        scale: { x: 2.2, y: 2.2 }, // Upscaled to match 400px assets
        anchor: { x: 0.4, y: 0.5 },
        offset: { x: 0, y: 0 },
        attackHitbox: {
            width: 55,
            height: 40,
            offsetX: 30,
            offsetY: -20
        }
    }
};
