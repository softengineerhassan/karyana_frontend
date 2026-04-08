// // export const MODULE_DEFINITIONS = [
// //   { name: "Voucher", tokens: ["voucher", "vouchers"] },
// //   { name: "Promotion", tokens: ["promotion", "promotions"] },
// //   { name: "System User", tokens: ["system user", "user", "users", "systemuser"] },
// //   { name: "Analytics", tokens: ["analytic", "analytics"] },
// //   { name: "Sale Data", tokens: ["sale data", "sales data", "sale", "sales"] },
// // ];
// import { Folder, LockKeyOpen } from "@phosphor-icons/react";
// import { TagIcon, TicketIcon } from "lucide-react";
// export function createModuleDefinitions(apiModules) {
//   return apiModules.map((m) => ({
//     name: formatModuleName(m.name),
//     tokens: [normalize(m.name), normalize(m.name) + "s"]
//   }));
// }

// function normalize(s = "") {
//   return s.toLowerCase().replace(/\s+/g, "");
// }

// function formatModuleName(s = "") {
//   return s
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// }

// const normalize = (s = "") => String(s || "").toLowerCase().replace(/\s+/g, "");

// function entriesFrom(src) {
//   if (!src) return [];
//   if (src.data) return entriesFrom(src.data);
//   if (Array.isArray(src)) return entriesFrom(src[0]);
//   if (Array.isArray(src.modules)) return src.modules.map((m) => ({ module: m.name || m.module || "", permissions: m.permissions || m.perms || [] }));
//   if (Array.isArray(src.permissions)) return src.permissions;
//   if (src.module && (Array.isArray(src.permissions) || Array.isArray(src.perms))) return [{ module: src.module, permissions: src.permissions || src.perms }];
//   return [];
// }

// function matchesToken(permissionLower, token) {
//   return permissionLower.includes(token);
// }

// function hasPrefix(permissionLower, type) {
//   if (type === "create") return permissionLower.startsWith("create");
//   if (type === "read") return permissionLower.startsWith("get") || permissionLower.startsWith("view");
//   if (type === "update") return permissionLower.startsWith("update") || permissionLower.startsWith("delete") || permissionLower.startsWith("edit");
//   return false;
// }

// export function transformPermissionsToRows(originalData, { modules = MODULE_DEFINITIONS, fallbackModuleName = "Permission" } = {}) {
//   const entries = entriesFrom(originalData);

//   const rows = modules.map((m, idx) => ({
//     id: idx,
//     module: m.name,
//     createPermissions: [],
//     readPermissions: [],
//     updatePermissions: [],
//     originalItem: { module: m.name, permissions: [] },
//   }));

//   const moduleIndexMap = Object.fromEntries(modules.map((m, i) => [m.name, i]));
//   const fallbackIndex = fallbackModuleName ? moduleIndexMap[fallbackModuleName] : undefined;

//   // Helper: return tokens for a moduleDef
//   const tokensFor = (m) => (m.tokens || []).map((t) => normalize(t));

//   entries.forEach((item) => {
//     if (!item) return;
//     if (typeof item === "string") {
//       const lower = normalize(item);
//       // find module by token
//       let idx = modules.findIndex((m) => tokensFor(m).some((t) => matchesToken(lower, t)));
//       if (idx === -1) idx = fallbackIndex;
//       if (idx === undefined) return;
//       const row = rows[idx];
//       row.originalItem.permissions.push(item);
//       if (hasPrefix(lower, "create")) row.createPermissions.push(item);
//       else if (hasPrefix(lower, "read")) row.readPermissions.push(item);
//       else if (hasPrefix(lower, "update")) row.updatePermissions.push(item);
//       return;
//     }

//     const moduleName = normalize(item.module || item.module_name || "");
//     let idx = -1;
//     if (moduleName) {
//       idx = modules.findIndex((m) => normalize(m.name) === moduleName || tokensFor(m).some((t) => t === moduleName || moduleName.includes(t)));
//     }

//     const perms = Array.isArray(item.permissions) ? item.permissions : Array.isArray(item.perms) ? item.perms : [];
//     if (idx === -1) {
//       perms.forEach((p) => {
//         if (!p) return;
//         const lower = normalize(p);
//         let mapIdx = modules.findIndex((m) => tokensFor(m).some((t) => matchesToken(lower, t)));
//         if (mapIdx === -1) mapIdx = fallbackIndex;
//         if (mapIdx === undefined) return;
//         const row = rows[mapIdx];
//         row.originalItem.permissions.push(p);
//         if (hasPrefix(lower, "create")) row.createPermissions.push(p);
//         else if (hasPrefix(lower, "read")) row.readPermissions.push(p);
//         else if (hasPrefix(lower, "update")) row.updatePermissions.push(p);
//       });
//     } else {
//       const row = rows[idx];
//       perms.forEach((p) => {
//         if (!p) return;
//         const lower = normalize(p);
//         row.originalItem.permissions.push(p);
//         if (hasPrefix(lower, "create")) row.createPermissions.push(p);
//         else if (hasPrefix(lower, "read")) row.readPermissions.push(p);
//         else if (hasPrefix(lower, "update")) row.updatePermissions.push(p);
//       });
//     }
//   });

//   return rows;
// }

// // export function transformDataForTable(originalData) {
// //   return transformPermissionsToRows(originalData);
// // }
// export function transformDataForTable(roleApiData) {
//   const dynamicModules = createModuleDefinitions(roleApiData.modules);

//   return transformPermissionsToRows(roleApiData, {
//     modules: dynamicModules,
//     fallbackModuleName: undefined,
//   });
// }
// export function transformVendorPermissionData(originalData) {
//   return transformPermissionsToRows(originalData);
// }
// export const ICON_MAP = {
//   promotions: TagIcon,
//   deals: TicketIcon,
//   categories: TagIcon,
//   brands: TagIcon,
//   products: TagIcon,
//   subcategories: TagIcon,
//   vouchers: TicketIcon,
//   permissions: LockKeyOpen,
//   modules: LockKeyOpen,
// };

// export function getModuleIcon(moduleName) {
//   return ICON_MAP[moduleName.toLowerCase()] || Folder;
// }

import { Folder, LockKeyOpen, MapPinLineIcon, SquaresFourIcon, StackIcon, TrademarkRegisteredIcon, UserFocusIcon } from "@phosphor-icons/react";
import { Box, GaugeIcon, TagIcon, TicketIcon } from "lucide-react";

// ---------------------------
// MODULE DEFINITIONS
// ---------------------------
export function createModuleDefinitions(apiModules) {
  return apiModules.map((m) => ({
    name: formatModuleName(m.name),
    rawName: m.name,
    tokens: [normalize(m.name)],
  }));
}

function normalize(s = "") {
  return s.toLowerCase().replace(/\s+/g, "");
}

function formatModuleName(s = "") {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------
// PARSE PERMISSIONS
// ---------------------------
function entriesFrom(src) {
  if (!src) return [];
  if (src.data) return entriesFrom(src.data);
  if (Array.isArray(src)) return entriesFrom(src[0]);

  if (Array.isArray(src.modules))
    return src.modules.map((m) => ({
      module: m.name || "",
      permissions: m.permissions || [],
    }));

  if (Array.isArray(src.permissions)) return src.permissions;

  if (src.module)
    return [{ module: src.module, permissions: src.permissions || [] }];

  return [];
}

function matchesToken(permissionLower, token) {
  return permissionLower.includes(token);
}

function hasPrefix(permissionLower, type) {
  if (type === "create") return permissionLower.startsWith("create");
  if (type === "read")
    return (
      permissionLower.startsWith("get") || permissionLower.startsWith("view")
    );
  if (type === "update")
    return (
      permissionLower.startsWith("update") ||
      permissionLower.startsWith("delete") ||
      permissionLower.startsWith("edit")
    );
  return false;
}

// ---------------------------
// TRANSFORM TABLE DATA
// ---------------------------
export function transformPermissionsToRows(
  originalData,
  { modules = [], fallbackModuleName } = {}
) {
  const entries = entriesFrom(originalData);

  const rows = modules.map((m, idx) => ({
    id: idx,
    module: m.name,
    rawName: m.rawName,
    createPermissions: [],
    readPermissions: [],
    updatePermissions: [],
    originalItem: { module: m.name, permissions: [] },
  }));

  const moduleIndexMap = Object.fromEntries(
    modules.map((m, i) => [normalize(m.rawName), i])
  );
  const fallbackIndex = fallbackModuleName
    ? moduleIndexMap[fallbackModuleName]
    : undefined;

  const tokensFor = (m) => (m.tokens || []).map((t) => normalize(t));

  entries.forEach((item) => {
    if (!item) return;

    if (typeof item === "string") {
      const lower = normalize(item);

      let idx = modules.findIndex((m) =>
        tokensFor(m).some((t) => matchesToken(lower, t))
      );

      if (idx === -1) idx = fallbackIndex;
      if (idx === undefined) return;

      const row = rows[idx];
      row.originalItem.permissions.push(item);

      if (hasPrefix(lower, "create")) row.createPermissions.push(item);
      else if (hasPrefix(lower, "read")) row.readPermissions.push(item);
      else if (hasPrefix(lower, "update")) row.updatePermissions.push(item);

      return;
    }

    // ENTRY IS OBJECT
    const moduleName = normalize(item.module);
    let idx = moduleIndexMap[moduleName] ?? -1;

    const perms = item.permissions || [];

    if (idx === -1) return;

    const row = rows[idx];

    perms.forEach((p) => {
      const lower = normalize(p);

      row.originalItem.permissions.push(p);
      if (hasPrefix(lower, "create")) row.createPermissions.push(p);
      else if (hasPrefix(lower, "read")) row.readPermissions.push(p);
      else if (hasPrefix(lower, "update")) row.updatePermissions.push(p);
    });
  });

  return rows;
}

// ---------------------------
// FINAL TABLE CONVERSION
// ---------------------------
export function transformDataForTable(roleApiData) {
  const dynamicModules = createModuleDefinitions(roleApiData?.modules || []);

  return transformPermissionsToRows(roleApiData, {
    modules: dynamicModules,
    fallbackModuleName: undefined,
  });
}

export function transformVendorPermissionData(originalData) {
  return transformPermissionsToRows(originalData);
}

// ---------------------------
// ICON MAP
// ---------------------------
export const ICON_MAP = {
  promotions: TagIcon,
  deals: TicketIcon,
  categories:  SquaresFourIcon,
  brands: TrademarkRegisteredIcon,
  products: Box,
  subcategories: StackIcon,
  vouchers: TicketIcon,
  permissions: LockKeyOpen,
  modules: LockKeyOpen,
  users: UserFocusIcon,
  dashboard:GaugeIcon,
  zones:MapPinLineIcon,
};

export function getModuleIcon(moduleName) {
  return ICON_MAP[moduleName.toLowerCase()] || Folder;
}
