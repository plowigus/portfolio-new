export interface PlayerAnimationConfig {
    animationSpeed: number;
    scale: { x: number, y: number };
    anchor: { x: number, y: number };
    offset: { x: number, y: number };
    flipCorrectionX?: number;
    attackHitbox?: {
        width: number;
        height: number;
        offsetX: number;
        offsetY: number;
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
        animationSpeed: 0.25,
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
        scale: { x: 2.3, y: 2.3 },
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
        scale: { x: 2.2, y: 2.2 },
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
