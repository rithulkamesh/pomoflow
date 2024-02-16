import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { volumeAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import {
  IoCloseOutline,
  IoCog,
  IoPauseOutline,
  IoPersonAddOutline,
  IoPlayOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { CopyButton } from "../common/copyButton";
import { StopSessionDialog } from "../sessions/StopSessionDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export enum TimerType {
  Pomodoro = "Pomodoro",
  ShortBreak = "Short Break",
  LongBreak = "Long Break",
}

interface PomodoroCardProps {
  isRunning: boolean;
  pomodoroTime: number;
  timerType: TimerType;
  longBreakTime: number;
  timeRemaining: number;
  shortBreakTime: number;
  actionsDisabled?: boolean;
  completedSessions: number;
  resetTimer: () => void;
  toggleTimer: () => void;
  handleTimerTypeChange: (timerType: TimerType) => void;
  updateTimer: (value: number, timerType: TimerType) => void;
  playAudio: (fx: "timercomplete" | "click") => void;
  handleMultiplayer?: () => void;
  stopSession?: () => Promise<void>;
  copyLink?: string;
  isHost?: boolean;
}

const PomodoroCard: React.FC<PomodoroCardProps> = ({
  actionsDisabled,
  pomodoroTime,
  shortBreakTime,
  longBreakTime,
  completedSessions,
  timerType,
  timeRemaining,
  isRunning,
  updateTimer,
  toggleTimer,
  handleTimerTypeChange,
  resetTimer,
  handleMultiplayer,
  stopSession,
  playAudio,
  copyLink,
  isHost,
}) => {
  const [playable, setPlayable] = useState(false);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [resetting, setResetting] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (resetting) {
      setTimeout(() => {
        setResetting(false);
      }, 500);
    }
  }, [resetting]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setPlayable(true);
  };

  useEffect(() => {
    if (volume !== 0) {
      const timer = setTimeout(() => {
        document.querySelectorAll("audio").forEach((audio) => audio.pause());
        if (playable) playAudio("timercomplete");
      }, 350);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);

  return (
    <Card className="py-5 px-14 flex flex-col gap-5 border-0 animate-in fade-in-0">
      <div className="flex gap-2 justify-center">
        {Object.values(TimerType).map((type) => (
          <Button
            key={type}
            variant="ghost"
            disabled={actionsDisabled}
            onClick={() => handleTimerTypeChange(type)}
            className={cn(
              timerType === type &&
                "bg-[#D6A27B] text-black hover:bg-[#D6A27B] hover:text-black"
            )}>
            {type}
          </Button>
        ))}
      </div>

      <div className="py-0.5" />

      <h1 className="text-center text-6xl font-light flex items-center justify-center">
        {formatTime(timeRemaining)}
      </h1>
      <div className="flex items-center justify-center">
        {[1, 2, 3, 4].map((dot) => (
          <div
            key={dot}
            className={`h-2 w-2 rounded-full mx-1 ${
              dot <= completedSessions
                ? "dark:bg-white bg-black"
                : "dark:bg-zinc-800 bg-gray-200"
            }`}
          />
        ))}
      </div>
      <div className="flex gap-1 justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTimer}
          disabled={actionsDisabled}
          onClickCapture={() => setPlayable(true)}>
          {isRunning ? (
            <IoPauseOutline className="animate-in fade-in-0 zoom-in-0" />
          ) : (
            <IoPlayOutline className="animate-in fade-in-0 zoom-in-0" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setResetting(true);
            resetTimer();
          }}
          disabled={actionsDisabled}>
          <IoRefreshOutline className={cn(resetting && "rot-one")} />
        </Button>
        {handleMultiplayer && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMultiplayer}
            disabled={actionsDisabled}>
            <IoPersonAddOutline />
          </Button>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" disabled={actionsDisabled}>
              <IoCog />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-6">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Adjust clock settings for optimum productivity (in minutes)
                </p>
              </div>
              <div className="grid gap-2.5">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="pomodoro">Pomodoro</Label>
                  <Input
                    id="pomodoro"
                    className="col-span-2 h-8"
                    value={pomodoroTime}
                    type="number"
                    onChange={(e) =>
                      updateTimer(
                        parseInt(e.target.value, 10),
                        TimerType.Pomodoro
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="short-break">Short Break</Label>
                  <Input
                    id="short-break"
                    className="col-span-2 h-8"
                    value={shortBreakTime}
                    type="number"
                    onChange={(e) =>
                      updateTimer(
                        parseInt(e.target.value, 10),
                        TimerType.ShortBreak
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="long-break">Long Break</Label>
                  <Input
                    id="long-break"
                    className="col-span-2 h-8"
                    value={longBreakTime}
                    type="number"
                    onChange={(e) =>
                      updateTimer(
                        parseInt(e.target.value, 10),
                        TimerType.LongBreak
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-5 items-center">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    onValueChange={(e) => {
                      setTheme(e);
                    }}
                    value={theme}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue
                        placeholder={
                          theme &&
                          theme.slice(0, 1).toUpperCase() + theme.slice(1)
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <Label htmlFor="volume">Volume</Label>
                  <Slider
                    defaultValue={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="col-span-2"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {copyLink && <CopyButton link={copyLink} />}

        {stopSession && (
          <div className="flex items-center gap-2 flex-col">
            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <StopSessionDialog stopSession={stopSession} leave={!isHost}>
              <Button variant="ghost" size="icon">
                <IoCloseOutline />
              </Button>
            </StopSessionDialog>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PomodoroCard;
