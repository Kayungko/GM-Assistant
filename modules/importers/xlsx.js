(function () {
  const root = window.__gmHelperModules = window.__gmHelperModules || {};

  root.parseCatalogXlsxToGroups = function parseCatalogXlsxToGroups(arrayBuffer, fileName) {
    if (!window.XLSX) {
      throw new Error("缺少 XLSX 解析库，无法导入 xlsx");
    }

    const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
    const groups = { items: [], mail: [], tasks: [], common: [] };

    if (workbook.Sheets.Item || workbook.Sheets["Item"]) {
      groups.items = parseItemSheet(workbook.Sheets["Item"]);
    }
    if (workbook.Sheets["Email"]) {
      groups.mail = parseEmailSheet(workbook.Sheets["Email"]);
    }
    if (workbook.Sheets["ItemEmail"]) {
      const itemEmail = parseItemEmailSheet(workbook.Sheets["ItemEmail"]);
      if (itemEmail.items.length) {
        groups.items = dedupByKey([...(groups.items || []), ...itemEmail.items], "id");
      }
      if (itemEmail.rules.length) {
        groups.common = [...(groups.common || []), ...itemEmail.rules];
      }
    }
    if (workbook.Sheets["Task"] || workbook.Sheets["任务"] || workbook.Sheets["新手任务"]) {
      groups.tasks = parseTaskSheets(workbook);
    }

    const total = Object.values(groups).reduce((sum, list) => sum + list.length, 0);
    if (!total) {
      throw new Error("xlsx 中未识别到 Item/Email/任务 工作表数据");
    }

    return {
      sourceMeta: {
        type: "xlsx",
        fileName: String(fileName || "catalog.xlsx"),
        sourceName: String(fileName || "XLSX Catalog"),
        schemaVersion: "gm-helper-catalog-pack-v1"
      },
      groups,
      importedAt: new Date().toISOString(),
      stats: {
        groupCount: Object.keys(groups).filter((k) => groups[k].length).length,
        entryCount: total
      }
    };
  };

  function parseItemSheet(sheet) {
    if (!sheet) {
      return [];
    }
    const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
    const entries = [];
    for (let i = 3; i < rows.length; i += 1) {
      const row = rows[i] || [];
      const id = String(row[0] || "").trim();
      if (!id) {
        continue;
      }
      entries.push({
        id,
        name: String(row[1] || "").trim(),
        bagType: String(row[7] || "").trim(),
        itemType: String(row[8] || "").trim(),
        itemSubType: String(row[9] || "").trim(),
        quality: String(row[18] || "").trim(),
        typeName: "",
        aliases: []
      });
    }
    return entries;
  }

  function parseEmailSheet(sheet) {
    if (!sheet) {
      return [];
    }
    const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
    const entries = [];
    for (let i = 3; i < rows.length; i += 1) {
      const row = rows[i] || [];
      const id = String(row[0] || "").trim();
      if (!id) {
        continue;
      }
      entries.push({
        emailId: id,
        title: String(row[1] || "").trim(),
        displayType: String(row[9] || "").trim(),
        autoDelete: String(row[4] || "").trim(),
        aliases: []
      });
    }
    return entries;
  }

  function parseTaskSheets(workbook) {
    const taskMap = new Map();

    const projectTaskSheet = workbook.Sheets["Task"];
    if (projectTaskSheet) {
      const rows = window.XLSX.utils.sheet_to_json(projectTaskSheet, { header: 1, raw: false, defval: "" });
      for (let i = 3; i < rows.length; i += 1) {
        const row = rows[i] || [];
        const taskId = String(row[0] || "").trim();
        if (!/^\d+$/.test(taskId) || taskMap.has(taskId)) {
          continue;
        }
        taskMap.set(taskId, {
          taskId,
          name: String(row[18] || "").trim() || `task_${taskId}`,
          desc: String(row[19] || "").trim(),
          group: "task"
        });
      }
    }

    const mainSheet = workbook.Sheets["任务"];
    if (mainSheet) {
      const rows = window.XLSX.utils.sheet_to_json(mainSheet, { header: 1, raw: false, defval: "" });
      rows.forEach((row) => {
        const cols = Array.isArray(row) ? row : [];
        for (let c = 0; c < cols.length; c += 1) {
          const command = String(cols[c] || "").trim();
          if (command === "accept_task" || command === "set_task_complete") {
            const taskId = String(cols[c + 2] || "").trim();
            if (/^\d+$/.test(taskId) && !taskMap.has(taskId)) {
              taskMap.set(taskId, {
                taskId,
                name: String(cols[1] || "").trim(),
                desc: String(cols[2] || "").trim(),
                group: "main_task"
              });
            }
          }
        }
      });
    }

    const rookieSheet = workbook.Sheets["新手任务"];
    if (rookieSheet) {
      const rows = window.XLSX.utils.sheet_to_json(rookieSheet, { header: 1, raw: false, defval: "" });
      rows.forEach((row) => {
        const cols = Array.isArray(row) ? row : [];
        for (let c = 0; c < cols.length; c += 1) {
          if (String(cols[c] || "").trim() === "set_rookie_task_process") {
            const taskId = String(cols[c + 2] || "").trim();
            if (/^\d+$/.test(taskId) && !taskMap.has(taskId)) {
              taskMap.set(taskId, {
                taskId,
                name: String(cols[c + 3] || "").trim() || `rookie_task_${taskId}`,
                desc: "",
                group: "rookie_task"
              });
            }
          }
        }
      });
    }

    return [...taskMap.values()];
  }

  function parseItemEmailSheet(sheet) {
    if (!sheet) {
      return { items: [], rules: [] };
    }
    const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
    const items = [];
    const rules = [];
    for (let i = 3; i < rows.length; i += 1) {
      const row = rows[i] || [];
      const itemId = String(row[0] || "").trim();
      if (!itemId) {
        continue;
      }
      const desc = String(row[1] || "").trim();
      const emailMaxNum = String(row[2] || "").trim();
      items.push({
        id: itemId,
        name: desc || `item_${itemId}`,
        bagType: "",
        itemType: "mail_item",
        itemSubType: "",
        typeName: "邮件附件",
        aliases: ["邮件", "附件"]
      });
      rules.push({
        key: "mail_item_rules",
        itemId,
        desc,
        emailMaxNum
      });
    }
    return {
      items: dedupByKey(items, "id"),
      rules
    };
  }

  function dedupByKey(list, key) {
    const map = new Map();
    (Array.isArray(list) ? list : []).forEach((row) => {
      const value = String(row?.[key] || "").trim();
      if (!value || map.has(value)) {
        return;
      }
      map.set(value, row);
    });
    return [...map.values()];
  }
})();
