import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export type ProgramDay = {
  weekday: number; // 0 Sun ... 6 Sat
  title: string;
  exercises: { name: string; sets?: number; reps?: string }[];
};

export type ProgramDoc = { days: ProgramDay[]; updatedAt?: any };

export type SessionSet = { reps?: number; weight?: number; rpe?: number };
export type SessionExercise = { name: string; sets: SessionSet[] };
export type SessionDoc = {
  date: string; // YYYY-MM-DD
  weekday: number;
  programTitle: string;
  notes?: string;
  exercises: SessionExercise[];
  createdAt?: any;
};

export type PRItem = {
  exercise: string;
  bestSetWeight: number;
  bestSetReps: number;
  bestSetDate: string;
  bestVolume: number;
  bestVolumeDate: string;
};

export function defaultProgram(): ProgramDoc {
  return {
    days: [
      {
        weekday: 6,
        title: "Saturday — Chest & Triceps",
        exercises: [
          { name: "Flat Dumbbell Press", sets: 4, reps: "8–12" },
          { name: "High Bar Bench (Incline Barbell)", sets: 4, reps: "8–12" },
          { name: "High Cable Fly (Cable from Above)", sets: 3, reps: "12–15" },
          { name: "Pec Deck Fly", sets: 3, reps: "12–15" },
          { name: "Close-Grip Zigzag Bar (Triceps)", sets: 3, reps: "8–12" },
          { name: "Triceps Rope Pushdown", sets: 3, reps: "12–15" }
        ]
      },
      {
        weekday: 0,
        title: "Sunday — Back & Biceps",
        exercises: [
          { name: "Lat Pulldown" },
          { name: "Low Row with Triangle Handle" },
          { name: "Reverse Cable Bar Row" },
          { name: "Machine Back Extension" },
          { name: "Alternating Dumbbell Curl" },
          { name: "Dumbbell Hammer Curl" }
        ]
      },
      {
        weekday: 1,
        title: "Monday — Legs",
        exercises: [
          { name: "Squats", sets: 4, reps: "12" },
          { name: "Leg Extension Machine", sets: 4, reps: "12" },
          { name: "Leg Curl Machine", sets: 4, reps: "12" },
          { name: "Leg Press", sets: 4, reps: "12" },
          { name: "Hack Squat Calf Machine" }
        ]
      },
      {
        weekday: 2,
        title: "Tuesday — Rest Day",
        exercises: [{ name: "Active Recovery: easy jogging / stretching / short swimming" }]
      },
      {
        weekday: 3,
        title: "Wednesday — Shoulders",
        exercises: [
          { name: "Rope Underhand Pull (Shoulders)" },
          { name: "Side Lateral Raise" },
          { name: "Dumbbell Press (Shoulder Press)" },
          { name: "T-Bar Trap Rows" },
          { name: "Rear Deltoid Machine" }
        ]
      },
      {
        weekday: 4,
        title: "Thursday — Arms",
        exercises: [
          { name: "Preacher Barbell Curls" },
          { name: "Cable Hammer Curls" },
          { name: "Seated Alternating Dumbbell Curls" },
          { name: "Underhand Rope (Triceps)" },
          { name: "Close-Grip Zigzag Bar (Triceps)" },
          { name: "Cable Triceps Kickbacks" }
        ]
      }
    ]
  };
}

export function watchAuth(cb: (u: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function ensureSeed(uid: string, displayName = "Athlete") {
  const uref = doc(db, "users", uid);
  const usnap = await getDoc(uref);
  if (!usnap.exists()) {
    await setDoc(uref, { displayName, createdAt: serverTimestamp() });
  }

  const pref = doc(db, "users", uid, "program", "current");
  const psnap = await getDoc(pref);
  if (!psnap.exists()) {
    await setDoc(pref, { ...defaultProgram(), updatedAt: serverTimestamp() });
  }

  const pubRef = doc(db, "public_profiles", uid);
  const pubSnap = await getDoc(pubRef);
  if (!pubSnap.exists()) {
    await setDoc(pubRef, {
      public: false,
      displayName,
      bio: "Training with Gym Direction.",
      avatar: "/profile.jpg",
      programSummary: defaultProgram().days,
      topPRs: [],
      updatedAt: serverTimestamp()
    });
  }
}

export async function signup(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), { displayName, createdAt: serverTimestamp() });
  await ensureSeed(cred.user.uid, displayName);
  await updateDoc(doc(db, "public_profiles", cred.user.uid), { displayName, updatedAt: serverTimestamp() });
  return cred.user;
}

export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureSeed(cred.user.uid);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export async function getProgram(uid: string): Promise<ProgramDoc> {
  const snap = await getDoc(doc(db, "users", uid, "program", "current"));
  return (snap.data() as ProgramDoc) ?? defaultProgram();
}

export async function saveProgram(uid: string, program: ProgramDoc) {
  await setDoc(
    doc(db, "users", uid, "program", "current"),
    { ...program, updatedAt: serverTimestamp() },
    { merge: true }
  );
  await updateDoc(doc(db, "public_profiles", uid), { programSummary: program.days, updatedAt: serverTimestamp() });
}

export async function addSession(uid: string, session: SessionDoc) {
  const ref = collection(db, "users", uid, "sessions");
  const created = await addDoc(ref, { ...session, createdAt: serverTimestamp() });
  await recomputePRsAndSync(uid);
  return created.id;
}

export async function getRecentSessions(uid: string, n = 200) {
  const q = query(collection(db, "users", uid, "sessions"), orderBy("date", "desc"), limit(n));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function getSession(uid: string, id: string) {
  const snap = await getDoc(doc(db, "users", uid, "sessions", id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as any) : null;
}

export async function updateSession(uid: string, id: string, patch: any) {
  await updateDoc(doc(db, "users", uid, "sessions", id), patch);
  await recomputePRsAndSync(uid);
}

export async function deleteSession(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "sessions", id));
  await recomputePRsAndSync(uid);
}

export async function recomputePRsAndSync(uid: string) {
  const q = query(collection(db, "users", uid, "sessions"), orderBy("date", "desc"), limit(250));
  const snaps = await getDocs(q);
  const sessions = snaps.docs.map((d) => d.data() as SessionDoc);

  const map = new Map<string, PRItem>();

  for (const s of sessions) {
    for (const ex of s.exercises || []) {
      const name = ex.name;
      const sets = ex.sets || [];
      let volume = 0;

      for (const st of sets) {
        const w = Number(st.weight ?? 0);
        const r = Number(st.reps ?? 0);
        volume += w * r;

        const cur = map.get(name);
        if (!cur || w > cur.bestSetWeight) {
          map.set(name, {
            exercise: name,
            bestSetWeight: w,
            bestSetReps: r,
            bestSetDate: s.date,
            bestVolume: cur?.bestVolume ?? 0,
            bestVolumeDate: cur?.bestVolumeDate ?? s.date
          });
        }
      }

      const cur = map.get(name);
      if (!cur || volume > cur.bestVolume) {
        map.set(name, {
          exercise: name,
          bestSetWeight: cur?.bestSetWeight ?? 0,
          bestSetReps: cur?.bestSetReps ?? 0,
          bestSetDate: cur?.bestSetDate ?? s.date,
          bestVolume: volume,
          bestVolumeDate: s.date
        });
      }
    }
  }

  const items = Array.from(map.values()).sort((a, b) => b.bestVolume - a.bestVolume);

  await setDoc(doc(db, "users", uid, "prs", "current"), { items, updatedAt: serverTimestamp() }, { merge: true });
  await updateDoc(doc(db, "public_profiles", uid), { topPRs: items.slice(0, 12), updatedAt: serverTimestamp() });
}

export async function getPRs(uid: string): Promise<PRItem[]> {
  const snap = await getDoc(doc(db, "users", uid, "prs", "current"));
  return ((snap.data() as any)?.items ?? []) as PRItem[];
}

export async function getPublicProfile(uid: string) {
  const snap = await getDoc(doc(db, "public_profiles", uid));
  return snap.exists() ? snap.data() : null;
}

export async function setPublic(uid: string, isPublic: boolean) {
  await updateDoc(doc(db, "public_profiles", uid), { public: isPublic, updatedAt: serverTimestamp() });
}
