'use server';

import { z } from 'zod'; // Import Zod for validation
import { supabaseAdmin } from '@/lib/supabase'; // Import the admin client
import { revalidatePath } from 'next/cache'; // Import revalidatePath

// Define the validation schema for score submission
const submitScoreSchema = z.object({
    initials: z
        .string()
        .length(3, { message: 'Initials must be exactly 3 characters long.' })
        .regex(/^[A-Z]+$/, { message: 'Initials must be uppercase letters only.' }),
    score: z
        .number()
        .int({ message: 'Score must be an integer.' })
        .positive({ message: 'Score must be a positive number.' }),
});

/**
 * Submits a new high score to the database.
 * @param initials - The player's initials (3 uppercase letters).
 * @param score - The player's score (positive integer).
 * @returns An object containing success status and optional error message.
 */
export async function submitScore(initials: string, score: number) {
    // 1. Validate input using Zod
    const result = submitScoreSchema.safeParse({ initials, score });

    if (!result.success) {
        // Return validation errors
        return {
            success: false,
            error: result.error.flatten().fieldErrors,
            message: 'Validation failed.',
        };
    }

    try {
        // 2. Insert into Supabase
        const { error } = await supabaseAdmin
            .from('highscores')
            .insert([{ initials: result.data.initials, score: result.data.score }]);

        if (error) {
            console.error('Supabase Insert Error:', error);
            return { success: false, message: 'Failed to submit score to database.' };
        }

        // 3. Revalidate paths to update UI
        revalidatePath('/');
        revalidatePath('/game');

        return { success: true };
    } catch (err) {
        console.error('Unexpected Error:', err);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

/**
 * Retrieves the top high scores from the database.
 * @param limit - The maximum number of scores to retrieve (default: 10).
 * @returns An array of score objects or an empty array on error.
 */
export async function getTopScores(limit: number = 10) {
    try {
        const { data, error } = await supabaseAdmin
            .from('highscores')
            .select('initials, score, created_at')
            .order('score', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Supabase Select Error:', error);
            return [];
        }

        return data;
    } catch (err) {
        console.error('Unexpected Error:', err);
        return [];
    }
}
