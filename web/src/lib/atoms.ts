import { atomWithStorage } from "jotai/utils";

export interface UserConfigType {
  id: string;
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
}

export const volumeAtom = atomWithStorage("@pomotimer/volume", 33);
export const userConfigAtom = atomWithStorage("@pomotimer/userconfig", {
  id: "",
  pomodoroTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
});
