export function setCookie(res, name, value, options = {}) {
  const isProd = process.env.NODE_ENV === "production";
  const defaultOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    maxAge: 24 * 60 * 60 * 1000
  };
  res.cookie(name, value, { ...defaultOptions, ...options });
}

export function clearAppCookie(res, name) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(name, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax"
  });
}