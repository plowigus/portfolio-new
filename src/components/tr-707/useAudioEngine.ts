import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Channel, Pattern } from './types';

export const useAudioEngine = (channels: Channel[], pattern: Pattern) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const channelsRef = useRef(channels);
    const patternRef = useRef(pattern);

    // Store Players and Pannners
    // Graph: Player -> Panner -> Volume -> Destination
    // Note: Tone.Player has built-in volume, but we might want a separate Volume node for cleaner structure? 
    // Actually Player -> Panner -> Destination is fine. Tone.Player volume is convenient.
    const playersRef = useRef<Record<number, Tone.Player>>({});
    const pannersRef = useRef<Record<number, Tone.Panner>>({});

    // Keep refs updated for scheduler
    useEffect(() => {
        channelsRef.current = channels;
        // Handle Real-time Parameter Updates
        const anySolo = channels.some(c => c.solo);

        channels.forEach(ch => {
            const player = playersRef.current[ch.id];
            const panner = pannersRef.current[ch.id];

            if (player && panner) {
                // Volume & Mute/Solo Logic
                let targetVolume = 0;
                if (anySolo) {
                    if (ch.solo && !ch.mute) targetVolume = ch.volume;
                    else targetVolume = 0;
                } else {
                    if (!ch.mute) targetVolume = ch.volume;
                    else targetVolume = 0;
                }
                const db = targetVolume === 0 ? -Infinity : 20 * Math.log10(targetVolume);
                player.volume.rampTo(db, 0.05);

                // Pan Logic
                panner.pan.rampTo(ch.pan, 0.05);

                // Tune Logic (Playback Rate)
                // 1.0 is normal. 2.0 is +1 octave. 0.5 is -1 octave.
                // Semitones to rate: rate = 2^(semitones/12)
                const rate = Math.pow(2, ch.tune / 12);
                player.playbackRate = rate;
            }
        });
    }, [channels]);

    useEffect(() => {
        patternRef.current = pattern;
    }, [pattern]);

    useEffect(() => {
        const loadSamples = async () => {
            const newPlayers: Record<number, Tone.Player> = {};
            const newPanners: Record<number, Tone.Panner> = {};

            await Promise.all(
                channelsRef.current.map(async (ch) => {
                    return new Promise<void>((resolve) => {
                        const panner = new Tone.Panner(ch.pan).toDestination();

                        const player = new Tone.Player({
                            url: ch.sample,
                            onload: () => resolve(),
                            volume: -Infinity, // Start silent until state sync
                            playbackRate: 1.0
                        }).connect(panner);

                        newPlayers[ch.id] = player;
                        newPanners[ch.id] = panner;
                    });
                })
            );

            playersRef.current = newPlayers;
            pannersRef.current = newPanners;
            setIsLoaded(true);
        };

        loadSamples();

        const timerId = Tone.Transport.scheduleRepeat((time) => {
            const ticks = Tone.Transport.ticks;
            const sixteenths = Math.floor(ticks / 48);
            const step = sixteenths % 16;

            Tone.Draw.schedule(() => {
                setCurrentStep(step);
            }, time);

            const currentPattern = patternRef.current;

            channelsRef.current.forEach((ch, idx) => {
                if (currentPattern[idx] && currentPattern[idx][step]) {
                    const player = playersRef.current[ch.id];
                    if (player && player.loaded) {
                        // Start logic takes care of retriggering
                        player.start(time);
                    }
                }
            });
        }, "16n");

        return () => {
            Tone.Transport.clear(timerId);
            Object.values(playersRef.current).forEach(p => p.dispose());
            Object.values(pannersRef.current).forEach(p => p.dispose());
        };
    }, []);

    const togglePlay = async (bpm: number) => {
        if (!isLoaded) return;
        await Tone.start();
        Tone.Transport.bpm.value = bpm;

        if (Tone.Transport.state === 'started') {
            Tone.Transport.stop();
            setIsPlaying(false);
            setCurrentStep(0);
        } else {
            Tone.Transport.start();
            setIsPlaying(true);
        }
    };

    const setTempo = (bpm: number) => {
        Tone.Transport.bpm.value = bpm;
    };

    return {
        isPlaying,
        currentStep,
        isLoaded,
        togglePlay,
        setTempo
    };
};
