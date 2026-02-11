import Matter from 'matter-js';

export class PhysicsSystem {
    public engine: Matter.Engine;
    public playerBody: Matter.Body | null = null;
    public isTouchingGround: boolean = false;

    public isStandingOnSzola: boolean = false;

    // Zmienne do Fixed Timestep
    private accumulator: number = 0;
    private readonly fixedStep: number = 1000 / 60; // ~16.66ms (Sztywne 60 FPS dla fizyki)
    private readonly maxFrameTime: number = 60; // Max 60ms do symulacji na jedną klatkę graficzną (zabezpieczenie przed spiralą śmierci)

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
        // Detect Player
        let playerBody: Matter.Body | null = null;
        let otherBody: Matter.Body | null = null;

        if (bodyA.label === 'player') { playerBody = bodyA; otherBody = bodyB; }
        else if (bodyB.label === 'player') { playerBody = bodyB; otherBody = bodyA; }

        if (playerBody && otherBody) {
            // Check for Standard Ground
            if (otherBody.label === 'ground') {
                this.isTouchingGround = isActive;
            }
            // Check for Moving Ground (Szola)
            else if (otherBody.label === 'ground_moving') {
                this.isTouchingGround = isActive;   // Treat as ground for jump/run mechanics
                this.isStandingOnSzola = isActive;  // Set specific flag
            }
        }
    }

    // 🛑 GŁÓWNA POPRAWKA: Fixed Timestep z Sub-steppingiem
    public update(delta: number) {
        // 1. Konwertujemy delta z Pixi (jednostki klatek) na milisekundy
        // Pixi zakłada, że delta 1.0 = ~16.66ms (przy 60FPS)
        let frameTime = delta * 16.66;

        // 2. Clamp: Jeśli lag jest potężny (np. przeglądarka spała), ucinamy czas.
        // Zapobiega to gigantycznym skokom i teleportacji gracza.
        if (frameTime > this.maxFrameTime) {
            frameTime = this.maxFrameTime;
        }

        // 3. Dodajemy czas do akumulatora
        this.accumulator += frameTime;

        // 4. "Zjadamy" czas w sztywnych kawałkach po 16.66ms
        // Jeśli gra działa w 120Hz, pętla może się nie wykonać wcale (akumulator czeka).
        // Jeśli gra działa w 30Hz, pętla wykona się 2 razy (2 * 16.66ms).
        while (this.accumulator >= this.fixedStep) {
            Matter.Engine.update(this.engine, this.fixedStep);
            this.accumulator -= this.fixedStep;
        }
    }

    public cleanup() {
        Matter.Engine.clear(this.engine);
        // Reset akumulatora przy restarcie
        this.accumulator = 0;
    }
}