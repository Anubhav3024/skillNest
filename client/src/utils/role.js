export const normalizeRole = (role) => {
  if (!role) return role;
  const value = String(role).trim().toLowerCase();

  if (["instructor", "educator", "teacher"].includes(value)) return "instructor";
  if (["student", "learner"].includes(value)) return "student";
  if (value === "admin") return "admin";

  return value;
};

export const normalizeUser = (user) => {
  if (!user) return user;
  const normalizedRole = normalizeRole(user.role);
  return {
    ...user,
    role: normalizedRole || user.role,
  };
};
