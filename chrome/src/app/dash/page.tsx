'use client';

import Timer from '@/components/dash/timer';

export default function Home() {
    return (
        <main className='flex flex-col items-center justify-center p-24'>
            <Timer pomodoroTime={5 / 60} shortBreakTime={1} longBreakTime={2} />
        </main>
    );
}
