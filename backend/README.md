# Backend API (Optional)

⚠️ **Note: This backend is OPTIONAL and currently NOT USED.**

The frontend application uses **Firebase Firestore** directly for all database operations and **Firebase Authentication** for user management.

## Why is this here?

This backend was originally created for a Supabase-based architecture but is no longer needed since the app migrated to Firebase.

## Should I use it?

**No.** The React Native frontend communicates directly with Firebase services:
- **Authentication**: `@react-native-firebase/auth`
- **Database**: `@react-native-firebase/firestore`

All CRUD operations are handled client-side through the Firebase SDK.

## Can I delete it?

Yes, you can safely delete the entire `backend/` folder if you want to clean up the project.

## If you want to keep it...

You could repurpose this Express backend for:
- Server-side analytics
- Scheduled tasks (cron jobs)
- Admin-only operations
- Third-party API integrations

But for the core app functionality, **it's not required**.
