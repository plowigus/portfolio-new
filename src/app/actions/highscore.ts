'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Schemat walidacji
const submitScoreSchema = z.object({
    initials: z
        .string()
        .length(3, { message: 'Inicjały muszą mieć dokładnie 3 znaki.' })
        .regex(/^[A-Z0-9]+$/, { message: 'Tylko duże litery i cyfry.' }),
    score: z
        .number()
        .int()
        .positive(),
});

/**
 * Zapisuje wynik.
 * Używa SERVICE_ROLE_KEY, aby ominąć RLS (zapisywanie jako Admin).
 */
export async function submitScore(initials: string, score: number) {
    // 1. Walidacja danych wejściowych
    const result = submitScoreSchema.safeParse({ initials, score });

    if (!result.success) {
        return {
            success: false,
            message: 'Błąd walidacji.',
            error: result.error.flatten().fieldErrors,
        };
    }

    try {
        // 🛑 TU JEST SEKRET: Tworzymy klienta ADMINA tylko na czas tego zapytania.
        // Dzięki temu 'anon' w przeglądarce nie ma prawa zapisu, ale serwer ma.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // <-- Używamy klucza prywatnego
        );

        // 2. Insert (jako Admin)
        const { error } = await supabaseAdmin
            .from('highscores')
            .insert([{ initials: result.data.initials, score: result.data.score }]);

        if (error) {
            console.error('Supabase Insert Error:', error);
            return { success: false, message: 'Nie udało się zapisać wyniku.' };
        }

        // 3. Odświeżamy ścieżkę, żeby nowy wynik był widoczny od razu
        revalidatePath('/');

        return { success: true };
    } catch (err) {
        console.error('Unexpected Error:', err);
        return { success: false, message: 'Wystąpił nieoczekiwany błąd.' };
    }
}

/**
 * Pobiera wyniki.
 * Tutaj wystarczy zwykły klucz ANON, bo odczyt jest publiczny.
 */
export async function getTopScores(limit: number = 10) {
    try {
        // Do odczytu używamy klucza publicznego (ANON)
        const supabasePublic = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabasePublic
            .from('highscores')
            .select('id, initials, score, created_at')
            .order('score', { ascending: false })
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