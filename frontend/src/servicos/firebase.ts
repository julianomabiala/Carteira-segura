import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function criarContaEmail(email: string, password: string, nome?: string) {
  const credencial = await createUserWithEmailAndPassword(auth, email, password);

  if (nome?.trim()) {
    await updateProfile(credencial.user, { displayName: nome.trim() });
  }

  return credencial;
}

export async function entrarEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function entrarGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export async function sairUsuario() {
  return signOut(auth);
}

export async function recuperarSenhaEmail(email: string) {
  return sendPasswordResetEmail(auth, email);
}
