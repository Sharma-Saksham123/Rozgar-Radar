import { Resend } from "resend";
import { serverEnv } from "./env";
import { renderDailyAlertEmail, type AlertJob } from "./templates";

export interface SendResult {
  sent: boolean;
  id?: string;
  error?: string;
}

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = serverEnv.resendApiKey();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export function isEmailConfigured(): boolean {
  return Boolean(serverEnv.resendApiKey());
}

/**
 * Sends the daily shortlist email. Never throws — a failed email must not
 * break the cron run, so failures are returned as a result object.
 */
export async function sendDailyAlert(
  to: string,
  name: string | null,
  items: AlertJob[],
  appUrl: string,
): Promise<SendResult> {
  const resend = getClient();

  if (!resend) {
    return {
      sent: false,
      error: "RESEND_API_KEY is not configured",
    };
  }

  if (!to) {
    return { sent: false, error: "No recipient email" };
  }

  if (items.length === 0) {
    return { sent: false, error: "No matching jobs to send" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: serverEnv.emailFrom(),
      to,
      subject: `${items.length} new job ${items.length === 1 ? "match" : "matches"} for you`,
      html: renderDailyAlertEmail(name ?? "", items, appUrl),
    });

    if (error) {
      return { sent: false, error: error.message };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}
