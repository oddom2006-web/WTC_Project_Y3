// src/lib/firestore.ts
// Same exported function names/signatures as the Firebase version — every
// hook in src/hooks/index.ts and every page keeps working unchanged.
// Internally these now call the Laravel API instead of Firestore.
import { api } from './api';
import type { User, Order, Branch, Notification, OrderStatus } from '@/types';

// ── ORDERS ────────────────────────────────────────────────────────────────────

export async function getOrders(filter?: (o: Order) => boolean): Promise<Order[]> {
  const { orders } = await api<{ orders: Order[] }>('/orders');
  return filter ? orders.filter(filter) : orders;
}

// New — supported because OrderController::index accepts ?assignedDriver=.
// Used by driver/page.tsx instead of its old direct Firestore query() call.
export async function getOrdersByDriver(driverUid: string): Promise<Order[]> {
  const { orders } = await api<{ orders: Order[] }>(`/orders?assignedDriver=${encodeURIComponent(driverUid)}`);
  return orders;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const { order } = await api<{ order: Order }>(`/orders/${encodeURIComponent(orderId)}`);
    return order;
  } catch {
    return null;
  }
}

// NOTE: order/tracking IDs are now generated server-side (OrderController::store)
// to avoid two clients generating the same ID at once, so `order` here should
// omit orderId/trackingId/status/history/createdAt/updatedAt — the API fills them in.
export async function createOrder(order: Partial<Order>): Promise<Order> {
  const { order: created } = await api<{ order: Order }>('/orders', { method: 'POST', body: order });
  return created;
}

export async function updateOrder(orderId: string, fields: Partial<Order>): Promise<void> {
  await api(`/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: fields });
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note: string
): Promise<void> {
  await api(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'POST',
    body: { status: newStatus, note },
  });
}

export async function deleteOrder(orderId: string): Promise<void> {
  await api(`/orders/${encodeURIComponent(orderId)}`, { method: 'DELETE' });
}

// Kept for compatibility — no longer needed by callers (the API assigns IDs
// on create), but harmless to keep around if anything still imports it.
export async function genOrderId(): Promise<{ orderId: string; trackingId: string }> {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return { orderId: `DOM-${ts}${rnd}`, trackingId: `TRK-${ts}${rnd}-2026` };
}

// ── USERS ─────────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<User | null> {
  try {
    const { user } = await api<{ user: User }>(`/users/${encodeURIComponent(uid)}`);
    return user;
  } catch {
    return null;
  }
}

export async function updateUser(uid: string, fields: Partial<User>): Promise<void> {
  await api(`/users/${encodeURIComponent(uid)}`, { method: 'PATCH', body: fields });
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const { users } = await api<{ users: User[] }>(`/users?role=${encodeURIComponent(role)}`);
  return users;
}

// New — replaces the old admin/page.tsx "secondary Firebase app" hack.
// The Laravel API creates the auth account + profile in one request, admin-only
// (enforced by UserPolicy::create + the 'role:admin' route middleware).
export async function createStaffAccount(fields: {
  username: string; email: string; password: string; role: 'driver' | 'employee' | 'admin';
  phone?: string; vehicle?: string; branch?: string; status?: 'active' | 'inactive';
}): Promise<User> {
  const { user } = await api<{ user: User }>('/users', { method: 'POST', body: fields });
  return user;
}

export async function deleteUser(uid: string): Promise<void> {
  await api(`/users/${encodeURIComponent(uid)}`, { method: 'DELETE' });
}

// ── BRANCHES ──────────────────────────────────────────────────────────────────

export async function getBranches(): Promise<Branch[]> {
  const { branches } = await api<{ branches: Branch[] }>('/branches');
  return branches;
}

export async function addBranch(name: string, lat?: number, lng?: number): Promise<string> {
  const { branch } = await api<{ branch: Branch }>('/branches', { method: 'POST', body: { name, lat, lng } });
  return branch.id;
}

export async function updateBranch(id: string, name: string, lat?: number, lng?: number): Promise<void> {
  await api(`/branches/${encodeURIComponent(id)}`, { method: 'PATCH', body: { name, lat, lng } });
}

export async function deleteBranch(id: string): Promise<void> {
  await api(`/branches/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export async function getNotifications(uid: string): Promise<Notification[]> {
  // uid kept in the signature for compatibility; the API always scopes to
  // the authenticated caller (mirrors the old Firestore security rule).
  const { notifications } = await api<{ notifications: Notification[] }>('/notifications');
  return notifications;
}

export async function addNotification(
  uid:   string,
  title: string,
  body:  string,
  type:  Notification['type'] = 'info'
): Promise<void> {
  await api('/notifications', { method: 'POST', body: { uid, title, body, type } });
}

export async function markAllNotifsRead(uid: string): Promise<void> {
  await api('/notifications/mark-all-read', { method: 'PATCH' });
}

export async function getUnreadCount(uid: string): Promise<number> {
  const { unread } = await api<{ unread: number }>('/notifications/unread-count');
  return unread;
}

// ── LIVE TRACKING ─────────────────────────────────────────────────────────────

export interface LiveLocation {
  lat: number;
  lng: number;
  heading: number | null;
  updatedAt: string;
}

// Called from the driver's browser (via navigator.geolocation.watchPosition)
// every few seconds while a delivery is active.
export async function updateDriverLocation(
  lat: number, lng: number, heading?: number | null, speed?: number | null
): Promise<void> {
  await api('/driver/location', { method: 'POST', body: { lat, lng, heading, speed } });
}

// Initial marker position for the tracking map, before the first WebSocket push arrives.
export async function getOrderLocation(orderId: string): Promise<LiveLocation | null> {
  const { location } = await api<{ location: LiveLocation | null }>(
    `/orders/${encodeURIComponent(orderId)}/location`
  );
  return location;
}
