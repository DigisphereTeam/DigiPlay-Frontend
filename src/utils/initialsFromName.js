// export const initialsFromName = (name = "") => {
export const initialsFromName = (name) => {
  if (!name) return "U";
  const p = name.trim().split(/\s+/);

  return p.length > 1
    ? `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase()
    : p[0]?.[0]?.toUpperCase() || "U";
};
