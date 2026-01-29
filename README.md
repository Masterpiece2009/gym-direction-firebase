# Gym Direction (Next.js + Firebase)

## Features
- Email/Password auth
- Weekly program builder
- Log sessions with sets (reps/weight/RPE)
- PR tracking (best set + best volume)
- Monthly calendar view
- Public profile (/u/[uid]) toggle

## Firebase setup
1. Create Firebase project
2. Authentication → Sign-in method → enable Email/Password
3. Firestore Database → create database (Production mode)
4. Firestore → Rules → paste rules from FIRESTORE_RULES.md
5. Project Settings → Your apps → Web → copy config

## Local development
Create `.env.local` (do NOT commit it):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
