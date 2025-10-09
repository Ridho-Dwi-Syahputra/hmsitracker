// middleware/rateLimiter.js
const activeRequests = new Set();

function rateLimiter(req, res, next) {
  const key = `${req.session.user?.id}-${req.originalUrl}`;
  if (activeRequests.has(key)) {
    console.warn(`[RATE LIMIT] Duplicate request blocked: ${key}`);
    return res.status(429).json({ error: "Permintaan sedang diproses, tunggu sebentar." });
  }
  activeRequests.add(key);

  res.on("finish", () => activeRequests.delete(key));
  next();
}

module.exports = rateLimiter;
