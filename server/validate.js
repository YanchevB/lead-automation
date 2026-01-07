export function validateLead(input) {
  const errors = [];

  const name = (input?.name ?? "").trim();
  const email = (input?.email ?? "").trim();
  const message = (input?.message ?? "").trim();

  if (name.length < 2) errors.push("Name must be at least 2 characters.");
  if (!isValidEmail(email)) errors.push("Email is invalid.");
  if (message.length < 5) errors.push("Message must be at least 5 characters.");

  return {
    ok: errors.length === 0,
    errors,
    cleaned: {
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    }
  };
}

function isValidEmail(email) {
  // simple, good-enough validation for demo
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
