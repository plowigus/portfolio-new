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
        Matter.Engine.update(this.engine, delta * 16.66);
    }

    public cleanup() {
        Matter.Engine.clear(this.engine);
    }
}
