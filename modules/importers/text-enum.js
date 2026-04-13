(function () {
  const root = window.__gmHelperModules = window.__gmHelperModules || {};

  root.extractTextEnums = function extractTextEnums(text) {
    const lines = String(text || "").split(/\r?\n/);
    const enums = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }
      const parts = trimmed.split(/\t+/);
      const command = String(parts[0] || "").trim();
      if (!command) {
        return;
      }

      const body = parts.slice(1).join(" ");
      const boolMatch = body.match(/\(0\/1\)/);
      if (boolMatch) {
        enums.push({ command, key: "bool_01", values: ["0", "1"] });
      }

      const pipeMatches = [...body.matchAll(/\(([^()]*\|[^()]*)\)/g)];
      pipeMatches.forEach((match) => {
        const token = String(match[1] || "").trim();
        if (!token) {
          return;
        }
        const values = token.split("|").map((x) => x.trim()).filter(Boolean);
        if (values.length >= 2 && values.length <= 10) {
          enums.push({ command, key: `${command}_pipe`, values });
        }
      });
    });

    const dedup = new Map();
    enums.forEach((item) => {
      const key = `${item.command}:${item.values.join("|")}`;
      if (!dedup.has(key)) {
        dedup.set(key, item);
      }
    });
    return [...dedup.values()];
  };
})();
