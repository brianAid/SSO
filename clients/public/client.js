function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function isExpiringSoon(clientId) {
  const expiresAt = parseInt(getCookie(`expires_at_${clientId}`) || "0");
  return Date.now() > expiresAt - 30000;
}

async function refreshIfNeeded(clientId) {
  if (!isExpiringSoon(clientId)) return;
  try {
    const res = await fetch("/refresh-token", { method: "POST", credentials: "include" });
    if (res.ok) console.log(`[${clientId}] ✅ Token refreshed`);
  } catch (e) {
    console.error(`[${clientId}] ❌ Refresh error:`, e.message);
  }
}

function startTokenAutoRefresh(clientId) {
  setInterval(() => refreshIfNeeded(clientId), 10000);
}
