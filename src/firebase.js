import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA9jI4vPpKadgPamEYafyll7ZBKa5OfMrU",
  authDomain: "partracker-58a3d.firebaseapp.com",
  projectId: "partracker-58a3d",
  storageBucket: "partracker-58a3d.firebasestorage.app",
  messagingSenderId: "232879025401",
  appId: "1:232879025401:web:1bf7cd83a0f2f4a557c628",
  measurementId: "G-T81D6EPX91"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()