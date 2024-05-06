"use client";

import PomodoroCard, { TimerType } from "@/components/dash/timer";
import "./home.css";
import Header from "@/components/home/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { FaArrowRight, FaChevronRight } from "react-icons/fa6";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/footer";
import { camelize, cn, playAudio } from "@/lib/utils";
import { usePomoSFX } from "@/hooks/usePomoSFX";
import { getTimeByType } from "@/lib/time";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { userConfigAtom, volumeAtom } from "@/lib/atoms";

export default function Home() {
  const { play } = usePomoSFX();

  const [userConfig, setUserConfig] = useAtom(userConfigAtom);
  const [volume] = useAtom(volumeAtom);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [timerType, setTimerType] = useState(TimerType.Pomodoro);
  const [timeRemaining, setTimeRemaining] = useState(
    userConfig.pomodoroTime * 60
  );
  const [, setCurrentBreakType] = useState(TimerType.Pomodoro);

  const handleTimerTypeChange = (newTimerType: TimerType) => {
    const newTime = getTimeByType(newTimerType, userConfig);
    setTimeRemaining(newTime * 60);
    setIsRunning(false);
    setTimerType(newTimerType);
  };

  const toggleTimer = () => {
    play("click");
    if (timeRemaining > 0) {
      setIsRunning((prevState) => !prevState);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(getTimeByType(timerType, userConfig) * 60);
    setCompletedSessions(0);
  };

  const updateTimer = (newTime: number, type: TimerType) => {
    setUserConfig({
      ...userConfig,
      [camelize(type) + "Time"]: newTime,
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning) {
      if (timeRemaining <= 0) {
        setIsRunning(false);
        playAudio("/sfx/timercomplete.mp3", volume / 100);

        if (timerType === TimerType.Pomodoro) {
          setCompletedSessions((prevSessions) => prevSessions + 1);
        }

        const isLongBreak =
          completedSessions > 0 && completedSessions % 4 === 0;
        const newType = isLongBreak
          ? TimerType.LongBreak
          : TimerType.ShortBreak;

        setTimerType(newType);
        setTimeRemaining(getTimeByType(newType, userConfig) * 60);
      } else {
        timer = setInterval(() => {
          setTimeRemaining((prevTime) => prevTime - 1);
        }, 1000);
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, completedSessions, timerType, volume]);

  useEffect(() => {
    const isLongBreak = completedSessions > 0 && completedSessions % 4 === 0;
    const newBreakType = isLongBreak
      ? TimerType.LongBreak
      : TimerType.ShortBreak;
    setCurrentBreakType(newBreakType);
  }, [completedSessions]);

  useEffect(() => {
    setTimeRemaining(getTimeByType(timerType, userConfig) * 60);
    setCompletedSessions(0);
  }, [userConfig]);

  return (
    <section
      id="home-section"
      className="w-full min-h-screen flex items-center flex-col group">
      <Header />

      <div className="mt-[8vh] flex flex-col items-center text-center max-w-15">
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
        <div className="mt-6 rounded md:border md:border-[0.5px] md:border-white overflow-hidden max-w-[100vw] w-full">
          <PomodoroCard
            timerType={timerType}
            timeRemaining={timeRemaining}
            completedSessions={completedSessions}
            pomodoroTime={userConfig.pomodoroTime}
            longBreakTime={userConfig.longBreakTime}
            shortBreakTime={userConfig.shortBreakTime}
            resetTimer={resetTimer}
            updateTimer={updateTimer}
            toggleTimer={toggleTimer}
            handleTimerTypeChange={handleTimerTypeChange}
            playAudio={play}
            isRunning={isRunning}
          />
        </div>
      </div>
      <div className="mt-5">
        <Link href={"/dash"}>
          <div className="relative">
            <button
              className={cn(
                "px-6 py-2 text-sm rounded-lg h-10 group bg-pomo z-10",
                "text-black border-2 border-pomo transition",
                "flex items-center gap-2 justify-center",
                "hover:brightness-90",
                "hover:translate-x-1 hover:-translate-y-1 relative active:translate-y-0 active:translate-x-0"
              )}>
              <span className="text-sm">Get Started</span>

              <FaChevronRight
                size={16}
                className="group-hover:translate-x-2 transition-transform"
              />
            </button>
          </div>
        </Link>
      </div>
      <div className="flex mt-[5vh] flex-col items-center font-light w-[60vh]">
        <div className="text-xl md:mx-0 mx-3 text-regular">FAQ</div>
        <div className="w-full">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                What is the Pomodoro&trade; Technique?
              </AccordionTrigger>
              <AccordionContent>
                The Pomodoro Technique is a time management method that involves
                working in focused intervals of 25 minutes, called
                &ldquo;pomodoros,&rdquo; followed by short breaks, to increase
                productivity and avoid burnout.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Why do I have to sign up?</AccordionTrigger>
              <AccordionContent>
                Synchronized timer sessions help us combat spam on our website
                while providing an organized view of participants in each
                session. This feature also enables us to track session details
                and facilitate host and guest management effectively.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Why pomoflow?</AccordionTrigger>
              <AccordionContent>
                Our minimalistic user interface is favored by many users, and
                the ability to synchronize timers with friends cultivates a
                sense of companionship and mutual monitoring, enhancing focus
                and productivity.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Footer />
    </section>
  );
}
