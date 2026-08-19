import "server-only";

type EmailMessage = { to: string; subject: string; html: string };

export async function sendTransactionalEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") return { delivered: false };
    throw new Error("Transactional email is not configured.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [message.to], subject: message.subject, html: message.html }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Transactional email provider rejected the message.");
  return { delivered: true };
}
