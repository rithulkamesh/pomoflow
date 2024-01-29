Things that you need to do to make this good

1. [ ] install eslint in vscode
2. [ ] Fix the many warnings it will give you
3. [ ] Make sure that whenever you change the type of timer you also change the isRunning state
4. [ ] Extract the firebase loading stuff away from the component, and just pass down the whole document it gives you. This _will_ make your life easier.
5. [ ] When setting things (eg. timer state) you can set the state yourself, firebase will overwrite it if something fails. This will make it more... uh reactive. 😁
