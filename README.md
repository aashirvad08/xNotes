# AI-Enabled To-Do & Task Management Mobile Application

A simple Expo + React Native mini-project with Firebase Authentication and Firestore-backed task management.

## Features

- User registration and login with Firebase Authentication
- Persistent login session using React Native Firebase auth persistence
- Add, edit, delete, and update task status
- Filter tasks by All, Completed, and Pending
- Firestore collections for `users` and `tasks`
- Rule-based AI priority detection from the task title
- Clean mobile UI with React Navigation and `FlatList`

## Folder Structure

```text
atl/
├── App.js
├── app.json
├── babel.config.js
├── components/
│   ├── FilterTabs.js
│   ├── FloatingActionButton.js
│   └── TaskCard.js
├── screens/
│   ├── HomeScreen.js
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   └── TaskFormScreen.js
├── services/
│   ├── authService.js
│   ├── firebase.js
│   └── taskService.js
├── utils/
│   └── priority.js
├── .env.example
└── package.json
```

## Firebase Setup

1. Create a Firebase project in the Firebase Console.
2. Enable `Authentication` and turn on the `Email/Password` sign-in provider.
3. Create a Firestore database in production or test mode.
4. Create a file named `.env` in the project root.
5. Copy the values from your Firebase web app config into `.env`.

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Firestore Structure

### `users` collection

```json
{
  "id": "USER_ID",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### `tasks` collection

```json
{
  "id": "TASK_ID",
  "userId": "USER_ID",
  "title": "Submit final project report",
  "description": "Upload the report before class",
  "dueDate": "2026-04-15",
  "status": "pending",
  "priority": "High",
  "timestamp": "Firestore server timestamp"
}
```

## Install And Run

1. Install dependencies:

```bash
npm install
```

2. Start the Expo app:

```bash
npm start
```

3. Open it in Expo Go, an Android emulator, or an iOS simulator.

## AI Priority Logic

- High priority: task title contains `exam`, `deadline`, or `submit`
- Medium priority: task title contains `meeting` or `project`
- Low priority: every other task title

## Notes

- Due date is entered in `YYYY-MM-DD` format to keep the mini-project simple and Expo-friendly.
- Tasks are filtered in the app, which keeps the Firestore query simple for beginners.
- If Firebase keys are missing, the app still loads and shows a setup reminder on auth screens.
