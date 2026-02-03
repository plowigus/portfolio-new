export type Instrument =
    | 'KICK 1' | 'KICK 2'
    | 'SNARE 1' | 'SNARE 2'
    | 'LOW TOM' | 'MID TOM' | 'HI TOM'
    | 'RIM SHOT' | 'COWBELL' | 'HAND CLAP' | 'TAMBOURINE'
    | 'CLOSED HI-HAT' | 'OPEN HI-HAT'
    | 'CRASH' | 'RIDE';

export interface Channel {
    id: number;
    name: Instrument;
    sample: string;
    volume: number; // 0 to 1
    pan: number; // -1 to 1
    tune: number; // -12 to 12 (semitones, 0 is original)
    mute: boolean;
    solo: boolean;
}

export type Pattern = boolean[][]; // [channelIndex][stepIndex]

export const SAMPLES: Record<Instrument, string> = {
    'KICK 1': '/samples/TR-707Kick01.wav',
    'KICK 2': '/samples/TR-707Kick02.wav',
    'SNARE 1': '/samples/TR-707Snare01.wav',
    'SNARE 2': '/samples/TR-707Snare02.wav',
    'LOW TOM': '/samples/TR-707Tom_Lo.wav',
    'MID TOM': '/samples/TR-707Tom_Mid.wav',
    'HI TOM': '/samples/TR-707Tom_Hi.wav',
    'RIM SHOT': '/samples/TR-707RimShot.wav',
    'COWBELL': '/samples/TR-707Cow.wav',
    'HAND CLAP': '/samples/TR-707Clap.wav',
    'TAMBOURINE': '/samples/TR-707Tamborine.wav',
    'CLOSED HI-HAT': '/samples/TR-707Hat_C.wav',
    'OPEN HI-HAT': '/samples/TR-707Hat_O.wav',
    'CRASH': '/samples/TR-707Crash.wav',
    'RIDE': '/samples/TR-707Ride.wav',
};

// Initial state for the channels
export const INITIAL_CHANNELS: Channel[] = [
    { id: 0, name: 'CRASH', sample: SAMPLES['CRASH'], volume: 0.7, pan: 0, tune: 0, mute: false, solo: false },
    { id: 1, name: 'RIDE', sample: SAMPLES['RIDE'], volume: 0.7, pan: 0, tune: 0, mute: false, solo: false },
    { id: 2, name: 'CLOSED HI-HAT', sample: SAMPLES['CLOSED HI-HAT'], volume: 0.7, pan: -0.3, tune: 0, mute: false, solo: false },
    { id: 3, name: 'OPEN HI-HAT', sample: SAMPLES['OPEN HI-HAT'], volume: 0.7, pan: 0.3, tune: 0, mute: false, solo: false },
    { id: 4, name: 'LOW TOM', sample: SAMPLES['LOW TOM'], volume: 0.8, pan: -0.5, tune: 0, mute: false, solo: false },
    { id: 5, name: 'MID TOM', sample: SAMPLES['MID TOM'], volume: 0.8, pan: 0, tune: 0, mute: false, solo: false },
    { id: 6, name: 'HI TOM', sample: SAMPLES['HI TOM'], volume: 0.8, pan: 0.5, tune: 0, mute: false, solo: false },
    { id: 7, name: 'RIM SHOT', sample: SAMPLES['RIM SHOT'], volume: 0.6, pan: 0, tune: 0, mute: false, solo: false },
    { id: 8, name: 'COWBELL', sample: SAMPLES['COWBELL'], volume: 0.6, pan: 0, tune: 0, mute: false, solo: false },
    { id: 9, name: 'HAND CLAP', sample: SAMPLES['HAND CLAP'], volume: 0.7, pan: 0, tune: 0, mute: false, solo: false },
    { id: 10, name: 'TAMBOURINE', sample: SAMPLES['TAMBOURINE'], volume: 0.6, pan: 0, tune: 0, mute: false, solo: false },
    { id: 11, name: 'SNARE 1', sample: SAMPLES['SNARE 1'], volume: 0.9, pan: 0, tune: 0, mute: false, solo: false },
    { id: 12, name: 'SNARE 2', sample: SAMPLES['SNARE 2'], volume: 0.9, pan: 0, tune: 0, mute: false, solo: false },
    { id: 13, name: 'KICK 1', sample: SAMPLES['KICK 1'], volume: 1.0, pan: 0, tune: 0, mute: false, solo: false },
    { id: 14, name: 'KICK 2', sample: SAMPLES['KICK 2'], volume: 1.0, pan: 0, tune: 0, mute: false, solo: false },
];
