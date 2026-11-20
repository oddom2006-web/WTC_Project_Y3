// src/hooks/index.ts
// All React hooks that wrap Firestore calls
'use client';
import { useState, useEffect, useCallback } from 'react';
import * as fs from '@/lib/firestore';
import type { Order, Branch, Notification, User, OrderStatus } from '@/types';

// ── ORDERS ────────────────────────────────────────────────────────────────────

export function useOrders(filter?: (o: Order) => boolean) {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fs.getOrders(filter);
      setOrders(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);
  return { orders, loading, error, reload: load };
}

export function useOrder(orderId: string) {
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fs.getOrder(orderId).then(setOrder).finally(() => setLoading(false));
  }, [orderId]);

  return { order, loading };
}

// ── BRANCHES ──────────────────────────────────────────────────────────────────

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBranches(await fs.getBranches()); }
    catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { branches, loading, reload: load };
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export function useNotifications(uid: string) {
  const [notifs,   setNotifs]  = useState<Notification[]>([]);
  const [loading,  setLoading] = useState(true);
  const [unread,   setUnread]  = useState(0);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const data = await fs.getNotifications(uid);
      setNotifs(data);
      setUnread(data.filter(n => !n.read).length);
    } catch (_) {}
    finally { setLoading(false); }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    await fs.markAllNotifsRead(uid);
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  return { notifs, loading, unread, reload: load, markAllRead };
}

// ── USERS BY ROLE ─────────────────────────────────────────────────────────────

export function useUsersByRole(role: string) {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await fs.getUsersByRole(role)); }
    catch (_) {}
    finally { setLoading(false); }
  }, [role]);

  useEffect(() => { load(); }, [load]);
  return { users, loading, reload: load };
}
