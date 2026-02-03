"use client";

import React, { useState, useEffect } from 'react';
import { Channel, Pattern, INITIAL_CHANNELS } from './types';
import { useAudioEngine } from './useAudioEngine';
import { MixerChannel } from './MixerChannel';
import { SequencerRow } from './SequencerRow';
import { TransportControls } from './TransportControls';
import { cn } from './utils';

export default function DrumMachine() {
    // Initialize 16 step pattern for each channel
    const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
    const [pattern, setPattern] = useState<Pattern>(() =>
        INITIAL_CHANNELS.map(() => Array(16).fill(false))
    );
    const [tempo, setTempoState] = useState(120);

    const { isPlaying, currentStep, togglePlay, setTempo, isLoaded } = useAudioEngine(channels, pattern);

    const handleTempoChange = (newTempo: number) => {
        setTempoState(newTempo);
        setTempo(newTempo);
    };

    const handleVolumeChange = React.useCallback((id: number, volume: number) => {
        setChannels(prev => prev.map(ch =>
            ch.id === id ? { ...ch, volume } : ch
        ));
    }, []);

    const handlePanChange = React.useCallback((id: number, pan: number) => {
        setChannels(prev => prev.map(ch =>
            ch.id === id ? { ...ch, pan } : ch
        ));
    }, []);

    const handleTuneChange = React.useCallback((id: number, tune: number) => {
        setChannels(prev => prev.map(ch =>
            ch.id === id ? { ...ch, tune } : ch
        ));
    }, []);

    const handleMuteToggle = React.useCallback((id: number) => {
        setChannels(prev => prev.map(ch =>
            ch.id === id ? { ...ch, mute: !ch.mute } : ch
        ));
    }, []);

    const handleSoloToggle = React.useCallback((id: number) => {
        setChannels(prev => prev.map(ch =>
            ch.id === id ? { ...ch, solo: !ch.solo } : ch
        ));
    }, []);

    const handleStepToggle = React.useCallback((channelId: number, stepIndex: number) => {
        setPattern(prev => {
            const newPattern = [...prev];
            // Access by index directly assuming ID matches Index (0-14)
            // This avoids 'channels' dependency
            if (!newPattern[channelId]) return prev;

            const channelPattern = [...newPattern[channelId]];
            channelPattern[stepIndex] = !channelPattern[stepIndex];
            newPattern[channelId] = channelPattern;
            return newPattern;
        });
    }, []);

    const handleClear = () => {
        setPattern(channels.map(() => Array(16).fill(false)));
    };

    // Load a basic demo beat
    useEffect(() => {
        const demoPattern = channels.map(() => Array(16).fill(false));
        // Need to find by channel ID or name logic
        // For simplicity reusing strict index matching if IDs are ordered:

        // Kick
        if (demoPattern[13]) [0, 8].forEach(s => demoPattern[13][s] = true); // Kick 1
        if (demoPattern[11]) [4, 12].forEach(s => demoPattern[11][s] = true); // Snare 1
        if (demoPattern[2]) [0, 2, 4, 6, 8, 10, 12, 14].forEach(s => demoPattern[2][s] = true); // Closed Hat

        setPattern(demoPattern);
    }, []);

    return (
        <div className="flex flex-col w-full max-w-[1200px] mx-auto bg-[#c5c5c5] p-2 rounded-lg shadow-2xl border border-zinc-400 relative font-sans">

            {/* --- TOP SECTION: MIXER & BRANDING --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 bg-[#dcdcdc] p-4 rounded border-b-4 border-orange-600 shadow-md">

                {/* Branding / LCD Block */}
                <div className="flex flex-col justify-between w-64 shrink-0">
                    <div className="border-l-4 border-orange-600 pl-4 py-2">
                        <h1 className="text-3xl font-black italic text-[#333] leading-none tracking-tighter">Roland</h1>
                        <h2 className="text-2xl font-black italic text-[#555] opacity-80 mt-1">TR-<span className="text-orange-600">707</span></h2>
                        <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-500 mt-2">Rhythm Composer</div>
                    </div>

                    {/* LCD Display */}
                    <div className="bg-[#262A26] border-4 border-[#999] rounded p-2 shadow-inner font-mono relative mt-auto h-24 flex items-end justify-between px-4 pb-1">
                        <div className="absolute top-2 w-full flex justify-between px-4 text-[8px] text-[#7A8C7A] uppercase tracking-wider font-bold">
                            <span>Tempo</span>
                            <span>Measure</span>
                            <span>Play Mode</span>
                        </div>
                        <div className="text-[#111] text-4xl font-bold tracking-widest drop-shadow-[0_1px_0_rgba(255,255,255,0.1)] opacity-90">{tempo}</div>
                        <div className="text-[#111] text-xs font-bold uppercase tracking-widest bg-[#7A8C7A] px-1 rounded-sm opacity-60">Pattern Write</div>
                    </div>
                </div>

                {/* Mixer Console */}
                <div className="flex-1 overflow-x-auto">
                    <div className="flex justify-end gap-[1px] h-full bg-[#E0E0E0] p-2 border border-white/50 shadow-inner rounded-sm min-w-max">
                        {channels.map((channel) => (
                            <MixerChannel
                                key={channel.id}
                                channel={channel}
                                onVolumeChange={handleVolumeChange}
                                onPanChange={handlePanChange}
                                onTuneChange={handleTuneChange}
                                onMuteToggle={handleMuteToggle}
                                onSoloToggle={handleSoloToggle}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MIDDLE: TRANSPORT & EDIT --- */}
            <div className="bg-[#b0b0b0] p-3 flex items-center justify-between border-t border-b border-[#a0a0a0] shadow-sm mb-4">
                <div className="flex gap-4">
                    {/* Placeholder for future "Scale/Last Step" buttons */}
                    <div className="flex gap-2">
                        {[...Array(4)].map((_, i) => <div key={i} className="w-8 h-6 bg-[#444] rounded-[1px] shadow-sm border-t border-white/10" />)}
                    </div>
                </div>

                <div className="flex-1 flex justify-center">
                    {/* Transport */}
                    <TransportControls
                        isPlaying={isPlaying}
                        tempo={tempo}
                        onPlayToggle={() => togglePlay(tempo)}
                        onTempoChange={handleTempoChange}
                        onClear={handleClear}
                    />
                </div>
            </div>


            {/* --- BOTTOM: SEQUENCER MATRIX --- */}
            <div className="bg-[#d0d0d0] p-4 rounded shadow-inner border border-white/40">
                <div className="flex justify-between mb-2 px-24">
                    <div className="flex-1 grid grid-cols-16 text-[9px] font-bold text-zinc-600 text-center">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className={cn("border-l border-transparent", currentStep === i && "text-red-600")}>
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-[2px]">
                    {channels.map((channel, index) => (
                        <SequencerRow
                            key={channel.id}
                            label={channel.name}
                            channelId={channel.id}
                            pattern={pattern[index]}
                            activeStep={currentStep}
                            onStepToggle={handleStepToggle}
                        />
                    ))}
                </div>

                {/* Running Light Indicator (Bottom Strip) */}
                <div className="flex justify-end mt-2 pl-24">
                    <div className="flex-1 grid grid-cols-16 gap-[2px]">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="flex justify-center">
                                <div className={cn(
                                    "w-4 h-1 rounded-full transition-all duration-75",
                                    currentStep === i ? "bg-red-600 shadow-[0_0_8px_red]" : "bg-[#888]"
                                )} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
