import { useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';

export const useInput = () => {
    const keys = useRef<Record<string, boolean>>({});
    const jumpBufferTimer = useRef<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;

            if (e.code === "ShiftRight") {
                keys.current["Sprint"] = true;
            } else {
                keys.current[e.code] = true;
            }

            const isJumpKey = e.code === "ArrowUp" || e.code === "KeyW";
            if (isJumpKey) {
                jumpBufferTimer.current = GAME_CONFIG.jumpBuffer;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "ShiftRight") {
                keys.current["Sprint"] = false;
            } else {
                keys.current[e.code] = false;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return { keys, jumpBufferTimer };
};
