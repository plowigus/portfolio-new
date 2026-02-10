import { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config/gameConfig';
import { PhysicsSystem } from '../../systems/Physics';
import { RendererSystem } from '../../systems/Renderer';
import { SpawnerSystem } from '../../systems/Spawner';
import { EnemyManager } from '../../systems/EnemyManager';
import { AssetManager } from '../../systems/AssetManager';

export const useGameSystems = (containerRef: React.RefObject<HTMLDivElement | null>, restartKey: number) => {
    const physicsRef = useRef<PhysicsSystem | null>(null);
    const rendererRef = useRef<RendererSystem | null>(null);
    const spawnerRef = useRef<SpawnerSystem | null>(null);
    const enemyManagerRef = useRef<EnemyManager | null>(null);
    const assetManagerRef = useRef<AssetManager | null>(null);
    const backgroundRef = useRef<PIXI.TilingSprite | null>(null);
    const characterRef = useRef<PIXI.AnimatedSprite | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        setIsReady(false);

        const init = async () => {
            const physics = new PhysicsSystem();
            physics.engine.timing.timeScale = 1;
            const renderer = new RendererSystem();
            const assetManager = new AssetManager();

            await renderer.init(containerRef.current!);
            await assetManager.loadAssets();

            renderer.app.stage.sortableChildren = true;

            const spawner = new SpawnerSystem(
                physics.engine,
                renderer.app,
                assetManager.textures,
                assetManager.animations
            );
            spawner.initPlatforms();

            const enemyManager = new EnemyManager(physics.engine, renderer.app);

            physicsRef.current = physics;
            rendererRef.current = renderer;
            spawnerRef.current = spawner;
            enemyManagerRef.current = enemyManager;
            assetManagerRef.current = assetManager;

            const bgTexture = assetManager.textures.background;
            const background = new PIXI.TilingSprite({
                texture: bgTexture,
                width: GAME_CONFIG.width,
                height: GAME_CONFIG.height
            });

            const bgScale = (GAME_CONFIG.height / bgTexture.height) * GAME_CONFIG.bgScaleMultiplier;
            background.tileScale.set(bgScale);
            background.tilePosition.y = GAME_CONFIG.bgOffsetY;
            background.zIndex = 1;

            renderer.app.stage.addChild(background);
            backgroundRef.current = background;

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
            // 1. Najpierw czyścimy Managery (zależne od silnika)
            if (enemyManagerRef.current) enemyManagerRef.current.cleanup();
            if (spawnerRef.current) spawnerRef.current.cleanup();

            // 2. Potem czyścimy systemy bazowe (Renderer niszczy Stage i Textury)
            if (rendererRef.current) rendererRef.current.cleanup();
            if (physicsRef.current) physicsRef.current.cleanup();

            // 3. Zerujemy referencje
            physicsRef.current = null;
            rendererRef.current = null;
            spawnerRef.current = null;
            enemyManagerRef.current = null;
            setIsReady(false);
        };

        init();
        return cleanup;
    }, [containerRef, restartKey]);

    return {
        physicsRef,
        rendererRef,
        spawnerRef,
        enemyManagerRef,
        assetManagerRef,
        backgroundRef,
        characterRef,
        isReady
    };
};