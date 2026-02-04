
declare module 'react-rough-notation' {
    import * as React from 'react';

    export interface RoughNotationProps {
        type?: 'underline' | 'box' | 'circle' | 'highlight' | 'strike-through' | 'crossed-off' | 'bracket';
        animate?: boolean;
        animationDelay?: number;
        animationDuration?: number;
        brackets?: string | string[];
        children?: React.ReactNode;
        color?: string;
        customElement?: string;
        getState?: (state: string) => void;
        iterations?: number;
        multiline?: boolean;
        order?: number | string;
        padding?: number | number[];
        show?: boolean;
        strokeWidth?: number;
    }

    export const RoughNotation: React.FC<RoughNotationProps>;
    export const RoughNotationGroup: React.FC<{ children: React.ReactNode; show?: boolean }>;
}
