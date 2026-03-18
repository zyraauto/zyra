"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type PermissionState = "default" | "granted" | "denied";

export function useNotifications(userId: string | null) {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      // Establecer permiso de manera asíncrona para evitar render encadenado
      if ("Notification" in window) {
        setTimeout(() => {
          setPermission(Notification.permission as PermissionState);
        }, 0);
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    })();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;

    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
    return result === "granted";
  }, []);

  const subscribe = useCallback(async () => {
    if (!userId) return;

    const granted = await requestPermission();
    if (!granted) return;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();

    const toUint8Array = (base64: string) => {
      const padding = "=".repeat((4 - (base64.length % 4)) % 4);
      const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
      const raw = atob(base64Safe);
      const output = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
      return output;
    };

    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key) return;

    const subscription = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toUint8Array(key),
    });

    await fetch("/api/notifications/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, subscription }),
    });

    setIsSubscribed(true);
  }, [userId, requestPermission]);

  const updatePreference = useCallback(async (enabled: boolean) => {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ notifications_enabled: enabled })
      .eq("id", userId);
  }, [userId]);

  return {
    permission,
    isSubscribed,
    canNotify: permission === "granted",
    subscribe,
    updatePreference,
  };
}