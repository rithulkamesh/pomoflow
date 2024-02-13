import { volumeAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";

export const usePomoSFX = () => {
  const [volume] = useAtom(volumeAtom);

  const audios = useRef<{
    click: HTMLAudioElement;
    complete: HTMLAudioElement;
  } | null>(null);

  useEffect(() => {
    if (!audios.current) {
      const complete = new Audio("/sfx/timercomplete.mp3");
      const click = new Audio("/sfx/click.mp3");
      [complete, click].forEach((audio) => {
        audio.load();
        audio.preload = "auto";
      });
      audios.current = { complete, click };
    }

    audios.current.complete.volume = volume / 100;
    audios.current.click.volume = volume / 100;
  }, [volume]);

  const play = (sfx: "click" | "timercomplete") => {
    const audio = new Audio(`/sfx/${sfx}.mp3`);
    audio.volume = volume / 100;
    void audio.play();
  };

  return { play };
};
