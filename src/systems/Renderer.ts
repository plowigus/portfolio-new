import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../config/gameConfig';

export class RendererSystem {
    public app: PIXI.Application;
    public container: HTMLDivElement | null = null;
    public debugGraphics: PIXI.Graphics;

    constructor() {
        this.app = new PIXI.Application();
        this.debugGraphics = new PIXI.Graphics();
    }

    public async init(container: HTMLDivElement) {
        this.container = container;
        await this.app.init({
            width: GAME_CONFIG.width,
            height: GAME_CONFIG.height,
            backgroundAlpha: 0,
        });

        container.appendChild(this.app.canvas);
        this.app.stage.addChild(this.debugGraphics);
    }

    public get stage() {
        return this.app.stage;
    }

    public renderDebug(bodies: Matter.Body[]) {
        if (!GAME_CONFIG.debugMode) return;

        this.debugGraphics.clear();
        this.debugGraphics.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        this.debugGraphics.stroke({ width: 2, color: 0x000000, alpha: 0.1 });

        bodies.forEach(body => {
            if (body.vertices.length < 1) return;

            this.debugGraphics.moveTo(body.vertices[0].x, body.vertices[0].y);
            for (let j = 1; j < body.vertices.length; j += 1) {
                this.debugGraphics.lineTo(body.vertices[j].x, body.vertices[j].y);
            }
            this.debugGraphics.lineTo(body.vertices[0].x, body.vertices[0].y);

            let color = 0x000000;
            if (body.label === 'player') color = 0xff0000;
            else if (body.label.includes('obstacle')) color = 0xffa500;
            else if (body.label === 'ground') color = 0x0000ff;
            else if (body.label === 'coin') color = 0xFFD700;

            this.debugGraphics.stroke({ width: 2, color: color });
        });

        // Ensure debug is always on top
        this.app.stage.setChildIndex(this.debugGraphics, this.app.stage.children.length - 1);
    }

    public cleanup() {
        if (this.app) {
            this.app.destroy(true, { children: true, texture: true });
        }
    }
}
