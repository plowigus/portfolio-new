import * as PIXI from 'pixi.js';

export class AssetManager {
    public animations: Record<string, PIXI.Texture[]> = {};
    public textures: Record<string, PIXI.Texture> = {};


    public async loadAssets() {
        // Parallel loading of all assets
        const [
            idleSheet, idleTex,
            runSheet, runTex,
            jumpSheet, jumpTex,
            slideSheet, slideTex,
            deadSheet, deadTex,
            floorTex,
            bgTex,
            barrelSheet, barrelTex,
            kluskiSheet, kluskiTex
        ] = await Promise.all([
            PIXI.Assets.load('/assets/character/idle.json'),
            PIXI.Assets.load('/assets/character/idle.png'),
            PIXI.Assets.load('/assets/character/run.json'),
            PIXI.Assets.load('/assets/character/run.png'),
            PIXI.Assets.load('/assets/character/jump.json'),
            PIXI.Assets.load('/assets/character/jump.png'),
            PIXI.Assets.load('/assets/character/slide.json'),
            PIXI.Assets.load('/assets/character/slide.png'),
            PIXI.Assets.load('/assets/character/dead.json'),
            PIXI.Assets.load('/assets/character/dead.png'),
            PIXI.Assets.load('/assets/textures/texture_16px 555.png'),
            PIXI.Assets.load('/assets/backgrounds/game_bg.png'),
            PIXI.Assets.load('/assets/obstacles/barrel.json'),
            PIXI.Assets.load('/assets/obstacles/barrel.png'),
            PIXI.Assets.load('/assets/items/kluski.json'),
            PIXI.Assets.load('/assets/items/kluski.png'),
        ]);

        // Ensure nearest neighbor scaling for pixel art look
        floorTex.source.scaleMode = 'nearest';
        barrelTex.source.scaleMode = 'nearest';
        kluskiTex.source.scaleMode = 'nearest';

        this.textures = {
            floor: floorTex,
            background: bgTex
        };

        this.animations = {
            idle: this.parseFrames(idleSheet, idleTex),
            run: this.parseFrames(runSheet, runTex),
            jump: this.parseFrames(jumpSheet, jumpTex),
            slide: this.parseFrames(slideSheet, slideTex),
            dead: this.parseFrames(deadSheet, deadTex),
            barrel: this.parseFrames(barrelSheet, barrelTex),
            kluska: this.parseFrames(kluskiSheet, kluskiTex),
        };
    }

    private parseFrames(jsonData: any, baseTexture: PIXI.TextureSource): PIXI.Texture[] {
        // Assuming jsonData is an array of frames as per original code logic usually implies, 
        // but PixiJS spritesheets usually come as object with frames.
        // However, the original code treated jsonData as an array: `jsonData.map(frame => ...)`
        // So I will stick to that interface.
        if (Array.isArray(jsonData)) {
            return jsonData.map((frame: any) => {
                const region = new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height);
                return new PIXI.Texture({ source: baseTexture, frame: region });
            });
        }
        // Fallback if it's standard Pixi keys, but sticking to original logic
        return [];
    }
}
