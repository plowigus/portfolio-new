import * as PIXI from 'pixi.js';

export class AssetManager {
    public animations: Record<string, PIXI.Texture[]> = {};
    public textures: Record<string, PIXI.Texture> = {};


    public async loadAssets() {
        // Parallel loading of all assets
        // Check if a key asset is already loaded to avoid re-loading/warnings
        if (PIXI.Assets.cache.has('/assets/character/idle.json')) {
            // Already loaded, just retrieve from cache if needed, or rely on them being in cache.
            // However, we need to populate this.textures and this.animations.
            // Let's implement a safe retrieval.
        }

        const loadSafe = async (path: string) => {
            if (PIXI.Assets.cache.has(path)) {
                return PIXI.Assets.get(path);
            }
            return PIXI.Assets.load(path);
        };

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
            loadSafe('/assets/character/idle.json'),
            loadSafe('/assets/character/idle.png'),
            loadSafe('/assets/character/run.json'),
            loadSafe('/assets/character/run.png'),
            loadSafe('/assets/character/jump.json'),
            loadSafe('/assets/character/jump.png'),
            loadSafe('/assets/character/slide.json'),
            loadSafe('/assets/character/slide.png'),
            loadSafe('/assets/character/dead.json'),
            loadSafe('/assets/character/dead.png'),
            loadSafe('/assets/textures/texture_16px 555.png'),
            loadSafe('/assets/backgrounds/game_bg.png'),
            loadSafe('/assets/obstacles/barrel.json'),
            loadSafe('/assets/obstacles/barrel.png'),
            loadSafe('/assets/items/kluski.json'),
            loadSafe('/assets/items/kluski.png'),
            // faceTex loaded separately below
        ]);

        // Ensure nearest neighbor scaling for pixel art look
        floorTex.source.scaleMode = 'nearest';
        barrelTex.source.scaleMode = 'nearest';
        kluskiTex.source.scaleMode = 'nearest';

        const klopsztangaTex = await loadSafe('/assets/obstacles/klopsztanga.png');
        klopsztangaTex.source.scaleMode = 'nearest';

        const oponyTex = await loadSafe('/assets/obstacles/opony.png');
        oponyTex.source.scaleMode = 'nearest';

        // Face slicing
        const faceTex = await loadSafe('/assets/ui/face.png');
        faceTex.source.scaleMode = 'nearest';

        // Slice face (2 frames, horizontal)
        const faceW = faceTex.width / 2;
        const faceH = faceTex.height;
        const faceClosed = new PIXI.Texture({
            source: faceTex.source,
            frame: new PIXI.Rectangle(0, 0, faceW, faceH)
        });
        const faceOpen = new PIXI.Texture({
            source: faceTex.source,
            frame: new PIXI.Rectangle(faceW, 0, faceW, faceH)
        });

        this.textures = {
            floor: floorTex,
            background: bgTex,
            faceClosed,
            faceOpen,
            klopsztanga: klopsztangaTex,
            opony: oponyTex
        };

        this.animations = {
            idle: this.parseFrames(idleSheet, idleTex),
            run: this.parseFrames(runSheet, runTex),
            jump: this.parseFrames(jumpSheet, jumpTex),
            slide: this.parseFrames(slideSheet, slideTex),
            dead: this.parseFrames(deadSheet, deadTex),
            barrel: this.parseFrames(barrelSheet, barrelTex),
            kluska: this.parseFrames(kluskiSheet, kluskiTex),
            face: [faceClosed, faceOpen] // For easier access if needed
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
