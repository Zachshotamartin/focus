# Focus

A smart calendar and task management application designed to enhance productivity through intelligent scheduling and focused task management.

## Overview

Focus combines powerful calendar management with intelligent task scheduling to help users optimize their time. The application integrates with Google Calendar to provide a seamless experience for managing events, tasks, and appointments.

## Features

- **Smart Auto-Scheduling**: Automatically schedules events and tasks based on your availability and preferences
- **Natural Language Input**: Add events using plain English (e.g., "Meeting with John tomorrow at 3pm")
- **Task Management**: Create, track, and complete tasks with priority settings
- **Theme Support**: Light, dark, and system theme options for comfortable usage in any environment
- **Google Calendar Integration**: Sync with your existing Google Calendar events
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- React
- TypeScript
- Redux for state management
- Google Calendar API
- CSS Modules for styling
- React Icons

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Google account for Calendar integration

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/focus.git
   cd focus
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Google API credentials:

   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id
   REACT_APP_GOOGLE_API_KEY=your-api-key
   ```

4. Start the development server:
   ```
   npm start
   ```

### Building for Production

```
npm run build
```

## Usage

1. Sign in with your Google account to allow Focus to access your calendar
2. Use the left sidebar to create new events or tasks
3. Use natural language input for quick event creation
4. Toggle between calendar and task views as needed
5. Adjust settings like theme and notifications via the settings panel

## Privacy

Focus is designed with privacy in mind. The application:

- Does not store your personal information on servers
- Processes data locally on your device
- Only accesses the Google Calendar information necessary for functionality
- Does not track usage or collect analytics

For more details, see our [Privacy Policy](src/pages/privacyPolicy/privacyPolicy.tsx).

## Future Features

- Enhanced natural language processing
- Time tracking and analytics
- Integrated pomodoro timer
- Team collaboration features

## Contact

For questions or feedback, please contact zachsm999@gmail.com

## License

This project is licensed under the MIT License - see the LICENSE file for details.
