import { z } from 'zod'; // Import Zod for validation
import { supabase } from '@/lib/supabase'; // Import client

// Define the validation schema for score submission
const submitScoreSchema = z.object({
    initials: z
        .string()
        .length(3, { message: 'Initials must be exactly 3 characters long.' })
        .regex(/^[A-Z0-9]+$/, { message: 'Initials must be uppercase letters or numbers.' }),
    score: z
        .number()
        .int({ message: 'Score must be an integer.' })
        .positive({ message: 'Score must be a positive number.' }),
});

/**
 * Submits a new high score to the database.
 * NOTE: This relies on Client-Side RLS policies allowing anonymous inserts.
 * @param initials - The player's initials (3 characters, A-Z, 0-9).
 * @param score - The player's score (positive integer).
 * @returns An object containing success status and optional error message.
 */
export async function submitScore(initials: string, score: number) {
    // 1. Validate input using Zod
    const result = submitScoreSchema.safeParse({ initials, score });

    if (!result.success) {
        return {
            success: false,
            error: result.error.flatten().fieldErrors,
            message: 'Validation failed.',
        };
    }

    try {
        // 2. Insert into Supabase using Public Client
        const { error } = await supabase
            .from('highscores')
            .insert([{ initials: result.data.initials, score: result.data.score }]);

        if (error) {
            console.error('Supabase Insert Error:', error);
            return { success: false, message: 'Failed to submit score.' };
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected Error:', err);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

/**
 * Retrieves the top high scores from the database.
 * @param limit - The maximum number of scores to retrieve (default: 10).
 * @returns An array of score objects.
 */
export async function getTopScores(limit: number = 10) {
    try {
        // Read from public client
        const { data, error } = await supabase
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
