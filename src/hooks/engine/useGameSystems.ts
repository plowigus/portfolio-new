import { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config/gameConfig';
import { PhysicsSystem } from '../../systems/Physics';
import { RendererSystem } from '../../systems/Renderer';
import { SpawnerSystem } from '../../systems/Spawner';
import { AssetManager } from '../../systems/AssetManager';

export const useGameSystems = (containerRef: React.RefObject<HTMLDivElement | null>, restartKey: number) => {
    const physicsRef = useRef<PhysicsSystem | null>(null);
    const rendererRef = useRef<RendererSystem | null>(null);
    const spawnerRef = useRef<SpawnerSystem | null>(null);
    const assetManagerRef = useRef<AssetManager | null>(null);
    const backgroundRef = useRef<PIXI.TilingSprite | null>(null);
    const characterRef = useRef<PIXI.AnimatedSprite | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        setIsReady(false);

        const init = async () => {
            // 1. Init Systems
            const physics = new PhysicsSystem();
            physics.engine.timing.timeScale = 1;
            const renderer = new RendererSystem();
            const assetManager = new AssetManager();

            await renderer.init(containerRef.current!);
            await assetManager.loadAssets();

            // Enable sorting for Z-Index management
            renderer.app.stage.sortableChildren = true;

            const spawner = new SpawnerSystem(
                physics.engine,
                renderer.app,
                assetManager.textures.floor,
                assetManager.animations
            );
            spawner.initPlatforms();

            physicsRef.current = physics;
            rendererRef.current = renderer;
            spawnerRef.current = spawner;
            assetManagerRef.current = assetManager;

            // 2. Setup Background (Parallax)
            const bgTexture = assetManager.textures.background;
            const background = new PIXI.TilingSprite({
                texture: bgTexture,
                width: GAME_CONFIG.width,
                height: GAME_CONFIG.height
            });

            // Scaled and Positioned from Config
            const bgScale = (GAME_CONFIG.height / bgTexture.height) * GAME_CONFIG.bgScaleMultiplier;
            background.tileScale.set(bgScale);
            background.tilePosition.y = GAME_CONFIG.bgOffsetY;
            background.zIndex = 1;

            renderer.app.stage.addChild(background);
            backgroundRef.current = background;

            // 3. Setup Player
            physics.createPlayer();
            const character = new PIXI.AnimatedSprite(assetManager.animations.idle);
            character.scale.set(GAME_CONFIG.characterScale);
            character.animationSpeed = GAME_CONFIG.animationSpeed;
            character.anchor.set(0.5);
            character.zIndex = 4;
            character.play();
            renderer.app.stage.addChild(character);
            characterRef.current = character;

            setIsReady(true);
        };

        const cleanup = () => {
            if (physicsRef.current) physicsRef.current.cleanup();
            if (rendererRef.current) rendererRef.current.cleanup();
            if (spawnerRef.current) spawnerRef.current.cleanup();
        };

        init();
        return cleanup;
    }, [containerRef, restartKey]);

    return {
        physicsRef,
        rendererRef,
        spawnerRef,
        assetManagerRef,
        backgroundRef,
        characterRef,
        isReady
    };
};
