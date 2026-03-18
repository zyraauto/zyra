import { Resend } from "resend";

const FROM = "AutoService Pro <noreply@autoservicepro.com>";

// ✅ Lazy init — solo se crea cuando se llama la función, no al importar el módulo
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

type AppointmentEmailPayload = {
  to:            string;
  clientName:    string;
  serviceName:   string;
  workshopName:  string;
  scheduledAt:   string;
  appointmentId: string;
};

export async function sendAppointmentConfirmation(
  payload: AppointmentEmailPayload
): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from:    FROM,
      to:      payload.to,
      subject: `Appointment confirmed — ${payload.serviceName}`,
      html: `
        <h2>Your appointment is confirmed ✅</h2>
        <p>Hi ${payload.clientName},</p>
        <p>Your <strong>${payload.serviceName}</strong> has been scheduled at
           <strong>${payload.workshopName}</strong> on
           <strong>${new Date(payload.scheduledAt).toLocaleString()}</strong>.</p>
        <p>Appointment ID: <code>${payload.appointmentId}</code></p>
      `,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function sendAppointmentReminder(
  payload: AppointmentEmailPayload
): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from:    FROM,
      to:      payload.to,
      subject: `Reminder: ${payload.serviceName} tomorrow`,
      html: `
        <h2>Your appointment is tomorrow 🔧</h2>
        <p>Hi ${payload.clientName},</p>
        <p>Just a reminder that your <strong>${payload.serviceName}</strong> is scheduled
           at <strong>${payload.workshopName}</strong> on
           <strong>${new Date(payload.scheduledAt).toLocaleString()}</strong>.</p>
      `,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function sendAppointmentCancellation(payload: {
  to:          string;
  clientName:  string;
  serviceName: string;
}): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from:    FROM,
      to:      payload.to,
      subject: `Appointment cancelled — ${payload.serviceName}`,
      html: `
        <h2>Appointment cancelled</h2>
        <p>Hi ${payload.clientName}, your <strong>${payload.serviceName}</strong>
           appointment has been cancelled. Book again anytime.</p>
      `,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function sendWelcomeEmail(payload: {
  to:   string;
  name: string;
}): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({
      from:    FROM,
      to:      payload.to,
      subject: "Welcome to AutoService Pro 🚗",
      html: `
        <h2>Welcome, ${payload.name}!</h2>
        <p>Your account is ready. Add your car to the garage and book your first service.</p>
      `,
    });
    return !error;
  } catch {
    return false;
  }
}