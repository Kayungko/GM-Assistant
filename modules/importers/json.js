(function () {
  const root = window.__gmHelperModules = window.__gmHelperModules || {};
  const BUNDLE_SCHEMA = "gm-helper-catalog-bundle-v1";
  const PACK_SCHEMA = "gm-helper-catalog-pack-v1";

  root.parseCatalogJsonToGroups = function parseCatalogJsonToGroups(text, fileName) {
    let payload;
    try {
      payload = JSON.parse(String(text || ""));
    } catch (error) {
      throw new Error("JSON 解析失败，请检查格式");
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("JSON 顶层必须是对象");
    }

    if (payload.schemaVersion === BUNDLE_SCHEMA) {
      return parseBundle(payload, fileName);
    }
    if (payload.schema === PACK_SCHEMA || payload.schemaVersion === PACK_SCHEMA) {
      return parseSinglePack(payload, fileName);
    }

    throw new Error("JSON schema 不支持，请使用 catalog bundle 或 pack schema");
  };

  function parseBundle(payload, fileName) {
    if (!payload.groups || typeof payload.groups !== "object") {
      throw new Error("catalog bundle 缺少 groups 字段");
    }

    const groups = { items: [], mail: [], tasks: [], common: [] };
    Object.keys(groups).forEach((key) => {
      const value = payload.groups[key];
      if (!value) {
        return;
      }
      if (!Array.isArray(value)) {
        throw new Error(`groups.${key} 必须是数组`);
      }
      groups[key] = value;
    });

    const total = Object.values(groups).reduce((sum, list) => sum + list.length, 0);
    if (!total) {
      throw new Error("catalog bundle 中没有可用 entries");
    }

    return {
      sourceMeta: {
        type: "json",
        fileName: String(fileName || "catalog.json"),
        sourceName: String(payload.sourceName || fileName || "JSON Catalog"),
        schemaVersion: BUNDLE_SCHEMA
      },
      groups,
      importedAt: new Date().toISOString(),
      stats: {
        groupCount: Object.keys(groups).filter((k) => groups[k].length).length,
        entryCount: total
      }
    };
  }

  function parseSinglePack(payload, fileName) {
    const group = String(payload.meta?.group || payload.group || "").trim();
    if (!group || !["items", "mail", "tasks", "common"].includes(group)) {
      throw new Error("catalog pack 缺少合法 group(items/mail/tasks/common)");
    }
    if (!Array.isArray(payload.entries) || !payload.entries.length) {
      throw new Error("catalog pack.entries 必须是非空数组");
    }

    const groups = { items: [], mail: [], tasks: [], common: [] };
    groups[group] = payload.entries;

    return {
      sourceMeta: {
        type: "json",
        fileName: String(fileName || "catalog-pack.json"),
        sourceName: String(payload.meta?.id || payload.meta?.source || fileName || "JSON Pack"),
        schemaVersion: PACK_SCHEMA
      },
      groups,
      importedAt: new Date().toISOString(),
      stats: {
        groupCount: 1,
        entryCount: payload.entries.length
      }
    };
  }
})();
