import * as PIXI from 'pixi.js';
// import Stats from 'stats.js';
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

        this.debugGraphics.zIndex = 9999;
        this.app.stage.addChild(this.debugGraphics);
    }

    public get stage() {
        return this.app.stage;
    }

    public beginFrame() {
        // this.stats.begin();
    }

    public endFrame() {
        // this.stats.end();
    }

    public renderDebug(bodies: Matter.Body[]) {
        if (!GAME_CONFIG.debugMode) {
            this.debugGraphics.clear();
            return;
        }

        this.debugGraphics.clear();
        this.debugGraphics.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        this.debugGraphics.stroke({ width: 2, color: 0x00ff00, alpha: 0.3 });

        bodies.forEach(body => {
            if (body.vertices.length < 1) return;

            this.debugGraphics.moveTo(body.vertices[0].x, body.vertices[0].y);
            for (let j = 1; j < body.vertices.length; j += 1) {
                this.debugGraphics.lineTo(body.vertices[j].x, body.vertices[j].y);
            }
            this.debugGraphics.lineTo(body.vertices[0].x, body.vertices[0].y);

            let color = 0x000000;
            if (body.label === 'player') color = 0xff0000;
            else if (body.label.includes('obstacle') || body.label.includes('coin')) color = 0xffff00;
            else if (body.label === 'ground') color = 0x0000ff;

            this.debugGraphics.stroke({ width: 2, color: color });
        });
    }

    public cleanup() {
        if (this.app) {
            try {
                this.app.destroy(true, { children: true, texture: false, textureSource: false });
            } catch (e) {
                console.warn("Renderer cleanup error:", e);
            }
        }

    }
}