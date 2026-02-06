import Matter from 'matter-js';

export class PhysicsSystem {
    public engine: Matter.Engine;
    public playerBody: Matter.Body | null = null;
    public isTouchingGround: boolean = false;

    constructor() {
        this.engine = Matter.Engine.create();
        this.engine.gravity.y = 0; // Custom gravity handling as per original code
        this.setupCollsionEvents();
    }

    public createPlayer(): Matter.Body {
        const playerHitboxWidth = 30;
        const playerHitboxHeight = 80;

        this.playerBody = Matter.Bodies.rectangle(
            200,
            0,
            playerHitboxWidth, playerHitboxHeight,
            {
                isSensor: false,
                label: 'player',
                friction: 0,
                frictionAir: 0,
                inertia: Infinity
            }
        );
        Matter.World.add(this.engine.world, this.playerBody);
        return this.playerBody;
    }

    private setupCollsionEvents() {
        // Start
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                this.checkGroundCollision(bodyA, bodyB, true);
            });
        });

        // Active
        Matter.Events.on(this.engine, 'collisionActive', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                this.checkGroundCollision(bodyA, bodyB, true);
            });
        });

        // End
        Matter.Events.on(this.engine, 'collisionEnd', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                this.checkGroundCollision(bodyA, bodyB, false);
            });
        });
    }

    private checkGroundCollision(bodyA: Matter.Body, bodyB: Matter.Body, isActive: boolean) {
        if ((bodyA.label === 'player' && bodyB.label === 'ground') ||
            (bodyB.label === 'player' && bodyA.label === 'ground')) {
            this.isTouchingGround = isActive;
        }
    }

    public update(delta: number) {
        // 🛑 FIX: CLAMP DELTA
        // Ograniczamy deltę do max 2.0 (czyli symulujemy spadek do 30 FPS).
        // Jeśli Firefox "czknie" i da deltę 5.0, my i tak policzymy tylko 2.0.
        // To zapobiega "Moon Jump" (wystrzeleniu w kosmos).
        const safeDelta = Math.min(delta, 2.0);

        // Standardowy update Matter.js
        // 16.66ms to baza dla 60FPS. Mnożymy przez bezpieczną deltę.
        Matter.Engine.update(this.engine, safeDelta * 16.66);
    }

    public cleanup() {
        Matter.Engine.clear(this.engine);
    }
}