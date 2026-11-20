// src/lib/firestore.ts
// All Firestore read/write helpers — used by React hooks and components
import {
  collection, doc,
  getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy,
  arrayUnion, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Order, Branch, Notification, OrderStatus } from '@/types';

// ── COLLECTION REFS ───────────────────────────────────────────────────────────
const col = {
  users:         () => collection(db, 'users'),
  orders:        () => collection(db, 'orders'),
  branches:      () => collection(db, 'branches'),
  notifications: () => collection(db, 'notifications'),
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function now() { return new Date().toISOString(); }

// ── ORDERS ────────────────────────────────────────────────────────────────────

export async function getOrders(filter?: (o: Order) => boolean): Promise<Order[]> {
  const snap = await getDocs(col.orders());
  let list   = snap.docs.map(d => d.data() as Order);
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return filter ? list.filter(filter) : list;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', orderId));
  return snap.exists() ? (snap.data() as Order) : null;
}

export async function createOrder(order: Order): Promise<void> {
  await setDoc(doc(db, 'orders', order.orderId), order);
}

export async function updateOrder(orderId: string, fields: Partial<Order>): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { ...fields, updatedAt: now() });
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note: string
): Promise<void> {
  const entry = { status: newStatus, time: now(), note };
  await updateDoc(doc(db, 'orders', orderId), {
    status:    newStatus,
    updatedAt: now(),
    history:   arrayUnion(entry),
  });
}

export async function genOrderId(): Promise<{ orderId: string; trackingId: string }> {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return { orderId: `DOM-${ts}${rnd}`, trackingId: `TRK-${ts}${rnd}-2026` };
}

// ── USERS ─────────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ uid, ...snap.data() } as User) : null;
}

export async function setUser(user: User): Promise<void> {
  await setDoc(doc(db, 'users', user.uid), user);
}

export async function updateUser(uid: string, fields: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), fields);
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const q    = query(col.users(), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
}

// ── BRANCHES ──────────────────────────────────────────────────────────────────

export async function getBranches(): Promise<Branch[]> {
  const snap = await getDocs(col.branches());
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Branch));
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

export async function addBranch(name: string, lat?: number, lng?: number): Promise<string> {
  const ref = await addDoc(col.branches(), { name, lat: lat ?? null, lng: lng ?? null, createdAt: now() });
  return ref.id;
}

export async function updateBranch(id: string, name: string, lat?: number, lng?: number): Promise<void> {
  await updateDoc(doc(db, 'branches', id), { name, lat: lat ?? null, lng: lng ?? null });
}

export async function deleteBranch(id: string): Promise<void> {
  await deleteDoc(doc(db, 'branches', id));
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export async function getNotifications(uid: string): Promise<Notification[]> {
  const q    = query(col.notifications(), where('uid', '==', uid));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
  list.sort((a, b) => b.time.localeCompare(a.time));
  return list.slice(0, 30);
}

export async function addNotification(
  uid:   string,
  title: string,
  body:  string,
  type:  Notification['type'] = 'info'
): Promise<void> {
  await addDoc(col.notifications(), { uid, title, body, type, read: false, time: now() });
}

export async function markAllNotifsRead(uid: string): Promise<void> {
  const q    = query(col.notifications(), where('uid', '==', uid));
  const snap = await getDocs(q);
  const unread = snap.docs.filter(d => !d.data().read);
  await Promise.all(unread.map(d => updateDoc(d.ref, { read: true })));
}

export async function getUnreadCount(uid: string): Promise<number> {
  const q    = query(col.notifications(), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.filter(d => !d.data().read).length;
}