export const PREDEFINED_USERS = [
  { id: 1, name: "John Doe", roles: ["ADMIN", "PERSONAL"], groups: ["GROUP_1", "GROUP_2"] },
  { id: 2, name: "Grabriel Monroe", roles: ["PERSONAL"], groups: ["GROUP_1", "GROUP_2"] },
  { id: 3, name: "Alex Xavier", roles: ["PERSONAL"], groups: ["GROUP_2"] },
  { id: 4, name: "Jarvis Khan", roles: ["ADMIN", "PERSONAL"], groups: ["GROUP_2"] },
  { id: 5, name: "Martines Polok", roles: ["ADMIN", "PERSONAL"], groups: ["GROUP_1"] },
  { id: 6, name: "Gabriela Wozniak", roles: ["VIEWER", "PERSONAL"], groups: ["GROUP_1"] }
];

export const PREDEFINED_GROUPS = ["GROUP_1", "GROUP_2"];

export const PREDEFINED_ROLES = ["ADMIN", "PERSONAL", "VIEWER"];

export const PREDEFINED_PERMISSIONS = ["CREATE", "VIEW", "EDIT", "DELETE"];

export const MODIFIED_ROLES = [
  { name: "Admin", code: "ADMIN", permissions: ["CREATE", "VIEW", "EDIT", "DELETE"] },
  { name: "Personal", code: "PERSONAL", permissions: [] },
  { name: "Viewer", code: "VIEWER", permissions: ["VIEW"] }
];

export const ROLE_PERMISSIONS_MAP = MODIFIED_ROLES.reduce((acc, r) => {
  acc[r.code] = new Set(r.permissions);
  return acc;
}, {} as Record<string, Set<string>>);
