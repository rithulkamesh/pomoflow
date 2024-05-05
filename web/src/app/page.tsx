"use client";

import PomodoroCard, { TimerType } from "@/components/dash/timer";
import "./home.css";
import Header from "@/components/home/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { useEffect, useState } from "react";

export default function Home() {
  const dummy = () => {};
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);
  return (
    <section
      id="home-section"
      className="w-full min-h-screen flex items-center flex-col group">
      <Header />

      <div className="mt-[10vh] flex flex-col items-center text-center max-w-15">
        <Link href="/blogs/pomoflow-v1">
          <Alert className="py-1 rounded-full mb-3 w-full">
            <AlertDescription className="flex h-full w-full text-center items-center justify-center gap-1 font-light">
              Why we built Pomoflow? <FaArrowRight opacity={0.9} />
            </AlertDescription>
          </Alert>
        </Link>
        <div className="text-2xl md:text-3xl md:mx-0 ">Collaborative Focus</div>
        <div className="text-xs md:text-sm text-gray-400 mx-14 md:mx-0 mb-3">
          Focus with your friends right from your browser ✨
        </div>

        {loaded && (
          <div className="mt-6 rounded md:border md:border-[0.5px] md:border-white overflow-hidden max-w-[100vw] w-full">
            <PomodoroCard
              timerType={TimerType.Pomodoro}
              timeRemaining={329}
              completedSessions={2}
              pomodoroTime={25}
              longBreakTime={15}
              shortBreakTime={5}
              resetTimer={dummy}
              updateTimer={dummy}
              toggleTimer={dummy}
              handleTimerTypeChange={dummy}
              playAudio={dummy}
              isRunning={false}
            />
          </div>
        )}
      </div>
    </section>
  );
}
