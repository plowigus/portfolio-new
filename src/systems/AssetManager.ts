import * as PIXI from 'pixi.js';
import { getAnimationFrames } from '../config/characterAnimations';

export class AssetManager {
    public animations: Record<string, PIXI.Texture[]> = {};
    public textures: Record<string, PIXI.Texture> = {};


    public async loadAssets() {


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
            kluskiSheet, kluskiTex,
            kickTex,
            punchTex,
            faceTex,
            klopsztangaTex,
            oponyTex,
            metaTex,
            klasykSheet, klasikTex,
            fireSheet, fireTex,
            trashballSheet, trashballTex,
            pigeonSheet, pigeonTex,
            pigeonPoopSheet, pigeonPoopTex,
            wozekTex,
            wheelTex,
            bumTex,
            kafelokTex,
            szolaTex,

            obiodSheet, obiodTex,
            serceTattooTex,
            momoSheet, momoTex
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
            loadSafe('/assets/obstacles/klopsztanga.png'),
            loadSafe('/assets/obstacles/opony.png'),
            loadSafe('/assets/obstacles/meta.png'),
            loadSafe('/assets/obstacles/klasyk.json'),
            loadSafe('/assets/obstacles/klasyk.png'),
            loadSafe('/assets/items/fire.json'),
            loadSafe('/assets/items/fire.png'),
            loadSafe('/assets/items/trashball.json'),
            loadSafe('/assets/items/trashball.png'),
            loadSafe('/assets/items/piegeon.json'), // Note: piegeon filename
            loadSafe('/assets/items/piegeon.png'),
            loadSafe('/assets/items/pigeon_poop.json'),
            loadSafe('/assets/items/pigeon_poop.png'),
            loadSafe('/assets/items/wozek.png'),
            loadSafe('/assets/items/wheel.png'),
            loadSafe('/assets/obstacles/bum.png'),
            loadSafe('/assets/obstacles/kaflok.png'), // Note: kaflok.png
            loadSafe('/assets/items/szola.png'),
            loadSafe('/assets/items/obiod.json'),
            loadSafe('/assets/items/obiod.png'),
            loadSafe('/assets/items/serce_tattoo.png'),
            loadSafe('/assets/items/momo.json'),
            loadSafe('/assets/items/momo.png'),
        ]);

        const setNearest = (tex: any) => { if (tex && tex.source) tex.source.scaleMode = 'nearest'; };

        setNearest(floorTex);
        setNearest(barrelTex);
        setNearest(kluskiTex);
        setNearest(klopsztangaTex);
        setNearest(oponyTex);
        setNearest(metaTex);
        setNearest(klasikTex);
        setNearest(fireTex);
        setNearest(trashballTex);
        setNearest(pigeonTex);
        setNearest(pigeonPoopTex);
        setNearest(kickTex);
        setNearest(punchTex);
        setNearest(faceTex);
        setNearest(wozekTex);
        setNearest(wheelTex);
        setNearest(bumTex);
        setNearest(kafelokTex);
        setNearest(szolaTex);
        setNearest(obiodTex);
        setNearest(serceTattooTex);
        setNearest(momoTex);
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
            meta: metaTex,
            opony: oponyTex,
            wozek: wozekTex,
            wheel: wheelTex,
            bum: bumTex,
            kafelok: kafelokTex,
            szola: szolaTex,
            serce_tattoo: serceTattooTex
        };

        this.animations = {
            idle: this.parseFrames(idleSheet, idleTex),
            run: this.parseFrames(runSheet, runTex),
            jump: this.parseFrames(jumpSheet, jumpTex),
            slide: this.parseFrames(slideSheet, slideTex),
            dead: this.parseFrames(deadSheet, deadTex),
            barrel: this.parseFrames(barrelSheet, barrelTex),
            kluska: this.parseFrames(kluskiSheet, kluskiTex),
            klasyk: this.parseFrames(klasykSheet, klasikTex),
            fire: this.parseFrames(fireSheet, fireTex),
            trashball: this.parseFrames(trashballSheet, trashballTex),
            pigeon: this.parseFrames(pigeonSheet, pigeonTex),
            pigeon_poop: this.parseFrames(pigeonPoopSheet, pigeonPoopTex),


            obiod: this.parseFrames(obiodSheet, obiodTex),

            face: [faceClosed, faceOpen],

            kickFirst: this.parseFrames(getAnimationFrames('kick', 'kick-first'), kickTex),
            kickSecond: this.parseFrames(getAnimationFrames('kick', 'kick-second'), kickTex),

            punchFirst: this.parseFrames(getAnimationFrames('punch', 'punch-first'), punchTex),
            punchSecond: this.parseFrames(getAnimationFrames('punch', 'punch-sec'), punchTex),
            punchThird: this.parseFrames(getAnimationFrames('punch', 'punch-third'), punchTex),

            momo: this.parseFrames(momoSheet, momoTex),
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