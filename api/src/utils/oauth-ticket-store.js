const crypto = require("crypto");
const OAuthTicket = require("../models/OAuthTicket");

const DEFAULT_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MAX_ISSUE_ATTEMPTS = 5;

const createTicket = () => crypto.randomBytes(32).toString("base64url");

const normalizeTtl = (ttlMs) =>
  Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : DEFAULT_TTL_MS;

const issueOAuthTicket = async (payload, ttlMs = DEFAULT_TTL_MS) => {
  const ttl = normalizeTtl(ttlMs);
  const expiresAt = new Date(Date.now() + ttl);

  for (let attempt = 0; attempt < MAX_ISSUE_ATTEMPTS; attempt += 1) {
    const ticket = createTicket();

    try {
      await OAuthTicket.create({ ticket, payload, expiresAt });
      return ticket;
    } catch (error) {
      if (error?.code === 11000) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Unable to issue OAuth ticket");
};

const consumeOAuthTicket = async (ticket) => {
  const value = String(ticket || "").trim();
  if (!value) return null;

  const doc = await OAuthTicket.findOneAndDelete({
    ticket: value,
    expiresAt: { $gt: new Date() },
  }).lean();

  return doc?.payload || null;
};

module.exports = {
  issueOAuthTicket,
  consumeOAuthTicket,
};
