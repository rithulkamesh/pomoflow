- [x] Fix SFX by writing a usePomoSFX hook
- [x] Add share link button
- [x] Implement leaving session
- [ ] Implement cron job type of thing for checking if session is dead
  - [x] When someone pings, if it's been more than 30 seconds since you last checked the "health" of the session, run checkSessionHealth
  - [ ] Literaly cron job, every 1 hour get all of the sessions not marked as deleted, and check their health
- [x] implement check healthcheckSessionHealth
  1. Checks all the guests of the session
  2. If it's been more than 10 seconds since the last ping of any of the users, it deletes them
  3. If there are no users left, it deletes the session

## Bugs

- [ ] Guest collection is not deleted when uhhhh session is checked
