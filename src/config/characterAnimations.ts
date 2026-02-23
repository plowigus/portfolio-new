export const KICK_JSON = [
    { "name": "kick-first-8", "x": 200, "y": 0, "width": 200, "height": 200 },
    { "name": "kick-first-9", "x": 400, "y": 0, "width": 200, "height": 200 },
    { "name": "kick-first-10", "x": 600, "y": 0, "width": 200, "height": 200 },
    { "name": "kick-first-11", "x": 800, "y": 0, "width": 200, "height": 200 },
    { "name": "kick-second-1", "x": 0, "y": 200, "width": 200, "height": 200 },
    { "name": "kick-second-2", "x": 200, "y": 200, "width": 200, "height": 200 },
    { "name": "kick-second-3", "x": 400, "y": 200, "width": 200, "height": 200 },
    { "name": "kick-second-4", "x": 600, "y": 200, "width": 200, "height": 200 },
    { "name": "kick-second-5", "x": 800, "y": 200, "width": 200, "height": 200 },
    { "name": "kick-second-6", "x": 0, "y": 400, "width": 200, "height": 200 },
    { "name": "kick-second-7", "x": 200, "y": 400, "width": 200, "height": 200 },
    { "name": "kick-second-8", "x": 400, "y": 400, "width": 200, "height": 200 },
    { "name": "kick-second-9", "x": 600, "y": 400, "width": 200, "height": 200 },
    { "name": "kick-second-10", "x": 800, "y": 400, "width": 200, "height": 200 },
    { "name": "kick-second-11", "x": 0, "y": 600, "width": 200, "height": 200 },
    { "name": "kick-first-1", "x": 200, "y": 600, "width": 200, "height": 200 },
    { "name": "kick-first-2", "x": 400, "y": 600, "width": 200, "height": 200 },
    { "name": "kick-first-3", "x": 600, "y": 600, "width": 200, "height": 200 },
    { "name": "kick-first-4", "x": 800, "y": 600, "width": 200, "height": 200 },
    { "name": "kick-first-5", "x": 0, "y": 800, "width": 200, "height": 200 },
    { "name": "kick-first-6", "x": 200, "y": 800, "width": 200, "height": 200 },
    { "name": "kick-first-7", "x": 400, "y": 800, "width": 200, "height": 200 }
];

export const PUNCH_JSON = [
    { "name": "punch-first-4", "x": 0, "y": 0, "width": 200, "height": 200 },
    { "name": "punch-first-5", "x": 200, "y": 0, "width": 200, "height": 200 },
    { "name": "punch-first-6", "x": 400, "y": 0, "width": 200, "height": 200 },
    { "name": "punch-first-7", "x": 600, "y": 0, "width": 200, "height": 200 },
    { "name": "punch-first-8", "x": 800, "y": 0, "width": 200, "height": 200 },
    { "name": "punch-second-1", "x": 0, "y": 200, "width": 200, "height": 200 },
    { "name": "punch-second-2", "x": 200, "y": 200, "width": 200, "height": 200 },
    { "name": "punch-second-3", "x": 400, "y": 200, "width": 200, "height": 200 },
    { "name": "punch-second-4", "x": 600, "y": 200, "width": 200, "height": 200 },
    { "name": "punch-third-1", "x": 800, "y": 200, "width": 200, "height": 200 },
    { "name": "punch-third-2", "x": 0, "y": 400, "width": 200, "height": 200 },
    { "name": "punch-third-3", "x": 200, "y": 400, "width": 200, "height": 200 },
    { "name": "punch-third-4", "x": 400, "y": 400, "width": 200, "height": 200 },
    { "name": "punch-third-5", "x": 600, "y": 400, "width": 200, "height": 200 },
    { "name": "punch-third-6", "x": 800, "y": 400, "width": 200, "height": 200 },
    { "name": "punch-third-7", "x": 0, "y": 600, "width": 200, "height": 200 },
    { "name": "punch-third-8", "x": 200, "y": 600, "width": 200, "height": 200 },
    { "name": "punch-third-9", "x": 400, "y": 600, "width": 200, "height": 200 },
    { "name": "punch-third-10", "x": 600, "y": 600, "width": 200, "height": 200 },
    { "name": "punch-first-1", "x": 400, "y": 800, "width": 200, "height": 200 },
    { "name": "punch-first-2", "x": 600, "y": 800, "width": 200, "height": 200 },
    { "name": "punch-first-3", "x": 800, "y": 800, "width": 200, "height": 200 }
];

export interface FrameData {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export function getAnimationFrames(type: 'kick' | 'punch', stage: string): FrameData[] {
    const data = type === 'kick' ? KICK_JSON : PUNCH_JSON;

    const frames = data.filter(frame => frame.name.includes(stage));

    return frames.sort((a, b) => {
        const getNumber = (name: string) => {
            const parts = name.split('-');
            return parseInt(parts[parts.length - 1], 10);
        };
        return getNumber(a.name) - getNumber(b.name);
    });
}