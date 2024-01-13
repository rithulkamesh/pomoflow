-----------------------------------------------------------------------------
    - Description -
-----------------------------------------------------------------------------

Project is a syncing pomodoro timer web-app with a WIP hardware desk timer.
This allows your friends to work or study collaboratively.

-----------------------------------------------------------------------------
    - Cogs -
-----------------------------------------------------------------------------

1. backend/

Serves as the backend for the entire application. Written with go for simplicity
Connects the clients using websockets to provide a syncable-pomodoro functionality.
Extends pocketbase to allow for lesser work in terms of auth, file store, and database.

2. chrome/

Serves as the frontend for the application. Written with Next.js and shadcn/ui.

3. src/

Drives the hardware device using Raw-c++ code, and no arduino interface.

4. desktop/ (Not yet created to maintain simplicity)

Desktop version of the app to help reduce browser tabs


-----------------------------------------------------------------------------
    - Requirements -
-----------------------------------------------------------------------------

1. ESP8266 (WiFi enabled)
2. Speaker Module
3. OLED Module
