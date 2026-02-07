'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Walidacja
const submitScoreSchema = z.object({
    initials: z
        .string()
        .length(3, { message: 'Initials must be exactly 3 characters long.' })
        .regex(/^[A-Z0-9]+$/, { message: 'Initials must be uppercase letters or numbers.' }),
    score: z
        .number()
        .int()
        .positive(),
});

// ... (imports remain the same)

export async function submitScore(initials: string, score: number) {
    const result = submitScoreSchema.safeParse({ initials, score });

    if (!result.success) {
        return {
            success: false,
            message: 'Validation failed.',
            error: result.error.flatten().fieldErrors,
        };
    }

    try {
        // KLUCZOWE: Używamy Service Role Key (Admin) do zapisu
        // To musi działać na serwerze!
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabaseAdmin
            .from('highscores')
            .insert([{ initials: result.data.initials, score: result.data.score }])
            .select('id')
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return { success: false, message: 'Failed to submit score.' };
        }

        revalidatePath('/');
        return { success: true, newId: data.id };
    } catch (err) {
        console.error('Unexpected Error:', err);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function getTopScores(limit: number = 10) {
    try {
        // Do odczytu wystarczy klucz anonimowy
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
            .from('highscores')
            .select('id, initials, score, created_at')
            .order('score', { ascending: false })
            .order('created_at', { ascending: true }) // Tie-breaker: First come, first served
            .limit(limit);

        if (error) {
            console.error('Supabase Select Error:', error);
            return [];
        }

        return data as { id: number; initials: string; score: number; created_at: string }[];
    } catch (err) {
        console.error('Unexpected Error:', err);
        return [];
    }
}