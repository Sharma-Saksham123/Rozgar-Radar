import { STATUS_LABEL, type JobMatch, type Job } from "./types";

export interface AlertJob {
  job: Job;
  match: JobMatch;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#10b981",
  likely: "#38bdf8",
  not_eligible: "#f43f5e",
  needs_review: "#f59e0b",
};

function escapeHtml(value: string): string {
  // Built from char codes so the source has no HTML entities in it.
  return value
    .replace(/&/g, String.fromCharCode(38))
    .replace(/</g, String.fromCharCode(60))
    .replace(/>/g, String.fromCharCode(62))
    .replace(/"/g, String.fromCharCode(34))
    .replace(/'/g, String.fromCharCode(39));
}

/** Renders the daily shortlist email as a self-contained HTML document. */
export function renderDailyAlertEmail(
  name: string,
  items: AlertJob[],
  appUrl: string,
): string {
  const rows = items
    .map(({ job, match }) => {
      const color = STATUS_COLORS[match.status] ?? "#94a3b8";
      const reasons = (match.reasons ?? [])
        .filter((reason) => !reason.passed)
        .slice(0, 2)
        .map((reason) => escapeHtml(reason.detail))
        .join(" ");

      return `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #1e293b;">
          <div style="font-size:15px;font-weight:600;color:#f1f5f9;">${escapeHtml(job.title)}</div>
          <div style="font-size:13px;color:#67e8f9;margin-top:2px;">${escapeHtml(job.company)} · ${escapeHtml(job.location)}</div>
          ${
            match.explanation
              ? `<div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.5;">${escapeHtml(match.explanation).replace(/\n/g, "<br/>")}</div>`
              : ""
          }
          ${
            reasons
              ? `<div style="font-size:11px;color:#64748b;margin-top:6px;">${reasons}</div>`
              : ""
          }
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #1e293b;white-space:nowrap;">
          <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;color:${color};background:${color}22;border:1px solid ${color}55;">
            ${escapeHtml(STATUS_LABEL[match.status])}
          </span>
          <div style="font-size:11px;color:#64748b;margin-top:6px;">${match.score}% match</div>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #1e293b;white-space:nowrap;text-align:right;">
          <a href="${escapeHtml(job.apply_url)}" style="display:inline-block;padding:8px 14px;border-radius:8px;background:#22d3ee;color:#020617;font-size:12px;font-weight:700;text-decoration:none;">Apply</a>
        </td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#020617;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="padding:8px 8px 20px;">
                <div style="font-size:13px;color:#22d3ee;font-weight:700;letter-spacing:.04em;">ROZGAR RADAR</div>
                <h1 style="margin:6px 0 0;font-size:22px;color:#f8fafc;">Good morning${name ? `, ${escapeHtml(name)}` : ""}</h1>
                <p style="margin:6px 0 0;font-size:14px;color:#94a3b8;line-height:1.5;">
                  ${items.length} new ${items.length === 1 ? "role match" : "role matches"} your profile today.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#0b1220;border:1px solid #1e293b;border-radius:14px;overflow:hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 8px;text-align:center;">
                <a href="${escapeHtml(appUrl)}/dashboard" style="display:inline-block;padding:11px 22px;border-radius:10px;background:#22d3ee;color:#020617;font-size:13px;font-weight:700;text-decoration:none;">Open your dashboard</a>
                <p style="margin:14px 0 0;font-size:11px;color:#475569;line-height:1.6;">
                  You are receiving this because daily job alerts are switched on for your Rozgar Radar account.<br/>
                  Job listings shown here are fictional prototype data.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
