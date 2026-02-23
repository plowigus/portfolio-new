import Matter from 'matter-js';

export class PhysicsSystem {
    public engine: Matter.Engine;
    public playerBody: Matter.Body | null = null;
    public isTouchingGround: boolean = false;

    public isStandingOnSzola: boolean = false;

    private accumulator: number = 0;
    private readonly fixedStep: number = 1000 / 60;
    private readonly maxFrameTime: number = 60;

    constructor() {
        this.engine = Matter.Engine.create();
        this.engine.gravity.y = 0;
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
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                this.checkGroundCollision(bodyA, bodyB, true);
            });
        });

        Matter.Events.on(this.engine, 'collisionActive', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                this.checkGroundCollision(bodyA, bodyB, true);
            });
        });

        Matter.Events.on(this.engine, 'collisionEnd', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                this.checkGroundCollision(bodyA, bodyB, false);
            });
        });
    }

    private checkGroundCollision(bodyA: Matter.Body, bodyB: Matter.Body, isActive: boolean) {
        let playerBody: Matter.Body | null = null;
        let otherBody: Matter.Body | null = null;

        if (bodyA.label === 'player') { playerBody = bodyA; otherBody = bodyB; }
        else if (bodyB.label === 'player') { playerBody = bodyB; otherBody = bodyA; }

        if (playerBody && otherBody) {
            if (otherBody.label === 'ground') {
                this.isTouchingGround = isActive;
            }
            else if (otherBody.label === 'ground_moving') {
                this.isTouchingGround = isActive;
                this.isStandingOnSzola = isActive;
            }
        }
    }

    public update(delta: number) {
        let frameTime = delta * 16.66;
        if (frameTime > this.maxFrameTime) {
            frameTime = this.maxFrameTime;
        }

        this.accumulator += frameTime;

        while (this.accumulator >= this.fixedStep) {
            Matter.Engine.update(this.engine, this.fixedStep);
            this.accumulator -= this.fixedStep;
        }
    }

    public cleanup() {
        Matter.Engine.clear(this.engine);
        this.accumulator = 0;
    }
}