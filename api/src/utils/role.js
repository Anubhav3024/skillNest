const normalizeRole = (role) => {
  if (!role) return role;
  const value = String(role).trim().toLowerCase();

  if (["instructor", "educator", "teacher"].includes(value)) return "instructor";
  if (["student", "learner"].includes(value)) return "student";
  if (value === "admin") return "admin";

  return value;
};

const isValidRole = (role) => ["student", "instructor"].includes(normalizeRole(role));

module.exports = { normalizeRole, isValidRole };
