import * as PIXI from 'pixi.js';
import { getAnimationFrames } from '../config/characterAnimations';

export class AssetManager {
    public animations: Record<string, PIXI.Texture[]> = {};
    public textures: Record<string, PIXI.Texture> = {};


    public async loadAssets() {

        if (PIXI.Assets.cache.has('/assets/character/idle.json')) {
            // Cache check
        }

        const loadSafe = async (path: string) => {
            if (PIXI.Assets.cache.has(path)) {
                return PIXI.Assets.get(path);
            }
            return PIXI.Assets.load(path);
        };

        // 1. Ładujemy WSZYSTKO w jednym Promise.all (najszybsza metoda)
        const [
            idleSheet, idleTex,
            runSheet, runTex,
            jumpSheet, jumpTex,
            slideSheet, slideTex,
            deadSheet, deadTex,
            floorTex,
            bgTex,
            barrelSheet, barrelTex,
            kluskiSheet, kluskiTex,
            kickTex,
            punchTex,
            faceTex,
            // Nowe assety:
            klopsztangaTex,
            oponyTex,
            metaTex,
            wozekTex,
            wheelTex,
            obiodSheet, obiodTex // 🛠️ Tutaj ładujemy roladę normalnie
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
            loadSafe('/assets/character/kick.png'),
            loadSafe('/assets/character/punch.png'),
            loadSafe('/assets/ui/face.png'),
            // Obstacles & Items loaded in parallel:
            loadSafe('/assets/obstacles/klopsztanga.png'),
            loadSafe('/assets/obstacles/opony.png'),
            loadSafe('/assets/obstacles/meta.png'),
            loadSafe('/assets/items/wozek.png'),
            loadSafe('/assets/items/wheel.png'),
            loadSafe('/assets/items/obiod.json'), // 🛠️ JSON
            loadSafe('/assets/items/obiod.png'),  // 🛠️ PNG
        ]);

        // 2. Ustawiamy Pixel Art Mode (Nearest Neighbor)
        const setNearest = (tex: any) => { if (tex && tex.source) tex.source.scaleMode = 'nearest'; };

        setNearest(floorTex);
        setNearest(barrelTex);
        setNearest(kluskiTex);
        setNearest(klopsztangaTex);
        setNearest(oponyTex);
        setNearest(metaTex);
        setNearest(kickTex);
        setNearest(punchTex);
        setNearest(faceTex);
        setNearest(wozekTex);
        setNearest(wheelTex);
        setNearest(obiodTex); // 🛠️ Pixel art dla rolady

        // 3. Krojenie twarzy (UI)
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

        // 4. Przypisanie tekstur statycznych
        this.textures = {
            floor: floorTex,
            background: bgTex,
            faceClosed,
            faceOpen,
            klopsztanga: klopsztangaTex,
            meta: metaTex,
            opony: oponyTex,
            wozek: wozekTex,
            wheel: wheelTex
        };

        // 5. Parsowanie animacji (wszystko tą samą metodą)
        this.animations = {
            idle: this.parseFrames(idleSheet, idleTex),
            run: this.parseFrames(runSheet, runTex),
            jump: this.parseFrames(jumpSheet, jumpTex),
            slide: this.parseFrames(slideSheet, slideTex),
            dead: this.parseFrames(deadSheet, deadTex),
            barrel: this.parseFrames(barrelSheet, barrelTex),
            kluska: this.parseFrames(kluskiSheet, kluskiTex),

            // 🛠️ Rolada ładowana tak samo jak reszta:
            obiod: this.parseFrames(obiodSheet, obiodTex),

            face: [faceClosed, faceOpen],

            // Combo Animations
            kickFirst: this.parseFrames(getAnimationFrames('kick', 'kick-first'), kickTex),
            kickSecond: this.parseFrames(getAnimationFrames('kick', 'kick-second'), kickTex),

            punchFirst: this.parseFrames(getAnimationFrames('punch', 'punch-first'), punchTex),
            punchSecond: this.parseFrames(getAnimationFrames('punch', 'punch-sec'), punchTex),
            punchThird: this.parseFrames(getAnimationFrames('punch', 'punch-third'), punchTex),
        };
    }

    private parseFrames(jsonData: any, baseTexture: PIXI.TextureSource): PIXI.Texture[] {
        if (Array.isArray(jsonData)) {
            return jsonData.map((frame: any) => {
                const region = new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height);
                return new PIXI.Texture({ source: baseTexture, frame: region });
            });
        }
        return [];
    }
}