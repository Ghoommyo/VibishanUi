# Vibishan

A place to be heard and to work things out together. Vibishan runs on Android, iOS and web, built with Expo (SDK 57) and Expo Router.

- **Listeners:** request a one-on-one session with one or more listeners. A listener accepts, you chat, and at the end each of you leaves a closing note.
- **Moderators:** start a group chat with other users and a neutral moderator. Every participant accepts first, then the moderator. The moderator can mute members and gives a verdict that closes the chat for everyone.
- **After a chat:** star messages as you go, rate your listener or moderator, and open a summary of the starred messages, everyone's comments, and the listener's observation or moderator's verdict.
- **Listener and moderator dashboard:** completed sessions, average rating, charts, and user feedback.

The backend is currently a **dummy API** that runs inside the app (`src/api/`) and stores its data on the device. It is built so a real server can replace it later.

## Run it

```bash
npm install
npm start          # then press w for web, i for iOS, a for Android
```

Everything runs in Expo Go; no development build is needed.

## Demo accounts

All demo accounts use the password `password123`. The login screen has buttons that fill them in.

| Role | Accounts |
|------|----------|
| User | alice, bob, carol |
| Listener | lisa, leo |
| Moderator | maya, max |

The app talks to the Vibishan API server ([spec](docs/backend-api-spec.md)), at `http://127.0.0.1:8000` by default. Set `EXPO_PUBLIC_API_URL` to change it (see `.env.example`), or set `EXPO_PUBLIC_USE_MOCK=1` to use the in-app mock backend instead. To try a flow between two people, log out and log back in as the other account. **Settings → Reset demo data** restores the sample data.

## Checks

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor
```

The build plan is in [`plans/`](plans/00-overview.md).
