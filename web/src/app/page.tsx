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
import { cn } from "@/lib/utils";

export default function Home() {
  const dummy = () => {};
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
      <div className="flex mt-[5vh] flex-col items-center font-light w-[42vh]">
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
