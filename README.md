# Pomotimer

## Description

This project is a collaborative Pomodoro timer web application designed for individuals working or studying together. It features a work-in-progress (WIP) hardware desk timer that enhances the synchronization experience. The collaborative aspect enables friends to coordinate their work or study sessions effectively.

## Cogs

### 1. backend/

The backend component serves as the backbone of the entire application. Developed in Go for its simplicity, it employs websockets to establish connections with clients, facilitating syncable Pomodoro functionality. Leveraging the pocketbase framework streamlines authentication, file storage, and database operations.

### 2. chrome/ (Frontend)

The Chrome cog acts as the frontend of the application and is crafted using Next.js along with shadcn/ui. This component provides the user interface through which individuals can interact with the collaborative Pomodoro timer.

### 3. src/ (Hardware Control)

Drives the hardware device using raw C++ code, without relying on an Arduino interface. This approach ensures direct control over the hardware components, specifically the ESP8266 (WiFi-enabled), speaker module, and OLED module.

### 4. desktop/ (Planned)

The desktop cog, although not yet created, is envisioned to be a desktop version of the application. This extension aims to enhance user experience by providing an alternative to browser tabs.

## Requirements

To fully utilize this collaborative Pomodoro timer and hardware desk timer, the following components are required:

1. **ESP8266 (WiFi Enabled):** Enables wireless connectivity for the hardware device.
2. **Speaker Module:** Incorporates sound notifications into the Pomodoro timer experience.
3. **OLED Module:** Facilitates visual feedback on the hardware device, enhancing user interaction.

By combining these components, users can engage in synchronized Pomodoro sessions while utilizing the hardware desk timer for a more immersive and effective collaborative work or study experience.
