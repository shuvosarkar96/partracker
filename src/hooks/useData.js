import { useState, useEffect, useCallback } from 'react'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc, getDoc
} from 'firebase/firestore'
import { db } from '../firebase'

// ── WORKPLACES ────────────────────────────────────────────────────────────────
export function useWorkplaces(uid) {
  const [workplaces, setWorkplaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setWorkplaces([]); setLoading(false); return }
    const q = query(collection(db, 'users', uid, 'workplaces'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setWorkplaces(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [uid])

  const addWorkplace = useCallback(async (data) => {
    if (!uid) return
    return await addDoc(collection(db, 'users', uid, 'workplaces'), {
      ...data, createdAt: serverTimestamp()
    })
  }, [uid])

  const updateWorkplace = useCallback(async (id, data) => {
    if (!uid) return
    await updateDoc(doc(db, 'users', uid, 'workplaces', id), data)
  }, [uid])

  const deleteWorkplace = useCallback(async (id) => {
    if (!uid) return
    await deleteDoc(doc(db, 'users', uid, 'workplaces', id))
  }, [uid])

  return { workplaces, loading, addWorkplace, updateWorkplace, deleteWorkplace }
}

// ── SESSIONS ──────────────────────────────────────────────────────────────────
export function useSessions(uid, workplaceId) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid || !workplaceId) { setSessions([]); setLoading(false); return }
    const q = query(
      collection(db, 'users', uid, 'workplaces', workplaceId, 'sessions'),
      orderBy('startTs', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [uid, workplaceId])

  const addSession = useCallback(async (data) => {
    if (!uid || !workplaceId) return
    return await addDoc(
      collection(db, 'users', uid, 'workplaces', workplaceId, 'sessions'),
      { ...data, createdAt: serverTimestamp() }
    )
  }, [uid, workplaceId])

  const updateSession = useCallback(async (id, data) => {
    if (!uid || !workplaceId) return
    await updateDoc(doc(db, 'users', uid, 'workplaces', workplaceId, 'sessions', id), data)
  }, [uid, workplaceId])

  const deleteSession = useCallback(async (id) => {
    if (!uid || !workplaceId) return
    await deleteDoc(doc(db, 'users', uid, 'workplaces', workplaceId, 'sessions', id))
  }, [uid, workplaceId])

  return { sessions, loading, addSession, updateSession, deleteSession }
}

// ── USER SETTINGS ─────────────────────────────────────────────────────────────
export function useSettings(uid) {
  const [settings, setSettings] = useState({ activeWorkplaceId: null })

  useEffect(() => {
    if (!uid) return
    const ref = doc(db, 'users', uid, 'meta', 'settings')
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setSettings(snap.data())
    })
    return unsub
  }, [uid])

  const updateSettings = useCallback(async (data) => {
    if (!uid) return
    const ref = doc(db, 'users', uid, 'meta', 'settings')
    await setDoc(ref, data, { merge: true })
  }, [uid])

  return { settings, updateSettings }
}
