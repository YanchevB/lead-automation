export async function notifyDiscord(lead) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return; // allow running without webhook configured

  const content =
    `📩 **New Lead**\n` +
    `**Name:** ${lead.name}\n` +
    `**Email:** ${lead.email}\n` +
    `**Message:** ${lead.message}\n` +
    `**Time:** ${lead.createdAt}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Discord notify failed: ${resp.status} ${text}`);
  }
}
