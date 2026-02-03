import DrumMachine from '@/components/tr-707/DrumMachine';

export default function TR707Page() {
    return (
        <main className="min-h-screen w-full bg-zinc-900 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-[1400px]">
                <DrumMachine />
            </div>
        </main>
    );
}
