Things that you need to do to make this good.

1. [x] install eslint in vscode
2. [x] Fix the many warnings it will give you
3. [ ] Make sure that whenever you change the type of timer you also change the isRunning state
4. [ ] Extract the firebase loading stuff away from the component, and just pass down the whole document it gives you. This _will_ make your life easier.
5. [ ] When setting things (eg. timer state) you can set the state yourself, firebase will overwrite it if something fails. This will make it more... uh reactive. 😁
6. [ ] Add a dialog when changing the pomodoro type (Pomodoro, short break, long break) that shows up if there's a timer running, it should ask you if you really want to cancel the current timer. It is not obvious rn.

_Note:_ You don't have to get it to work, just do the things above and iss all good. Numro 5 is optional but would be nice.
