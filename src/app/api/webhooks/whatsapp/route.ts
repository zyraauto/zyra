import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

// Meta webhook verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return err("Verification failed", 403);
}

// Incoming WhatsApp messages (POST)
export async function POST(req: NextRequest) {
  // Verify signature in production
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature && process.env.NODE_ENV === "production") {
    return err("Missing signature", 401);
  }

  const body = await req.json();

  // Extract message from Meta webhook payload
  const entry    = body?.entry?.[0];
  const changes  = entry?.changes?.[0];
  const value    = changes?.value;
  const messages = value?.messages;

  if (!messages?.length) return ok({ received: true });

  const message   = messages[0];
  const from      = message.from;       // phone number
  const text      = message.text?.body?.toLowerCase().trim();
  const threadId  = message.id;

  const supabase = await createClient();

  // Find appointment linked to this WhatsApp thread or phone
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, status, client_id, wa_thread_id")
    .or(`wa_thread_id.eq.${threadId}`)
    .maybeSingle();

  // Handle basic commands
  if (text === "confirm" && appointment && appointment.status === "pending") {
    await supabase
      .from("appointments")
      .update({ status: "confirmed", wa_thread_id: threadId })
      .eq("id", appointment.id);

    return ok({ handled: "confirmed" });
  }

  if (text === "cancel" && appointment) {
    await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointment.id);

    return ok({ handled: "cancelled" });
  }

  // Log unhandled message for manual review
  console.info("[WhatsApp webhook] Unhandled message", { from, text });
  return ok({ received: true });
}