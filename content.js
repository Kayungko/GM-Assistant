(function () {
  if (window !== window.top || window.__gmHelperInjected) {
    return;
  }
  window.__gmHelperInjected = true;

  const STORAGE_KEY = "gm-helper-state-v2";
  const COMMAND_CONFIG_VERSION = "v1-core-2026-04-09";
  const GITHUB_RELEASE_LATEST_API = "https://api.github.com/repos/Kayungko/GM-Assistant/releases/latest";
  const GITHUB_TAGS_API = "https://api.github.com/repos/Kayungko/GM-Assistant/tags?per_page=1";
  const GITHUB_TAGS_PAGE_URL = "https://github.com/Kayungko/GM-Assistant/tags";
  const REPO_MANIFEST_RAW_URL = "https://raw.githubusercontent.com/Kayungko/GM-Assistant/main/manifest.json";
  const REPO_RELEASE_PAGE_URL = "https://github.com/Kayungko/GM-Assistant/releases";
  const REPO_RELEASE_LATEST_PAGE_URL = "https://github.com/Kayungko/GM-Assistant/releases/latest";
  const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
  const FAB_ICON_PATH = "floatingBall.png";
  const SIDEBAR_DEFAULT_WIDTH = 420;
  const SIDEBAR_MIN_WIDTH = 420;
  const SIDEBAR_MAX_WIDTH = 960;
  const CATALOG_REGISTRY_PATH = "data/catalogs/registry.json";
  const CATALOG_REGISTRY_SCHEMA = "gm-helper-registry-v1";
  const FALLBACK_CATALOG_REGISTRY = {
    schema: CATALOG_REGISTRY_SCHEMA,
    groups: [
      {
        id: "items",
        enabled: true,
        packs: [
          { id: "items-in-game", group: "items", path: "data/catalogs/items/in-game.json", schema: "gm-helper-catalog-pack-v1" },
          { id: "items-out-game", group: "items", path: "data/catalogs/items/out-game.json", schema: "gm-helper-catalog-pack-v1" },
          { id: "items-mail-attachment", group: "items", path: "data/catalogs/items/mail-attachment.json", schema: "gm-helper-catalog-pack-v1" }
        ]
      },
      {
        id: "mail",
        enabled: true,
        packs: [
          { id: "mail-base", group: "mail", path: "data/catalogs/mail/base.json", schema: "gm-helper-catalog-pack-v1" }
        ]
      },
      {
        id: "tasks",
        enabled: true,
        packs: [
          { id: "tasks-base", group: "tasks", path: "data/catalogs/tasks/base.json", schema: "gm-helper-catalog-pack-v1" }
        ]
      },
      {
        id: "common",
        enabled: true,
        packs: [
          { id: "common-enums", group: "common", path: "data/catalogs/common/enums.json", schema: "gm-helper-catalog-pack-v1" },
          { id: "common-aliases", group: "common", path: "data/catalogs/common/aliases.json", schema: "gm-helper-catalog-pack-v1" },
          { id: "common-item-taxonomy", group: "common", path: "data/catalogs/common/item-taxonomy.json", schema: "gm-helper-catalog-pack-v1" },
          { id: "common-item-quality-map", group: "common", path: "data/catalogs/common/item-quality-map.json", schema: "gm-helper-catalog-pack-v1" }
        ]
      }
    ]
  };
  const TEXT_ENUMS_PATH = "data/catalogs/common/text-enums.json";
  const FALLBACK_TEXT_ENUMS = [
    { command: "compress_all_blob", key: "compress_all_blob_pipe", values: ["lz4", "zlib", "zstd"] },
    { command: "set_force_start", key: "bool_01", values: ["0", "1"] },
    { command: "role_compress", key: "role_compress_pipe", values: ["lz4", "zlib", "zstd"] },
    { command: "weaponskin_change", key: "weaponskin_change_pipe", values: ["0", "1", "2"] }
  ];
  const SECTION_CHEVRON_ICON = `
    <svg class="gm-helper-section-chevron-icon" viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
      <path d="M981.333 362.667l-384 384c0 0-46.933 49.067-85.333 49.067s-85.333-49.067-85.333-49.067l-384-384c0 0-42.667-36.268-42.667-64 0-64.00000001 68.26700001-64 68.267-64l889.6 0c0 0 66.133 0 66.133 64 0 27.733-42.667 64-42.667 64z"></path>
    </svg>
  `;
  const FUTURE_GROUPS = ["匹配与战斗", "排行榜与段位", "处罚与封禁", "活动与任务", "商城与充值"];
  const GROUPS = [
    { id: "player", title: "玩家基础", description: "查玩家、改等级、调资源。" },
    { id: "items", title: "物品与背包", description: "刷物品、发道具、改背包。" },
    { id: "mail", title: "邮件与发放", description: "发邮件、看邮件、处理回收。" },
    { id: "tasks", title: "任务与进度", description: "接取任务、完成任务、新手任务。" }
  ];
  const NAV_TABS = [
    {
      id: "library",
      title: "命令库",
      tooltip: "命令库",
      icon: '<svg class="gm-helper-rail-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 6.5h15a1 1 0 0 0 0-2h-15a1 1 0 0 0 0 2zm0 6h15a1 1 0 1 0 0-2h-15a1 1 0 1 0 0 2zm0 6h15a1 1 0 1 0 0-2h-15a1 1 0 1 0 0 2z"/></svg>'
    },
    {
      id: "settings",
      title: "设置",
      tooltip: "设置",
      icon: '<svg class="gm-helper-rail-icon-svg" viewBox="0 0 1024 1024" aria-hidden="true" focusable="false"><path d="M940 596l-76-57.6c0.8-8 1.6-16.8 1.6-26.4s-0.8-18.4-1.6-26.4l76-57.6c20.8-16 26.4-44 12.8-68L868 216.8c-9.6-16.8-28-27.2-47.2-27.2-6.4 0-12 0.8-18.4 3.2L712 228c-15.2-10.4-31.2-19.2-47.2-26.4l-13.6-92c-4-26.4-26.4-45.6-53.6-45.6H426.4c-27.2 0-49.6 19.2-53.6 44.8L360 201.6c-16 7.2-31.2 16-47.2 26.4l-90.4-35.2c-6.4-2.4-12.8-3.2-19.2-3.2-19.2 0-37.6 9.6-46.4 26.4L71.2 360c-13.6 22.4-8 52 12.8 68l76 57.6c-0.8 9.6-1.6 18.4-1.6 26.4s0 16.8 1.6 26.4L84 596c-20.8 16-26.4 44-12.8 68L156 807.2c9.6 16.8 28 27.2 47.2 27.2 6.4 0 12-0.8 18.4-3.2L312 796c15.2 10.4 31.2 19.2 47.2 26.4l13.6 92C376 940 399.2 960 426.4 960h171.2c27.2 0 49.6-19.2 53.6-44.8l13.6-92.8c16-7.2 31.2-16 47.2-26.4l90.4 35.2c6.4 2.4 12.8 3.2 19.2 3.2 19.2 0 37.6-9.6 46.4-26.4l85.6-144.8C966.4 640 960.8 612 940 596z m-236-84c0 105.6-86.4 192-192 192s-192-86.4-192-192 86.4-192 192-192 192 86.4 192 192z"></path></svg>'
    }
  ];
  const UI_THEME_OPTIONS = [
    { id: "default", label: "默认", description: "当前蓝色工具风格，信息密度更高。" },
    { id: "linear", label: "Linear", description: "深色中性底 + 靛蓝高亮，克制且清晰。" },
    { id: "sentry", label: "Sentry", description: "监控面板风格：深紫灰底 + 品红告警强调。" },
    { id: "notion", label: "Notion", description: "纸面感浅色风格：温和留白 + 低饱和中性色。" }
  ];
  const UI_THEME_IDS = new Set(UI_THEME_OPTIONS.map((item) => item.id));
  const UI_THEME_CLASS_PREFIX = "gm-helper-theme-";
  const UI_THEME_CLASS_NAMES = UI_THEME_OPTIONS
    .map((item) => item.id)
    .filter((id) => id !== "default")
    .map((id) => `${UI_THEME_CLASS_PREFIX}${id}`);
  const DEVELOPER_INFO = {
    team: "@ 柯家荣",
    maintainer: "GM 助手插件项目",
    contact: "内网飞书"
  };
  const FUTURE_ACCESS_NOTE = `后续计划接入：${FUTURE_GROUPS.join("、")}。当前版本先聚焦高频 GM 模板链路。`;
  const SYSTEM_TEMPLATE_MARKERS = {
    ids: new Set(["sample_bag_junk_batch"]),
    names: new Set(["背包杂物批量发放（示例）"])
  };

  const MODULES = window.__gmHelperModules || {};
  const RUNTIME_MODULES = window.__gmHelperRuntime || {};

  const COMMANDS = buildCommandsFromModules();

  function buildCommandsFromModules() {
    const helperApi = {
      cmd,
      param,
      num,
      select,
      uidParam,
      buildSimple,
      buildSummonItem,
      buildAddItem,
      buildSendMail,
      buildSendTemplateMail,
      buildSendCustomMail,
      buildRevokeMail
    };

    return [
      ...(MODULES.createPlayerCommands ? MODULES.createPlayerCommands(helperApi) : []),
      ...(MODULES.createItemCommands ? MODULES.createItemCommands(helperApi) : []),
      ...(MODULES.createMailCommands ? MODULES.createMailCommands(helperApi) : []),
      ...(MODULES.createTaskCommands ? MODULES.createTaskCommands(helperApi) : [])
    ];
  }
  const COMMAND_MAP = new Map(COMMANDS.map((x) => [x.id, x]));
  const defaultState = {
    userContext: { currentUid: "", recentUids: [], lastCommandId: "summon_item" },
    personalData: {
      favorites: ["summon_item", "send_mail"],
      recentCommands: [],
      presets: [],
      confirmedRiskCommands: [],
      importedCatalogs: { items: [], mail: [], tasks: [], common: [] },
      externalCatalogBindings: {
        item: null,
        email: null,
        tasks: null
      },
      externalCatalogSnapshots: {
        item: { items: [], mail: [], tasks: [], common: [] },
        email: { items: [], mail: [], tasks: [], common: [] },
        tasks: { items: [], mail: [], tasks: [], common: [] }
      },
      updateCheck: {
        lastCheckedAt: "",
        lastStatus: "idle",
        lastError: "",
        latestVersion: "",
        latestTag: "",
        latestSource: "",
        latestUrl: "",
        latestPublishedAt: "",
        latestName: "",
        lastShownVersion: "",
        lastDismissedAt: "",
        lastResult: "idle"
      },
      customTemplates: [],
      customQuickTemplateIds: [],
      skinTheme: "default"
    },
    commandConfigCache: { version: COMMAND_CONFIG_VERSION, commandIds: COMMANDS.map((x) => x.id) },
    ui: {
      tab: "library",
      libraryView: "list",
      selectedCommandId: "summon_item",
      searchQuery: "",
      searchSuggestions: { query: "", commands: [], items: [] },
      suggestionSelection: [],
      itemActionMenu: { itemId: "", itemName: "" },
      customTemplateDraft: { name: "", content: "", replaceUid: true },
      updateModalOpen: false,
      updateModalPayload: null,
      runtimeInvalidated: false,
      runtimeInvalidatedHintShown: false,
      status: null,
      collapsedSections: {},
      fabPosition: null,
      sidebarWidth: SIDEBAR_DEFAULT_WIDTH
    },
    workspaces: {}
  };

  let state = deepClone(defaultState);
  let lastExternalWritableTarget = null;
  let lastCommandInputTarget = null;
  let isSearchComposing = false;
  let pickerComposingKey = "";
  let fabDragState = null;
  let sidebarResizeState = null;
  let updateCheckPromise = null;
  let runtimeServices = null;
  let runtimeViews = null;
  let runtimeEventMaps = null;
  const dismissedUpdateVersionsInSession = new Set();
  let catalogStore = createEmptyCatalogStore();
  let catalogLoadWarnings = [];

  init().catch((error) => {
    if (!handleRuntimeInvalidated(error)) {
      console.error("[GM Helper] init failed:", error);
    }
  });

  function cmd(id, title, command, group, aliases, tags, description, useCases, risk, params, build) {
    return { id, title, command, group, aliases, tags, description, useCases, risk, params, build, supportsBatch: false, presets: [] };
  }

  function param(key, label, type, extra) {
    return { key, label, type, required: false, placeholder: "", defaultValue: "", helper: "", inheritGlobalUid: false, options: [], modes: null, ...extra };
  }

  function num(key, label, placeholder, extra) {
    return param(key, label, "number", { required: true, placeholder, ...extra });
  }

  function select(key, label, options, extra) {
    return param(key, label, "select", { required: true, options, ...extra });
  }

  function uidParam() {
    return param("uid", "角色UID", "uid", { required: true, placeholder: "留空则使用顶部当前 UID", helper: "未填写时自动使用顶部当前 UID。", inheritGlobalUid: true });
  }

  function buildSimple(order) {
    return function (command, ws) {
      const expandKey = order.find((key) => getParam(command, key)?.expandAsBatch);
      if (expandKey) {
        const expandParam = getParam(command, expandKey);
        const expandValues = resolveParamValues(expandParam, ws);
        if (expandParam.required && !expandValues.length) {
          return fail(`请填写“${expandParam.label}”`);
        }
        if (!expandValues.length) {
          return fail(`请填写“${expandParam.label}”`);
        }

        const lines = [];
        for (const expandValue of expandValues) {
          const args = [];
          for (const key of order) {
            const p = getParam(command, key);
            const value = key === expandKey ? expandValue : resolveParamValue(p, ws);
            if (p.required && !value) {
              return fail(`请填写“${p.label}”`);
            }
            if (value) {
              args.push(value);
            }
          }
          lines.push(`${command.command}${args.length ? ` ${args.join(" ")}` : ""}`);
        }
        return ok(lines.join("\n"), lines.length);
      }

      const args = [];
      for (const key of order) {
        const p = getParam(command, key);
        const value = resolveParamValue(p, ws);
        if (p.required && !value) {
          return fail(`请填写“${p.label}”`);
        }
        if (value) {
          args.push(value);
        }
      }
      return ok(`${command.command}${args.length ? ` ${args.join(" ")}` : ""}`, 1);
    };
  }

  async function init() {
    await restoreState();
    normalizeState();
    initRuntimeLayers();
    await runtimeServices.catalogService.rebuild();
    injectUI();
    bindFocusTracking();
    bindWindowResize();
    render();
  }

  function initRuntimeLayers() {
    runtimeServices = RUNTIME_MODULES.createRuntimeServices
      ? RUNTIME_MODULES.createRuntimeServices({
        rebuildCatalogStore,
        mergeCatalogSources,
        writeToTarget,
        findWritableTarget,
        checkLatestRelease,
        maybeAutoCheckLatestRelease,
        getReleasePageUrlFromUpdateState
      })
      : {
        catalogService: {
          rebuild: async () => rebuildCatalogStore(),
          merge: (builtin, externalSnapshots, imported) => mergeCatalogSources(builtin, externalSnapshots, imported)
        },
        targetWriter: {
          fill: (text) => writeToTarget(text, false),
          append: (text) => writeToTarget(text, true),
          resolveTarget: () => findWritableTarget()
        },
        versionService: {
          checkLatestRelease: async (options) => checkLatestRelease(options),
          maybeAutoCheckLatestRelease: async () => maybeAutoCheckLatestRelease(),
          getReleasePageUrl: () => getReleasePageUrlFromUpdateState()
        }
      };

    runtimeViews = RUNTIME_MODULES.createRuntimeViews
      ? RUNTIME_MODULES.createRuntimeViews(buildRuntimeViewContext())
      : null;
    runtimeEventMaps = RUNTIME_MODULES.createEventMaps
      ? RUNTIME_MODULES.createEventMaps()
      : { clickActionMap: {}, inputFieldMap: {}, changeFieldMap: {} };
  }

  function buildRuntimeViewContext() {
    return {
      state,
      commands: COMMANDS,
      commandMap: COMMAND_MAP,
      groups: GROUPS,
      developerInfo: DEVELOPER_INFO,
      futureAccessNote: FUTURE_ACCESS_NOTE,
      escapeHtml,
      badgeClass,
      riskLabel,
      lineCount,
      shouldShowParam,
      renderField,
      renderCard,
      renderCollapsibleSection,
      getCustomTemplates,
      normalizeCustomQuickTemplateIds,
      normalizeCustomTemplateDraft,
      nonEmptyLines,
      getSelectedSuggestionItemIds,
      getUpdateCheckState,
      getCatalogLoadWarnings: () => catalogLoadWarnings,
      getExtensionVersionSafe
    };
  }

  async function restoreState() {
    if (!chrome?.storage?.local) {
      return;
    }
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result?.[STORAGE_KEY]) {
        state = merge(defaultState, result[STORAGE_KEY]);
      }
    } catch (error) {
      if (!handleRuntimeInvalidated(error)) {
        console.warn("[GM Helper] restoreState failed:", error);
      }
    }
  }

  async function persistState() {
    if (!chrome?.storage?.local) {
      return;
    }
    try {
      await chrome.storage.local.set({
        [STORAGE_KEY]: {
          userContext: state.userContext,
          personalData: state.personalData,
          commandConfigCache: { version: COMMAND_CONFIG_VERSION, commandIds: COMMANDS.map((x) => x.id) },
          ui: {
            tab: state.ui.tab,
            libraryView: state.ui.libraryView,
            selectedCommandId: state.ui.selectedCommandId,
            searchQuery: state.ui.searchQuery,
            customTemplateDraft: state.ui.customTemplateDraft,
            collapsedSections: state.ui.collapsedSections,
            fabPosition: state.ui.fabPosition,
            sidebarWidth: state.ui.sidebarWidth
          },
          workspaces: state.workspaces
        }
      });
    } catch (error) {
      if (!handleRuntimeInvalidated(error)) {
        console.warn("[GM Helper] persistState failed:", error);
      } else {
        render();
      }
    }
  }

  function isExtensionContextInvalidated(error) {
    return String(error?.message || error || "").includes("Extension context invalidated");
  }

  function handleRuntimeInvalidated(error) {
    if (!isExtensionContextInvalidated(error)) {
      return false;
    }
    state.ui.runtimeInvalidated = true;
    if (!state.ui.runtimeInvalidatedHintShown) {
      state.ui.runtimeInvalidatedHintShown = true;
      setStatus("扩展已更新，请刷新页面恢复插件功能", "error");
    }
    return true;
  }

  function getRuntimeUrlSafe(path) {
    try {
      return chrome?.runtime?.getURL ? chrome.runtime.getURL(path) : path;
    } catch (error) {
      handleRuntimeInvalidated(error);
      return path;
    }
  }

  function normalizeItemActionMenu(menu) {
    if (!menu || typeof menu !== "object") {
      return { itemId: "", itemName: "" };
    }
    return {
      itemId: String(menu.itemId || "").trim(),
      itemName: String(menu.itemName || "").trim()
    };
  }

  function clearItemActionMenu() {
    state.ui.itemActionMenu = { itemId: "", itemName: "" };
  }

  function normalizeSuggestionSelection(list) {
    return Array.isArray(list) ? uniqStrings(list.map((item) => String(item || "").trim()).filter(Boolean)) : [];
  }

  function clearSuggestionSelection() {
    state.ui.suggestionSelection = [];
  }

  function normalizeCustomTemplateDraft(draft) {
    if (!draft || typeof draft !== "object") {
      return { name: "", content: "", replaceUid: true };
    }
    return {
      name: String(draft.name || ""),
      content: String(draft.content || ""),
      replaceUid: draft.replaceUid !== false
    };
  }

  function normalizeUpdateCheckState(raw) {
    const next = raw && typeof raw === "object" ? raw : {};
    const lastStatus = String(next.lastStatus || "idle").trim();
    const lastResult = String(next.lastResult || "idle").trim();
    return {
      lastCheckedAt: String(next.lastCheckedAt || "").trim(),
      lastStatus: ["idle", "success", "failed", "incomparable"].includes(lastStatus) ? lastStatus : "idle",
      lastError: String(next.lastError || "").trim(),
      latestVersion: normalizeVersion(next.latestVersion || ""),
      latestTag: String(next.latestTag || "").trim(),
      latestSource: String(next.latestSource || "").trim(),
      latestUrl: String(next.latestUrl || "").trim(),
      latestPublishedAt: String(next.latestPublishedAt || "").trim(),
      latestName: String(next.latestName || "").trim(),
      lastShownVersion: normalizeVersion(next.lastShownVersion || ""),
      lastDismissedAt: String(next.lastDismissedAt || "").trim(),
      lastResult: ["idle", "upToDate", "updateAvailable", "failed", "incomparable"].includes(lastResult) ? lastResult : "idle"
    };
  }

  function normalizeUpdateModalPayload(payload) {
    if (!payload || typeof payload !== "object") {
      return null;
    }
    const mode = String(payload.mode || "updateAvailable").trim();
    const normalizedMode = mode === "upToDate" ? "upToDate" : "updateAvailable";
    const latestVersion = normalizeVersion(payload.latestVersion || "");
    const latestTag = String(payload.latestTag || "").trim();
    const latestUrl = String(payload.latestUrl || "").trim();
    const localVersion = normalizeVersion(payload.localVersion || "");
    if (!latestVersion && !latestTag && !localVersion) {
      return null;
    }
    return {
      mode: normalizedMode,
      latestVersion,
      latestTag,
      localVersion,
      latestUrl: latestUrl || (latestTag ? `${REPO_RELEASE_PAGE_URL}/tag/${encodeURIComponent(latestTag)}` : REPO_RELEASE_PAGE_URL),
      latestPublishedAt: String(payload.latestPublishedAt || "").trim(),
      latestName: String(payload.latestName || "").trim(),
      checkedAt: String(payload.checkedAt || "").trim()
    };
  }

  function normalizeCustomTemplates(list) {
    if (!Array.isArray(list)) {
      return [];
    }
    const map = new Map();
    list.forEach((row, index) => {
      const name = String(row?.name || "").trim();
      const content = String(row?.content || "");
      if (!name || !content.trim()) {
        return;
      }
      const id = String(row?.id || `ct_${Date.now()}_${index}`).trim();
      map.set(id, {
        id,
        name,
        content,
        replaceUid: row?.replaceUid !== false,
        updatedAt: Number(row?.updatedAt) || Date.now()
      });
    });
    return Array.from(map.values())
      .sort((left, right) => Number(right.updatedAt || 0) - Number(left.updatedAt || 0))
      .slice(0, 60);
  }

  function stripSystemGeneratedTemplates(templates) {
    return (templates || []).filter((item) => {
      const id = String(item?.id || "").trim();
      const name = String(item?.name || "").trim();
      if (SYSTEM_TEMPLATE_MARKERS.ids.has(id)) {
        return false;
      }
      if (SYSTEM_TEMPLATE_MARKERS.names.has(name)) {
        return false;
      }
      return true;
    });
  }

  function normalizeCustomQuickTemplateIds(ids, templates) {
    const source = Array.isArray(ids) ? ids : [];
    const validIds = new Set((templates || []).map((item) => item.id));
    return uniqStrings(source.map((x) => String(x || "").trim()).filter(Boolean))
      .filter((id) => validIds.has(id))
      .slice(0, 8);
  }

  function normalizeThemeId(themeId) {
    const value = String(themeId || "").trim();
    return UI_THEME_IDS.has(value) ? value : "default";
  }

  function getThemeMeta(themeId) {
    const normalizedId = normalizeThemeId(themeId);
    return UI_THEME_OPTIONS.find((item) => item.id === normalizedId) || UI_THEME_OPTIONS[0];
  }

  function setTheme(themeId) {
    const previousId = normalizeThemeId(state.personalData.skinTheme);
    const nextTheme = getThemeMeta(themeId);
    state.personalData.skinTheme = nextTheme.id;
    return {
      changed: previousId !== nextTheme.id,
      theme: nextTheme
    };
  }

  function applySidebarTheme(sidebar) {
    if (!sidebar) {
      return;
    }
    UI_THEME_CLASS_NAMES.forEach((className) => sidebar.classList.remove(className));
    const theme = getThemeMeta(state.personalData.skinTheme);
    sidebar.dataset.theme = theme.id;
    if (theme.id !== "default") {
      sidebar.classList.add(`${UI_THEME_CLASS_PREFIX}${theme.id}`);
    }
  }

  function setItemActionMenu(itemId, itemName) {
    state.ui.itemActionMenu = {
      itemId: String(itemId || "").trim(),
      itemName: String(itemName || "").trim()
    };
  }

  function normalizeState() {
    if (!COMMAND_MAP.has(state.ui.selectedCommandId)) {
      state.ui.selectedCommandId = "summon_item";
    }
    if (!COMMAND_MAP.has(state.userContext.lastCommandId)) {
      state.userContext.lastCommandId = "summon_item";
    }
    state.userContext.recentUids = uniqStrings(state.userContext.recentUids).slice(0, 6);
    state.personalData.favorites = uniqCommandIds(state.personalData.favorites);
    state.personalData.recentCommands = uniqCommandIds(state.personalData.recentCommands).slice(0, 8);
    state.personalData.confirmedRiskCommands = uniqCommandIds(state.personalData.confirmedRiskCommands);
    state.personalData.presets = Array.isArray(state.personalData.presets) ? state.personalData.presets.filter((x) => COMMAND_MAP.has(x.commandId)) : [];
    state.personalData.importedCatalogs = normalizeImportedCatalogs(state.personalData.importedCatalogs);
    state.personalData.externalCatalogBindings = normalizeExternalCatalogBindings(state.personalData.externalCatalogBindings);
    state.personalData.externalCatalogSnapshots = normalizeExternalCatalogSnapshots(state.personalData.externalCatalogSnapshots);
    state.personalData.updateCheck = normalizeUpdateCheckState(state.personalData.updateCheck);
    if (Object.prototype.hasOwnProperty.call(state.personalData, "customTemplateSeeded")) {
      delete state.personalData.customTemplateSeeded;
    }
    state.personalData.customTemplates = stripSystemGeneratedTemplates(normalizeCustomTemplates(state.personalData.customTemplates));
    state.personalData.customQuickTemplateIds = normalizeCustomQuickTemplateIds(
      state.personalData.customQuickTemplateIds,
      state.personalData.customTemplates
    );
    state.personalData.skinTheme = normalizeThemeId(state.personalData.skinTheme);
    state.commandConfigCache = { version: COMMAND_CONFIG_VERSION, commandIds: COMMANDS.map((x) => x.id) };
    COMMANDS.forEach((command) => ensureWorkspace(command.id));
    const legacyView = String(state.ui.view || "");
    if (!state.ui.tab) {
      state.ui.tab = "library";
    }
    if (state.ui.tab === "operation") {
      state.ui.tab = "library";
    }
    if (!state.ui.libraryView) {
      state.ui.libraryView = legacyView === "workspace" ? "workspace" : "list";
    }
    if (!["library", "settings"].includes(state.ui.tab)) {
      state.ui.tab = "library";
    }
    if (!["list", "workspace"].includes(state.ui.libraryView)) {
      state.ui.libraryView = "list";
    }
    state.ui.itemActionMenu = normalizeItemActionMenu(state.ui.itemActionMenu);
    state.ui.suggestionSelection = normalizeSuggestionSelection(state.ui.suggestionSelection);
    state.ui.customTemplateDraft = normalizeCustomTemplateDraft(state.ui.customTemplateDraft);
    state.ui.updateModalOpen = Boolean(state.ui.updateModalOpen);
    state.ui.updateModalPayload = normalizeUpdateModalPayload(state.ui.updateModalPayload);
    state.ui.runtimeInvalidated = Boolean(state.ui.runtimeInvalidated);
    state.ui.runtimeInvalidatedHintShown = Boolean(state.ui.runtimeInvalidatedHintShown);
    state.ui.searchSuggestions = { query: "", commands: [], items: [] };
    state.ui.sidebarWidth = normalizeSidebarWidth(state.ui.sidebarWidth);
  }

  function merge(base, incoming) {
    const merged = deepClone(base);
    if (!incoming || typeof incoming !== "object") {
      return merged;
    }
    merged.userContext = { ...merged.userContext, ...(incoming.userContext || {}) };
    merged.personalData = { ...merged.personalData, ...(incoming.personalData || {}) };
    merged.commandConfigCache = { ...merged.commandConfigCache, ...(incoming.commandConfigCache || {}) };
    merged.ui = { ...merged.ui, ...(incoming.ui || {}) };
    merged.workspaces = { ...(incoming.workspaces || {}) };
    return merged;
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createEmptyCatalogStore() {
    return {
      groups: { items: [], mail: [], tasks: [], common: [] },
      enums: {},
      aliases: { items: [], mail: [], tasks: [] },
      textEnums: [],
      itemTaxonomy: createDefaultItemTaxonomy(),
      itemTaxonomyIndex: createItemTaxonomyIndex(createDefaultItemTaxonomy()),
      itemQualityById: {},
      itemOptions: []
    };
  }

  function captureBodyScrollState() {
    const body = document.querySelector("#gm-helper-sidebar .gm-helper-body");
    if (!body) {
      return { top: 0, left: 0 };
    }
    return {
      top: body.scrollTop,
      left: body.scrollLeft
    };
  }

  function restoreBodyScrollState(scrollState) {
    const body = document.querySelector("#gm-helper-sidebar .gm-helper-body");
    if (!body || !scrollState) {
      return;
    }
    body.scrollTop = Number(scrollState.top) || 0;
    body.scrollLeft = Number(scrollState.left) || 0;
  }

  function createEmptyCatalogGroups() {
    return { items: [], mail: [], tasks: [], common: [] };
  }

  function normalizeImportedCatalogs(incoming) {
    const base = createEmptyCatalogGroups();
    if (!incoming || typeof incoming !== "object") {
      return base;
    }
    Object.keys(base).forEach((key) => {
      if (Array.isArray(incoming[key])) {
        base[key] = incoming[key];
      }
    });
    return base;
  }

  function normalizeExternalCatalogBinding(binding, slot) {
    if (!binding || typeof binding !== "object") {
      return null;
    }
    const fileName = String(binding.fileName || "").trim();
    if (!fileName) {
      return null;
    }
    return {
      slot: String(binding.slot || slot || "").trim() || String(slot || "").trim(),
      fileName,
      sourceHint: String(binding.sourceHint || "").trim(),
      lastImportedAt: String(binding.lastImportedAt || "").trim(),
      lastStatus: String(binding.lastStatus || "success").trim() || "success",
      entryCount: Math.max(0, Number(binding.entryCount) || 0),
      lastError: String(binding.lastError || "").trim()
    };
  }

  function normalizeExternalCatalogBindings(incoming) {
    return {
      item: normalizeExternalCatalogBinding(incoming?.item, "item"),
      email: normalizeExternalCatalogBinding(incoming?.email, "email"),
      tasks: normalizeExternalCatalogBinding(incoming?.tasks, "tasks")
    };
  }

  function normalizeExternalCatalogSnapshots(incoming) {
    return {
      item: normalizeImportedCatalogs(incoming?.item),
      email: normalizeImportedCatalogs(incoming?.email),
      tasks: normalizeImportedCatalogs(incoming?.tasks)
    };
  }

  function mergeCatalogSources(builtin, externalSnapshots, imported) {
    const safeBuiltin = normalizeImportedCatalogs(builtin);
    const safeImported = normalizeImportedCatalogs(imported);
    const safeExternal = normalizeExternalCatalogSnapshots(externalSnapshots);
    return {
      items: [...safeImported.items, ...safeExternal.item.items, ...safeExternal.email.items, ...safeExternal.tasks.items, ...safeBuiltin.items],
      mail: [...safeImported.mail, ...safeExternal.item.mail, ...safeExternal.email.mail, ...safeExternal.tasks.mail, ...safeBuiltin.mail],
      tasks: [...safeImported.tasks, ...safeExternal.item.tasks, ...safeExternal.email.tasks, ...safeExternal.tasks.tasks, ...safeBuiltin.tasks],
      common: [...safeBuiltin.common, ...safeExternal.item.common, ...safeExternal.email.common, ...safeExternal.tasks.common, ...safeImported.common]
    };
  }

  async function rebuildCatalogStore() {
    try {
      const { groups: builtin, warnings } = await loadBuiltInCatalogs();
      const imported = normalizeImportedCatalogs(state.personalData.importedCatalogs);
      const externalSnapshots = normalizeExternalCatalogSnapshots(state.personalData.externalCatalogSnapshots);
      const merged = mergeCatalogSources(builtin, externalSnapshots, imported);
      const textEnums = await loadTextEnums();
      catalogStore = buildCatalogStore(merged, textEnums);
      catalogLoadWarnings = warnings;
      if (warnings.length && !state.ui.status) {
        setStatus(`部分词典加载失败（${warnings.length}项），可在控制台查看详情`, "error");
      }
    } catch (error) {
      if (!handleRuntimeInvalidated(error)) {
        console.warn("[GM Helper] catalog load failed:", error);
      }
      catalogStore = createEmptyCatalogStore();
      catalogLoadWarnings = [String(error.message || error)];
    }
  }

  async function loadBuiltInCatalogs() {
    const grouped = { items: [], mail: [], tasks: [], common: [] };
    const warnings = [];
    let registry = null;

    try {
      const registryUrl = getRuntimeUrlSafe(CATALOG_REGISTRY_PATH);
      registry = await fetchJson(registryUrl);
    } catch (error) {
      handleRuntimeInvalidated(error);
      registry = FALLBACK_CATALOG_REGISTRY;
      warnings.push(`registry 加载失败，已使用内置兜底：${error.message || error}`);
      console.warn("[GM Helper] registry load failed, fallback to built-in registry:", error);
    }

    if (registry?.schema && registry.schema !== CATALOG_REGISTRY_SCHEMA) {
      warnings.push(`registry schema 不匹配：${registry.schema}`);
      registry = FALLBACK_CATALOG_REGISTRY;
    }

    if (!registry?.groups || !Array.isArray(registry.groups)) {
      warnings.push("registry.json 缺少 groups，已使用内置兜底");
      registry = FALLBACK_CATALOG_REGISTRY;
    }

    for (const group of registry.groups) {
      if (!grouped[group.id]) {
        warnings.push(`未知分组：${group.id}`);
        continue;
      }
      if (!group?.enabled || !Array.isArray(group.packs)) {
        continue;
      }
      for (const pack of group.packs) {
        if (pack?.enabled === false) {
          continue;
        }
        if (pack?.group && pack.group !== group.id) {
          warnings.push(`pack 分组声明不一致：${pack.id || pack.path}`);
          continue;
        }
        const path = String(pack.path || "").trim();
        if (!path) {
          warnings.push(`分组 ${group.id} 下存在无效 path`);
          continue;
        }
        try {
          const json = await fetchJson(getRuntimeUrlSafe(path));
          const expectedSchema = String(pack.schema || "").trim();
          if (expectedSchema && expectedSchema !== String(json?.schema || "")) {
            warnings.push(`词典 schema 不匹配：${path}`);
            continue;
          }
          if (!Array.isArray(json?.entries)) {
            warnings.push(`词典缺少 entries：${path}`);
            continue;
          }
          grouped[group.id].push(...json.entries);
        } catch (error) {
          handleRuntimeInvalidated(error);
          warnings.push(`词典加载失败：${path}`);
          console.warn("[GM Helper] load pack failed:", path, error);
        }
      }
    }
    return { groups: grouped, warnings };
  }

  async function loadTextEnums() {
    try {
      const url = getRuntimeUrlSafe(TEXT_ENUMS_PATH);
      const payload = await fetchJson(url);
      if (Array.isArray(payload)) {
        return payload;
      }
      if (Array.isArray(payload?.entries)) {
        return payload.entries;
      }
      return FALLBACK_TEXT_ENUMS;
    } catch (error) {
      handleRuntimeInvalidated(error);
      return FALLBACK_TEXT_ENUMS;
    }
  }

  function buildCatalogStore(groups, textEnums) {
    const store = createEmptyCatalogStore();
    store.groups.items = dedupEntries((groups.items || []).map(normalizeItemEntry).filter((x) => x.id), "id");
    store.groups.mail = dedupEntries(groups.mail || [], "emailId");
    store.groups.tasks = dedupEntries(groups.tasks || [], "taskId");
    store.groups.common = groups.common || [];
    store.textEnums = Array.isArray(textEnums) ? textEnums : [];

    for (const entry of store.groups.common) {
      if (entry?.key && Array.isArray(entry.values)) {
        store.enums[entry.key] = entry.values.map((x) => ({ value: String(x.value || ""), label: String(x.label || x.value || "") })).filter((x) => x.value);
      }
    }
    for (const item of store.textEnums) {
      if (!item?.command || !Array.isArray(item.values) || !item.values.length) {
        continue;
      }
      const normalizedValues = item.values.map((x) => ({ value: String(x || "").trim(), label: String(x || "").trim() })).filter((x) => x.value);
      if (!normalizedValues.length) {
        continue;
      }
      const fullKey = `text:${item.command}:${item.key || "enum"}`;
      const commandKey = `text:${item.command}`;
      store.enums[fullKey] = normalizedValues;
      if (!store.enums[commandKey]) {
        store.enums[commandKey] = normalizedValues;
      }
    }
    for (const entry of store.groups.common) {
      if (entry?.term && Array.isArray(entry.targets) && store.aliases[entry.key]) {
        store.aliases[entry.key].push({ term: String(entry.term), targets: entry.targets.map((x) => String(x)) });
      }
    }

    store.itemTaxonomy = buildItemTaxonomy(store.groups.common);
    store.itemTaxonomyIndex = createItemTaxonomyIndex(store.itemTaxonomy);
    store.itemQualityById = buildItemQualityMap(store.groups.common);
    store.itemOptions = store.groups.items.map((item) => buildItemOption(item, store.itemTaxonomyIndex, store.itemQualityById));
    return store;
  }

  function dedupEntries(entries, keyField) {
    const map = new Map();
    for (const raw of Array.isArray(entries) ? entries : []) {
      const key = String(raw?.[keyField] || "").trim();
      if (!key || map.has(key)) {
        continue;
      }
      map.set(key, raw);
    }
    return [...map.values()];
  }

  function normalizeItemEntry(raw) {
    if (!raw || typeof raw !== "object") {
      return { id: "", name: "" };
    }
    const id = String(raw.id || raw.itemId || "").trim();
    const quality = String(raw.quality || raw.itemQuality || "").trim();
    return {
      ...raw,
      id,
      name: String(raw.name || raw.desc || "").trim(),
      typeName: String(raw.typeName || (raw.itemId ? "邮件附件" : "")).trim(),
      itemType: String(raw.itemType || "").trim(),
      itemSubType: String(raw.itemSubType || "").trim(),
      quality,
      aliases: Array.isArray(raw.aliases) ? raw.aliases : []
    };
  }

  function createDefaultItemTaxonomy() {
    return {
      scopes: [{ id: "in-game", label: "场内" }, { id: "out-game", label: "场外" }],
      types: [],
      subTypes: [],
      typeAliases: [],
      subTypeAliases: [],
      extendedTypes: [],
      qualities: [{ id: "1", label: "白色" }, { id: "2", label: "绿色" }, { id: "3", label: "蓝色" }, { id: "4", label: "紫色" }, { id: "5", label: "金色" }, { id: "6", label: "橙色" }]
    };
  }

  function buildItemTaxonomy(commonEntries) {
    const fallback = createDefaultItemTaxonomy();
    const entry = (Array.isArray(commonEntries) ? commonEntries : []).find((x) => x?.kind === "item_taxonomy");
    if (!entry) {
      return fallback;
    }
    const taxonomy = {
      scopes: Array.isArray(entry.scopes) ? entry.scopes : fallback.scopes,
      types: Array.isArray(entry.types) ? entry.types : [],
      subTypes: Array.isArray(entry.subTypes) ? entry.subTypes : [],
      typeAliases: Array.isArray(entry.typeAliases) ? entry.typeAliases : [],
      subTypeAliases: Array.isArray(entry.subTypeAliases) ? entry.subTypeAliases : [],
      extendedTypes: Array.isArray(entry.extendedTypes) ? entry.extendedTypes.map((x) => String(x || "").trim()).filter(Boolean) : [],
      qualities: Array.isArray(entry.qualities) && entry.qualities.length ? entry.qualities : fallback.qualities
    };
    return taxonomy;
  }

  function buildItemQualityMap(commonEntries) {
    const entry = (Array.isArray(commonEntries) ? commonEntries : []).find((x) => x?.kind === "item_quality_map");
    const mapping = {};
    if (!entry?.itemQualityById || typeof entry.itemQualityById !== "object") {
      return mapping;
    }
    Object.keys(entry.itemQualityById).forEach((itemId) => {
      const normalizedId = String(itemId || "").trim();
      const quality = String(entry.itemQualityById[itemId] || "").trim();
      if (!normalizedId || !quality) {
        return;
      }
      mapping[normalizedId] = quality;
    });
    return mapping;
  }

  function createItemTaxonomyIndex(taxonomy) {
    const fallback = createDefaultItemTaxonomy();
    const normalized = taxonomy || fallback;
    const scopeMap = new Map((normalized.scopes || []).map((x) => [String(x.id), String(x.label || x.id)]));
    const typeMap = new Map();
    const typeByScope = new Map();
    (normalized.types || []).forEach((type) => {
      const id = String(type.id || "").trim();
      if (!id) {
        return;
      }
      const scope = String(type.scope || detectScopeByTypeId(id)).trim() || "out-game";
      const row = { id, scope, label: String(type.label || `类型${id}`), isExtended: (normalized.extendedTypes || []).includes(id) };
      typeMap.set(id, row);
      if (!typeByScope.has(scope)) {
        typeByScope.set(scope, []);
      }
      typeByScope.get(scope).push(row);
    });

    const subTypeMap = new Map();
    const subTypeByType = new Map();
    (normalized.subTypes || []).forEach((subType) => {
      const typeId = String(subType.typeId || "").trim();
      const id = String(subType.id || "").trim();
      if (!typeId || !id) {
        return;
      }
      const key = `${typeId}:${id}`;
      const row = { typeId, id, label: String(subType.label || `子类型${id}`) };
      subTypeMap.set(key, row);
      if (!subTypeByType.has(typeId)) {
        subTypeByType.set(typeId, []);
      }
      subTypeByType.get(typeId).push(row);
    });

    const typeAliasByType = new Map();
    (normalized.typeAliases || []).forEach((row) => {
      const typeId = String(row.typeId || "").trim();
      const term = String(row.term || "").trim();
      if (!typeId || !term) {
        return;
      }
      if (!typeAliasByType.has(typeId)) {
        typeAliasByType.set(typeId, []);
      }
      typeAliasByType.get(typeId).push(term);
    });

    const subTypeAliasByKey = new Map();
    (normalized.subTypeAliases || []).forEach((row) => {
      const typeId = String(row.typeId || "").trim();
      const subTypeId = String(row.subTypeId || row.id || "").trim();
      const term = String(row.term || "").trim();
      if (!typeId || !subTypeId || !term) {
        return;
      }
      const key = `${typeId}:${subTypeId}`;
      if (!subTypeAliasByKey.has(key)) {
        subTypeAliasByKey.set(key, []);
      }
      subTypeAliasByKey.get(key).push(term);
    });

    const qualityMap = new Map((normalized.qualities || []).map((row) => [String(row.id || ""), String(row.label || row.id || "")]));
    const extendedTypeSet = new Set((normalized.extendedTypes || []).map((x) => String(x || "").trim()).filter(Boolean));

    return {
      scopeMap,
      typeMap,
      typeByScope,
      subTypeMap,
      subTypeByType,
      typeAliasByType,
      subTypeAliasByKey,
      qualityMap,
      extendedTypeSet
    };
  }

  function detectScopeByTypeId(typeId) {
    const value = Number(typeId);
    if (!Number.isFinite(value)) {
      return "out-game";
    }
    return value > 0 && value < 1000 ? "in-game" : "out-game";
  }

  function inferType30QualityId(itemId, typeId) {
    if (String(typeId || "").trim() !== "30") {
      return "";
    }
    const normalizedId = String(itemId || "").trim();
    const match = normalizedId.match(/^30([1-6])\d+$/);
    return match ? String(match[1]) : "";
  }

  function buildItemOption(item, taxonomyIndex, qualityMap) {
    const id = String(item.id || "").trim();
    const typeId = String(item.itemType || "").trim();
    const subTypeId = String(item.itemSubType || "").trim();
    const typeMeta = taxonomyIndex.typeMap.get(typeId);
    const scope = typeMeta?.scope || detectScopeByTypeId(typeId);
    const scopeLabel = taxonomyIndex.scopeMap.get(scope) || (scope === "in-game" ? "场内" : "场外");
    const isExtended = taxonomyIndex.extendedTypeSet.has(typeId);
    const typeLabel = typeMeta?.label || (isExtended ? `扩展类型(${typeId})` : `类型${typeId || "-"}`);
    const subTypeKey = `${typeId}:${subTypeId}`;
    const subTypeMeta = taxonomyIndex.subTypeMap.get(subTypeKey);
    const subTypeLabel = subTypeMeta?.label || (subTypeId ? `子类型${subTypeId}` : "未分类");
    const explicitQualityId = String(qualityMap[id] || item.quality || "").trim();
    const qualityId = explicitQualityId || inferType30QualityId(id, typeId);
    const qualityLabel = taxonomyIndex.qualityMap.get(qualityId) || "未知品质";
    const qualitySemanticAliases = getItemQualitySemanticAliases(typeId, qualityId, qualityLabel);
    const pathLabel = `${scopeLabel}/${typeLabel}/${subTypeLabel}`;

    const aliases = []
      .concat(item.aliases || [])
      .concat([scopeLabel, typeLabel, subTypeLabel, qualityLabel, item.typeName])
      .concat(qualitySemanticAliases)
      .concat(taxonomyIndex.typeAliasByType.get(typeId) || [])
      .concat(taxonomyIndex.subTypeAliasByKey.get(subTypeKey) || [])
      .map((x) => String(x || "").trim())
      .filter(Boolean);

    return {
      value: id,
      id,
      name: String(item.name || "").trim(),
      scope,
      scopeLabel,
      typeId,
      typeLabel,
      subTypeId,
      subTypeLabel,
      qualityId: qualityId || "unknown",
      qualityLabel,
      isExtended,
      pathLabel,
      label: `${id} ${String(item.name || "").trim()} · ${pathLabel} · ${qualityLabel}`.trim(),
      aliases
    };
  }

  function getItemQualitySemanticAliases(typeId, qualityId, qualityLabel) {
    const isType30 = String(typeId || "").trim() === "30";
    if (!isType30) {
      return [];
    }
    const id = String(qualityId || "").trim();
    const label = String(qualityLabel || "").trim();
    const aliases = [];
    if (id === "6") {
      aliases.push("大红", "红装", "超高价值", "超高价值物品", "高价值红装");
    }
    if (id === "5") {
      aliases.push("大金", "金装", "高价值", "高价值物品", "金色品质");
    }
    if (label === "金色") {
      aliases.push("大金", "高价值");
    }
    if (label === "橙色") {
      aliases.push("大红", "超高价值");
    }
    return uniqStrings(aliases);
  }

  async function fetchJson(url) {
    const text = await fetchTextWithFallback(url);
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`JSON parse failed: ${error.message}`);
    }
  }

  async function fetchTextWithFallback(url) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (fetchError) {
      if (!String(url || "").startsWith("chrome-extension://")) {
        throw fetchError;
      }
      try {
        return await fetchTextByXhr(url);
      } catch (xhrError) {
        throw fetchError;
      }
    }
  }

  function fetchTextByXhr(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "text";
      xhr.onload = () => {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
          resolve(String(xhr.responseText || ""));
          return;
        }
        reject(new Error(`HTTP ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("XHR failed"));
      xhr.onabort = () => reject(new Error("XHR aborted"));
      xhr.send();
    });
  }

  function normalizeVersion(tagOrVersion) {
    const text = String(tagOrVersion || "").trim().replace(/^v/i, "");
    if (!/^\d+(\.\d+){0,2}$/.test(text)) {
      return "";
    }
    const parts = text.split(".").map((x) => Number(x));
    while (parts.length < 3) {
      parts.push(0);
    }
    if (parts.some((value) => !Number.isInteger(value) || value < 0)) {
      return "";
    }
    return parts.join(".");
  }

  function compareSemver(left, right) {
    const a = normalizeVersion(left);
    const b = normalizeVersion(right);
    if (!a || !b) {
      return null;
    }
    const av = a.split(".").map((x) => Number(x));
    const bv = b.split(".").map((x) => Number(x));
    for (let index = 0; index < 3; index += 1) {
      if (av[index] > bv[index]) {
        return 1;
      }
      if (av[index] < bv[index]) {
        return -1;
      }
    }
    return 0;
  }

  function shouldUseCachedUpdateCheck(force, updateCheck) {
    if (force) {
      return false;
    }
    const checkedAt = Date.parse(String(updateCheck?.lastCheckedAt || ""));
    if (!Number.isFinite(checkedAt)) {
      return false;
    }
    return (Date.now() - checkedAt) < UPDATE_CHECK_INTERVAL_MS;
  }

  function simplifyUpdateCheckError(error) {
    const text = String(error?.message || error || "").trim();
    if (!text) {
      return "未知错误";
    }
    if (text.includes("HTTP 403")) {
      return "请求受限（HTTP 403），已尝试多源兜底，请稍后重试";
    }
    if (text.includes("HTTP 404")) {
      return "未找到可用版本信息（HTTP 404）";
    }
    return text;
  }

  function composeUpdateFetchError(errors) {
    const list = (Array.isArray(errors) ? errors : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean);
    if (!list.length) {
      return "未获取到可用版本信息";
    }
    return list.slice(0, 3).join(" | ");
  }

  function extractTagFromTagsHtml(html) {
    const text = String(html || "");
    if (!text) {
      return "";
    }
    const matched = text.match(/\/tag\/(v?\d+(?:\.\d+){1,2})/i);
    if (!matched?.[1]) {
      return "";
    }
    return matched[1];
  }

  function extractLatestReleaseFromHtml(html) {
    const text = String(html || "");
    if (!text) {
      return null;
    }
    const tagMatch = text.match(/\/Kayungko\/GM-Assistant\/releases\/tag\/(v?\d+(?:\.\d+){1,2})/i)
      || text.match(/\/releases\/tag\/(v?\d+(?:\.\d+){1,2})/i);
    if (!tagMatch?.[1]) {
      return null;
    }
    const latestTag = String(tagMatch[1]).trim();
    const latestVersion = normalizeVersion(latestTag);
    if (!latestVersion) {
      return null;
    }
    const datetimeMatch = text.match(/<relative-time[^>]*datetime="([^"]+)"/i);
    return {
      latestTag,
      latestVersion,
      latestPublishedAt: String(datetimeMatch?.[1] || "").trim(),
      latestName: ""
    };
  }

  async function fetchLatestByReleaseApi() {
    const payload = await fetchJson(GITHUB_RELEASE_LATEST_API);
    const latestTag = String(payload?.tag_name || "").trim();
    if (!latestTag) {
      throw new Error("release api: tag_name 为空");
    }
    const latestVersion = normalizeVersion(latestTag);
    if (!latestVersion) {
      throw new Error(`release api: tag 格式不支持（${latestTag}）`);
    }
    return {
      source: "release",
      latestTag,
      latestVersion,
      latestUrl: String(payload?.html_url || "").trim() || `${REPO_RELEASE_PAGE_URL}/tag/${encodeURIComponent(latestTag)}`,
      latestPublishedAt: String(payload?.published_at || "").trim(),
      latestName: String(payload?.name || "").trim()
    };
  }

  async function fetchLatestByReleasePage() {
    const latestPageHtml = await fetchTextWithFallback(REPO_RELEASE_LATEST_PAGE_URL);
    let parsed = extractLatestReleaseFromHtml(latestPageHtml);
    if (!parsed) {
      const releasesHtml = await fetchTextWithFallback(REPO_RELEASE_PAGE_URL);
      parsed = extractLatestReleaseFromHtml(releasesHtml);
    }
    if (!parsed) {
      throw new Error("release page: 未解析到最新 Release");
    }
    return {
      source: "release-page",
      latestTag: parsed.latestTag,
      latestVersion: parsed.latestVersion,
      latestUrl: `${REPO_RELEASE_PAGE_URL}/tag/${encodeURIComponent(parsed.latestTag)}`,
      latestPublishedAt: parsed.latestPublishedAt,
      latestName: parsed.latestName
    };
  }

  async function fetchLatestByTagsPage() {
    const html = await fetchTextWithFallback(GITHUB_TAGS_PAGE_URL);
    const latestTag = extractTagFromTagsHtml(html);
    if (!latestTag) {
      throw new Error("tags page: 未解析到版本 tag");
    }
    const latestVersion = normalizeVersion(latestTag);
    if (!latestVersion) {
      throw new Error(`tags page: tag 格式不支持（${latestTag}）`);
    }
    return {
      source: "tag-page",
      latestTag,
      latestVersion,
      latestUrl: `${REPO_RELEASE_PAGE_URL}/tag/${encodeURIComponent(latestTag)}`,
      latestPublishedAt: "",
      latestName: ""
    };
  }

  async function fetchLatestByRawManifest() {
    const payload = await fetchJson(REPO_MANIFEST_RAW_URL);
    const rawVersion = String(payload?.version || "").trim();
    const latestVersion = normalizeVersion(rawVersion);
    if (!latestVersion) {
      throw new Error(`raw manifest: version 格式不支持（${rawVersion || "empty"}）`);
    }
    const latestTag = `v${latestVersion}`;
    return {
      source: "manifest",
      latestTag,
      latestVersion,
      latestUrl: `${REPO_RELEASE_PAGE_URL}/tag/${encodeURIComponent(latestTag)}`,
      latestPublishedAt: "",
      latestName: "main 分支 manifest"
    };
  }

  async function fetchLatestByTagsApi() {
    const payload = await fetchJson(GITHUB_TAGS_API);
    const first = Array.isArray(payload) ? payload[0] : null;
    const latestTag = String(first?.name || "").trim();
    if (!latestTag) {
      throw new Error("tags api: 无可用 tag");
    }
    const latestVersion = normalizeVersion(latestTag);
    if (!latestVersion) {
      throw new Error(`tags api: tag 格式不支持（${latestTag}）`);
    }
    return {
      source: "tag-api",
      latestTag,
      latestVersion,
      latestUrl: `${REPO_RELEASE_PAGE_URL}/tag/${encodeURIComponent(latestTag)}`,
      latestPublishedAt: "",
      latestName: ""
    };
  }

  async function resolveLatestVersionPayload() {
    const errors = [];
    const resolvers = [
      fetchLatestByReleaseApi,
      fetchLatestByReleasePage,
      fetchLatestByTagsPage,
      fetchLatestByRawManifest,
      fetchLatestByTagsApi
    ];
    for (const resolver of resolvers) {
      try {
        const resolved = await resolver();
        if (resolved?.latestVersion) {
          return resolved;
        }
      } catch (error) {
        errors.push(String(error?.message || error || ""));
      }
    }
    throw new Error(composeUpdateFetchError(errors));
  }

  function evaluateUpdateResult(localVersionRaw, latestVersion) {
    const cmp = compareSemver(latestVersion, localVersionRaw);
    if (cmp === null) {
      return "incomparable";
    }
    return cmp > 0 ? "updateAvailable" : "upToDate";
  }

  function buildUpdateResultFromSnapshot(snapshot, localVersionRaw) {
    let status = "failed";
    if (snapshot.latestVersion) {
      status = evaluateUpdateResult(localVersionRaw, snapshot.latestVersion);
    } else if (snapshot.lastResult === "incomparable" || snapshot.lastStatus === "incomparable") {
      status = "incomparable";
    } else if (snapshot.lastResult === "upToDate" || snapshot.lastResult === "updateAvailable") {
      status = snapshot.lastResult;
    } else if (snapshot.lastStatus === "success") {
      status = "upToDate";
    }
    return {
      status,
      localVersion: normalizeVersion(localVersionRaw),
      latestVersion: snapshot.latestVersion,
      latestTag: snapshot.latestTag,
      latestSource: snapshot.latestSource,
      latestUrl: snapshot.latestUrl || (snapshot.latestTag ? `${REPO_RELEASE_PAGE_URL}/tag/${encodeURIComponent(snapshot.latestTag)}` : REPO_RELEASE_PAGE_URL),
      latestPublishedAt: snapshot.latestPublishedAt,
      latestName: snapshot.latestName,
      error: snapshot.lastError || ""
    };
  }

  function maybeOpenUpdateModal(result) {
    if (!result || result.status !== "updateAvailable") {
      return false;
    }
    const latestVersion = normalizeVersion(result.latestVersion || result.latestTag);
    if (!latestVersion) {
      return false;
    }
    if (dismissedUpdateVersionsInSession.has(latestVersion)) {
      return false;
    }
    if (state.ui.updateModalOpen && normalizeVersion(state.ui.updateModalPayload?.latestVersion || state.ui.updateModalPayload?.latestTag) === latestVersion) {
      return false;
    }
    state.ui.updateModalOpen = true;
    state.ui.updateModalPayload = normalizeUpdateModalPayload({
      mode: "updateAvailable",
      latestVersion,
      latestTag: result.latestTag || latestVersion,
      latestUrl: result.latestUrl || REPO_RELEASE_PAGE_URL,
      latestPublishedAt: result.latestPublishedAt || "",
      latestName: result.latestName || "",
      checkedAt: new Date().toISOString()
    });
    state.personalData.updateCheck.lastShownVersion = latestVersion;
    return true;
  }

  function openUpToDateModal(result) {
    const localVersion = normalizeVersion(result?.localVersion || getExtensionVersionSafe());
    state.ui.updateModalOpen = true;
    state.ui.updateModalPayload = normalizeUpdateModalPayload({
      mode: "upToDate",
      localVersion,
      latestVersion: normalizeVersion(result?.latestVersion || "") || localVersion,
      latestTag: String(result?.latestTag || "").trim(),
      latestUrl: result?.latestUrl || REPO_RELEASE_PAGE_URL,
      latestPublishedAt: String(result?.latestPublishedAt || "").trim(),
      latestName: String(result?.latestName || "").trim(),
      checkedAt: new Date().toISOString()
    });
  }

  function dismissUpdateModal() {
    const payload = normalizeUpdateModalPayload(state.ui.updateModalPayload);
    const version = normalizeVersion(payload?.latestVersion || payload?.latestTag);
    if (payload?.mode === "updateAvailable" && version) {
      dismissedUpdateVersionsInSession.add(version);
    }
    state.ui.updateModalOpen = false;
    state.ui.updateModalPayload = null;
    state.personalData.updateCheck.lastDismissedAt = new Date().toISOString();
  }

  function openReleasePage(url) {
    const target = String(url || REPO_RELEASE_PAGE_URL).trim() || REPO_RELEASE_PAGE_URL;
    try {
      window.open(target, "_blank", "noopener,noreferrer");
    } catch (error) {
      window.location.href = target;
    }
  }

  async function checkLatestRelease(options) {
    const force = Boolean(options?.force);
    const allowModal = options?.allowModal !== false;

    if (updateCheckPromise) {
      return updateCheckPromise;
    }

    updateCheckPromise = (async () => {
      const snapshot = normalizeUpdateCheckState(state.personalData.updateCheck);
      const localVersionRaw = state.ui.runtimeInvalidated ? "unknown" : getExtensionVersionSafe();
      if (shouldUseCachedUpdateCheck(force, snapshot)) {
        const cachedResult = buildUpdateResultFromSnapshot(snapshot, localVersionRaw);
        if (allowModal) {
          maybeOpenUpdateModal(cachedResult);
        }
        return cachedResult;
      }

      const checkedAt = new Date().toISOString();
      try {
        const latestPayload = await resolveLatestVersionPayload();
        const latestTag = latestPayload.latestTag;
        const latestVersion = latestPayload.latestVersion;
        const latestUrl = latestPayload.latestUrl;
        const latestPublishedAt = latestPayload.latestPublishedAt;
        const latestName = latestPayload.latestName;
        const latestSource = latestPayload.source;
        const status = evaluateUpdateResult(localVersionRaw, latestVersion);

        state.personalData.updateCheck = normalizeUpdateCheckState({
          ...snapshot,
          lastCheckedAt: checkedAt,
          lastStatus: status === "incomparable" ? "incomparable" : "success",
          lastError: "",
          latestVersion,
          latestTag,
          latestSource,
          latestUrl,
          latestPublishedAt,
          latestName,
          lastResult: status
        });

        const result = {
          status,
          localVersion: normalizeVersion(localVersionRaw),
          latestVersion,
          latestTag,
          latestSource,
          latestUrl,
          latestPublishedAt,
          latestName,
          error: ""
        };
        if (allowModal) {
          maybeOpenUpdateModal(result);
        }
        return result;
      } catch (error) {
        const message = simplifyUpdateCheckError(error);
        state.personalData.updateCheck = normalizeUpdateCheckState({
          ...snapshot,
          lastCheckedAt: checkedAt,
          lastStatus: "failed",
          lastError: message,
          lastResult: "failed"
        });
        return {
          status: "failed",
          localVersion: normalizeVersion(localVersionRaw),
          latestVersion: snapshot.latestVersion,
          latestTag: snapshot.latestTag,
          latestSource: snapshot.latestSource,
          latestUrl: snapshot.latestUrl || REPO_RELEASE_PAGE_URL,
          latestPublishedAt: snapshot.latestPublishedAt,
          latestName: snapshot.latestName,
          error: message
        };
      }
    })();

    try {
      return await updateCheckPromise;
    } finally {
      updateCheckPromise = null;
    }
  }

  async function maybeAutoCheckLatestRelease() {
    const beforeOpen = state.ui.updateModalOpen;
    const result = await checkLatestRelease({ force: false, trigger: "auto", allowModal: true });
    const needRender = (!beforeOpen && state.ui.updateModalOpen) || state.ui.tab === "settings";
    if (needRender) {
      render();
    }
    await persistState();
  }

  function injectUI() {
    const fab = document.createElement("button");
    fab.id = "gm-helper-fab";
    fab.type = "button";
    fab.setAttribute("aria-label", "打开 GM 助手");
    fab.setAttribute("title", "GM 助手");

    const fabIcon = document.createElement("img");
    fabIcon.className = "gm-helper-fab-icon";
    fabIcon.alt = "GM";
    fabIcon.src = getRuntimeUrlSafe(FAB_ICON_PATH);
    fabIcon.draggable = false;
    fabIcon.addEventListener("dragstart", (event) => event.preventDefault());
    fabIcon.addEventListener("error", () => {
      fab.textContent = "GM";
    });
    fab.addEventListener("dragstart", (event) => event.preventDefault());
    fab.appendChild(fabIcon);

    const sidebar = document.createElement("aside");
    sidebar.id = "gm-helper-sidebar";

    document.documentElement.appendChild(fab);
    document.documentElement.appendChild(sidebar);

    applyFabPosition(fab);
    applySidebarWidth(sidebar);
    applySidebarTheme(sidebar);
    bindFabDragging(fab);
    bindSidebarResizing(sidebar);

    fab.addEventListener("click", () => {
      if (fabDragState?.didDrag) {
        fabDragState.didDrag = false;
        return;
      }
      const willOpen = !sidebar.classList.contains("gm-helper-open");
      sidebar.classList.toggle("gm-helper-open");
      if (willOpen) {
        state.ui.tab = "library";
        state.ui.libraryView = "list";
        void maybeAutoCheckLatestRelease();
      }
      clearStatus();
      render();
    });

    sidebar.addEventListener("click", onClick);
    sidebar.addEventListener("input", onInput);
    sidebar.addEventListener("change", onChange);
    sidebar.addEventListener("keydown", onKeydown);
    sidebar.addEventListener("compositionstart", onCompositionStart);
    sidebar.addEventListener("compositionend", onCompositionEnd);
  }

  function bindFabDragging(fab) {
    fab.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }

      const rect = fab.getBoundingClientRect();
      fabDragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        didDrag: false
      };

      fab.setPointerCapture(event.pointerId);
      fab.classList.add("gm-helper-fab-dragging");
    });

    fab.addEventListener("pointermove", (event) => {
      if (!fabDragState || fabDragState.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = Math.abs(event.clientX - fabDragState.startX);
      const deltaY = Math.abs(event.clientY - fabDragState.startY);
      if (!fabDragState.didDrag && deltaX + deltaY < 4) {
        return;
      }

      fabDragState.didDrag = true;
      state.ui.fabPosition = clampFabPosition(
        event.clientX - fabDragState.offsetX,
        event.clientY - fabDragState.offsetY,
        fab.offsetWidth || 54,
        fab.offsetHeight || 54
      );
      applyFabPosition(fab);
    });

    fab.addEventListener("pointerup", async (event) => {
      await finishFabDrag(fab, event.pointerId);
    });

    fab.addEventListener("pointercancel", async (event) => {
      await finishFabDrag(fab, event.pointerId);
    });
  }

  async function finishFabDrag(fab, pointerId) {
    if (!fabDragState || fabDragState.pointerId !== pointerId) {
      return;
    }

    if (fab.hasPointerCapture(pointerId)) {
      fab.releasePointerCapture(pointerId);
    }

    fab.classList.remove("gm-helper-fab-dragging");
    const didDrag = fabDragState.didDrag;
    fabDragState = { didDrag };

    if (didDrag) {
      await persistState();
      window.setTimeout(() => {
        if (fabDragState) {
          fabDragState.didDrag = false;
        }
      }, 0);
    }
  }

  function applyFabPosition(fab) {
    const position = normalizedFabPosition();
    fab.style.left = `${position.left}px`;
    fab.style.top = `${position.top}px`;
    fab.style.right = "auto";
  }

  function normalizeSidebarWidth(rawWidth) {
    return clampSidebarWidth(Number(rawWidth) || SIDEBAR_DEFAULT_WIDTH);
  }

  function clampSidebarWidth(rawWidth) {
    const maxByViewport = Math.max(280, window.innerWidth - 16);
    const maxWidth = Math.min(SIDEBAR_MAX_WIDTH, maxByViewport);
    const minWidth = Math.min(SIDEBAR_MIN_WIDTH, maxWidth);
    const width = Number(rawWidth);
    if (!Number.isFinite(width) || width <= 0) {
      return minWidth;
    }
    return Math.min(Math.max(Math.round(width), minWidth), maxWidth);
  }

  function applySidebarWidth(sidebar) {
    if (!sidebar) {
      return;
    }
    if (window.matchMedia("(max-width: 720px)").matches) {
      sidebar.style.width = "";
      return;
    }
    const width = normalizeSidebarWidth(state.ui.sidebarWidth);
    state.ui.sidebarWidth = width;
    sidebar.style.width = `${width}px`;
  }

  function bindSidebarResizing(sidebar) {
    sidebar.addEventListener("pointerdown", (event) => {
      const handle = event.target.closest("[data-role='sidebar-resize-handle']");
      if (!handle || event.button !== 0) {
        return;
      }
      if (window.matchMedia("(max-width: 720px)").matches) {
        return;
      }
      const rectWidth = sidebar.getBoundingClientRect().width;
      sidebarResizeState = {
        pointerId: event.pointerId,
        handle,
        startX: event.clientX,
        startWidth: Number.isFinite(rectWidth) && rectWidth > 0 ? rectWidth : normalizeSidebarWidth(state.ui.sidebarWidth),
        didResize: false
      };
      handle.setPointerCapture(event.pointerId);
      document.documentElement.classList.add("gm-helper-sidebar-resizing");
      event.preventDefault();
    });

    sidebar.addEventListener("pointermove", (event) => {
      if (!sidebarResizeState || sidebarResizeState.pointerId !== event.pointerId) {
        return;
      }
      const deltaX = sidebarResizeState.startX - event.clientX;
      if (!sidebarResizeState.didResize && Math.abs(deltaX) < 2) {
        return;
      }
      sidebarResizeState.didResize = true;
      const width = clampSidebarWidth(sidebarResizeState.startWidth + deltaX);
      state.ui.sidebarWidth = width;
      sidebar.style.width = `${width}px`;
    });

    sidebar.addEventListener("pointerup", async (event) => {
      await finishSidebarResize(event.pointerId);
    });
    sidebar.addEventListener("pointercancel", async (event) => {
      await finishSidebarResize(event.pointerId);
    });
  }

  async function finishSidebarResize(pointerId) {
    if (!sidebarResizeState || sidebarResizeState.pointerId !== pointerId) {
      return;
    }
    if (sidebarResizeState.handle?.hasPointerCapture(pointerId)) {
      sidebarResizeState.handle.releasePointerCapture(pointerId);
    }
    document.documentElement.classList.remove("gm-helper-sidebar-resizing");
    const didResize = sidebarResizeState.didResize;
    sidebarResizeState = null;
    if (didResize) {
      await persistState();
    }
  }

  function normalizedFabPosition() {
    const position = state.ui.fabPosition || {
      left: Math.max(window.innerWidth - 72, 12),
      top: 148
    };
    return clampFabPosition(position.left, position.top, 54, 54);
  }

  function clampFabPosition(left, top, width, height) {
    const padding = 12;
    const maxLeft = Math.max(padding, window.innerWidth - width - padding);
    const maxTop = Math.max(padding, window.innerHeight - height - padding);
    return {
      left: Math.min(Math.max(Number(left) || padding, padding), maxLeft),
      top: Math.min(Math.max(Number(top) || padding, padding), maxTop)
    };
  }

  function onCompositionStart(event) {
    if (event.target?.dataset?.field === "searchQuery") {
      isSearchComposing = true;
      event.target.dataset.composing = "1";
      return;
    }
    if (event.target?.dataset?.field === "pickerQuery") {
      event.target.dataset.composing = "1";
      pickerComposingKey = buildPickerComposeKey(event.target.dataset.commandId, event.target.dataset.key);
    }
  }

  async function onCompositionEnd(event) {
    const field = event.target?.dataset?.field;
    if (field === "searchQuery") {
      isSearchComposing = false;
      delete event.target.dataset.composing;
      state.ui.searchQuery = event.target.value;
      clearSuggestionSelection();
      clearItemActionMenu();
      clearStatus();
      render();
      focusSearchInput(event.target.value);
      await persistState();
      return;
    }
    if (field === "pickerQuery") {
      pickerComposingKey = "";
      delete event.target.dataset.composing;
      const ws = ensureWorkspace(event.target.dataset.commandId);
      ws.pickerQueries[event.target.dataset.key] = event.target.value;
      ws.pickerCursor[event.target.dataset.key] = 0;
      clearStatus();
      render();
      focusPickerInput(event.target.dataset.commandId, event.target.dataset.key, event.target.value);
      await persistState();
    }
  }

  function bindFocusTracking() {
    document.addEventListener("focusin", (event) => {
      const target = event.target;
      if (!isHelperNode(target) && isWritable(target) && isVisible(target)) {
        lastExternalWritableTarget = target;
        if (isLikelyCommandInput(target)) {
          lastCommandInputTarget = target;
        }
      }
    }, true);
  }

  function bindWindowResize() {
    window.addEventListener("resize", () => {
      const fab = document.getElementById("gm-helper-fab");
      if (fab) {
        state.ui.fabPosition = normalizedFabPosition();
        applyFabPosition(fab);
      }

      const sidebar = document.getElementById("gm-helper-sidebar");
      if (sidebar) {
        applySidebarWidth(sidebar);
      }
    });
  }

  function buildRuntimeEventContext() {
    return {
      state,
      services: runtimeServices,
      commandMap: COMMAND_MAP,
      confirm: (message) => window.confirm(message),
      clearItemActionMenu,
      clearSuggestionSelection,
      normalizeSuggestionSelection,
      getSelectedSuggestionItemIds,
      setItemActionMenu,
      resetWorkspaceForSuggestion,
      applyItemSuggestionToCommand,
      openWorkspace,
      saveCustomTemplateDraft,
      toggleCustomQuickTemplate,
      deleteCustomTemplate,
      applyCustomTemplate,
      clearExternalCatalogSlot,
      openUpToDateModal,
      openReleasePage,
      dismissUpdateModal,
      toggleFavorite,
      toggleSection,
      pushUid,
      ensureWorkspace,
      clearStatus,
      setStatus,
      setTheme,
      getThemeMeta,
      render,
      persistState,
      focusImportEntry,
      focusCustomTemplateEntry,
      inferUid,
      touchCommand,
      copyOutput,
      writeOutput,
      savePreset,
      loadPreset,
      deletePreset,
      sendToBackendInput,
      togglePickerOption,
      clearPickerSelections,
      selectAllPickerOptions,
      invertPickerOptions,
      getMultiValues,
      getMailTemplateRows,
      setMailTemplateRows,
      resolveMailItemName,
      getParam,
      getItemPickerFilterState,
      importCatalogData,
      bindExternalCatalogFile,
      focusSearchInput,
      focusPickerInput,
      buildPickerComposeKey,
      getPickerComposingKey: () => pickerComposingKey,
      isSearchComposing: () => isSearchComposing
    };
  }

  async function onClick(event) {
    const node = event.target.closest("[data-action]");
    if (!node) {
      return;
    }
    const action = String(node.dataset.action || "");
    const commandId = node.dataset.commandId || state.ui.selectedCommandId;
    const command = COMMAND_MAP.get(commandId);
    const handler = runtimeEventMaps?.clickActionMap?.[action];
    if (!handler) {
      return;
    }
    await handler(buildRuntimeEventContext(), { event, node, action, commandId, command });
  }

  async function onInput(event) {
    const target = event.target;
    const field = target.dataset.field;
    if (!field) {
      return;
    }
    const handler = runtimeEventMaps?.inputFieldMap?.[field];
    if (!handler) {
      return;
    }
    await handler(buildRuntimeEventContext(), { event, target, field });
  }

  async function onChange(event) {
    const target = event.target;
    const field = target.dataset.field;
    if (!field) {
      return;
    }
    const handler = runtimeEventMaps?.changeFieldMap?.[field];
    if (!handler) {
      return;
    }
    await handler(buildRuntimeEventContext(), { event, target, field });
  }

  async function onKeydown(event) {
    if (event.isComposing) {
      return;
    }
    const target = event.target;
    if (target?.dataset?.field !== "pickerQuery") {
      return;
    }

    const commandId = target.dataset.commandId;
    const key = target.dataset.key;
    const command = COMMAND_MAP.get(commandId);
    if (!command) {
      return;
    }
    const ws = ensureWorkspace(commandId);
    const param = getParam(command, key);
    if (!param) {
      return;
    }

    const mode = param.inputMode || param.type;
    const selected = mode === "picker_multi" || mode === "enum_multi" || mode === "picker_mail_item_list"
      ? getMultiValues(ws, key)
      : (ws.values[key] ? [ws.values[key]] : []);
    const options = getPickerOptions(param, ws.pickerQueries[key] || "", selected, ws);
    if (!options.length) {
      return;
    }

    const max = options.length - 1;
    const current = Number(ws.pickerCursor[key] || 0);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      ws.pickerCursor[key] = Math.min(current + 1, max);
      render();
      focusPickerInput(commandId, key, ws.pickerQueries[key] || "");
      await persistState();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      ws.pickerCursor[key] = Math.max(current - 1, 0);
      render();
      focusPickerInput(commandId, key, ws.pickerQueries[key] || "");
      await persistState();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const focused = options[Math.max(0, Math.min(current, max))];
      if (!focused) {
        return;
      }
      togglePickerOption(command, key, focused.value);
      render();
      focusPickerInput(commandId, key, ws.pickerQueries[key] || "");
      await persistState();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      ws.pickerQueries[key] = "";
      ws.pickerCursor[key] = 0;
      render();
      focusPickerInput(commandId, key, "");
      await persistState();
    }
  }

  function openWorkspace(commandId) {
    if (!COMMAND_MAP.has(commandId)) {
      return;
    }
    clearItemActionMenu();
    state.ui.tab = "library";
    state.ui.libraryView = "workspace";
    state.ui.selectedCommandId = commandId;
    state.userContext.lastCommandId = commandId;
    touchCommand(commandId);
    clearStatus();
    render();
  }

  function touchCommand(commandId) {
    state.userContext.lastCommandId = commandId;
    state.personalData.recentCommands = [commandId, ...state.personalData.recentCommands.filter((x) => x !== commandId)].slice(0, 8);
  }

  function toggleFavorite(commandId) {
    const favorites = new Set(state.personalData.favorites);
    if (favorites.has(commandId)) {
      favorites.delete(commandId);
    } else {
      favorites.add(commandId);
    }
    state.personalData.favorites = Array.from(favorites);
  }

  function pushUid(uid) {
    const value = String(uid || "").trim();
    if (!value) {
      return;
    }
    state.userContext.recentUids = [value, ...state.userContext.recentUids.filter((x) => x !== value)].slice(0, 6);
  }

  async function importCatalogData(file) {
    if (!file) {
      return;
    }

    try {
      const name = String(file.name || "");
      const lowerName = name.toLowerCase();
      let payload = null;

      if (lowerName.endsWith(".json")) {
        const text = await readFileAsText(file);
        if (!MODULES.parseCatalogJsonToGroups) {
          throw new Error("缺少 JSON 导入器模块");
        }
        payload = MODULES.parseCatalogJsonToGroups(text, name);
      } else if (lowerName.endsWith(".xlsx")) {
        const buffer = await readFileAsArrayBuffer(file);
        if (!MODULES.parseCatalogXlsxToGroups) {
          throw new Error("缺少 XLSX 导入器模块");
        }
        payload = MODULES.parseCatalogXlsxToGroups(buffer, name);
      } else {
        throw new Error("只支持 .xlsx 或 .json 文件");
      }

      state.personalData.importedCatalogs = normalizeImportedCatalogs(payload.groups);
      await runtimeServices.catalogService.rebuild();
      setStatus(`导入成功：${payload.sourceMeta.fileName}（${payload.stats.entryCount} 条）`, "success");
      render();
      await persistState();
    } catch (error) {
      setStatus(`导入失败：${error.message}`, "error");
      render();
    }
  }

  function normalizeExternalCatalogSlot(slot) {
    return slot === "email" ? "email" : slot === "item" ? "item" : slot === "tasks" ? "tasks" : "";
  }

  function externalCatalogSlotLabel(slot) {
    return slot === "email" ? "Email.xlsx" : slot === "item" ? "Item.xlsx" : slot === "tasks" ? "Task.xlsx" : "外部词典";
  }

  function createExternalCatalogSnapshot(slot, groups) {
    const snapshot = createEmptyCatalogGroups();
    const normalized = normalizeImportedCatalogs(groups);
    if (slot === "item") {
      snapshot.items = normalized.items;
    }
    if (slot === "email") {
      snapshot.mail = normalized.mail;
    }
    if (slot === "tasks") {
      snapshot.tasks = normalized.tasks;
    }
    return snapshot;
  }

  function countCatalogEntries(groups) {
    const normalized = normalizeImportedCatalogs(groups);
    return Object.values(normalized).reduce((sum, list) => sum + list.length, 0);
  }

  function resolveExternalSourceHint(file, sourceHint, prevBinding) {
    const relativePath = String(file?.webkitRelativePath || "").trim();
    if (relativePath) {
      return relativePath;
    }
    const rawHint = String(sourceHint || "").trim();
    if (rawHint && !rawHint.toLowerCase().includes("fakepath")) {
      return rawHint;
    }
    return String(prevBinding?.sourceHint || "").trim() || "本地文件选择";
  }

  function buildExternalCatalogBinding(slot, fileName, sourceHint, entryCount, prevBinding) {
    return {
      slot,
      fileName: String(fileName || "").trim(),
      sourceHint: String(sourceHint || "").trim() || String(prevBinding?.sourceHint || "").trim() || "本地文件选择",
      lastImportedAt: new Date().toISOString(),
      lastStatus: "success",
      entryCount: Math.max(0, Number(entryCount) || 0),
      lastError: ""
    };
  }

  function buildFailedExternalCatalogBinding(slot, file, sourceHint, prevBinding, error) {
    const fileName = String(file?.name || prevBinding?.fileName || "").trim();
    if (!fileName) {
      return prevBinding || null;
    }
    return {
      slot,
      fileName,
      sourceHint: String(sourceHint || "").trim() || String(prevBinding?.sourceHint || "").trim(),
      lastImportedAt: String(prevBinding?.lastImportedAt || "").trim(),
      lastStatus: "error",
      entryCount: Math.max(0, Number(prevBinding?.entryCount) || 0),
      lastError: String(error?.message || error || "").trim()
    };
  }

  async function bindExternalCatalogFile(slot, file, sourceHint) {
    const normalizedSlot = normalizeExternalCatalogSlot(slot);
    if (!normalizedSlot || !file) {
      return;
    }

    const prevBinding = state.personalData.externalCatalogBindings?.[normalizedSlot] || null;
    try {
      const name = String(file.name || "").trim();
      const lowerName = name.toLowerCase();
      if (!lowerName.endsWith(".xlsx")) {
        throw new Error("外部数据源暂只支持 .xlsx 文件");
      }
      const buffer = await readFileAsArrayBuffer(file);
      if (!MODULES.parseCatalogXlsxToGroups) {
        throw new Error("缺少 XLSX 导入器模块");
      }
      const payload = MODULES.parseCatalogXlsxToGroups(buffer, name);
      const snapshot = createExternalCatalogSnapshot(normalizedSlot, payload.groups);
      const entryCount = countCatalogEntries(snapshot);
      if (!entryCount) {
        throw new Error(`未在该文件中识别到 ${externalCatalogSlotLabel(normalizedSlot)} 所需数据`);
      }
      state.personalData.externalCatalogSnapshots[normalizedSlot] = snapshot;
      state.personalData.externalCatalogBindings[normalizedSlot] = buildExternalCatalogBinding(
        normalizedSlot,
        name,
        resolveExternalSourceHint(file, sourceHint, prevBinding),
        entryCount,
        prevBinding
      );
      await runtimeServices.catalogService.rebuild();
      setStatus(`外部词典已刷新：${externalCatalogSlotLabel(normalizedSlot)}（${entryCount} 条）`, "success");
      render();
      await persistState();
    } catch (error) {
      state.personalData.externalCatalogBindings[normalizedSlot] = buildFailedExternalCatalogBinding(
        normalizedSlot,
        file,
        resolveExternalSourceHint(file, sourceHint, prevBinding),
        prevBinding,
        error
      );
      await runtimeServices.catalogService.rebuild();
      setStatus(`外部词典刷新失败：${error.message}`, "error");
      render();
      await persistState();
    }
  }

  async function clearExternalCatalogSlot(slot) {
    const normalizedSlot = normalizeExternalCatalogSlot(slot);
    if (!normalizedSlot) {
      return;
    }
    state.personalData.externalCatalogBindings[normalizedSlot] = null;
    state.personalData.externalCatalogSnapshots[normalizedSlot] = createEmptyCatalogGroups();
    await runtimeServices.catalogService.rebuild();
    setStatus(`已解除 ${externalCatalogSlotLabel(normalizedSlot)} 绑定`, "success");
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsText(file, "utf-8");
    });
  }

  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.onload = () => resolve(reader.result);
      reader.readAsArrayBuffer(file);
    });
  }

  async function copyOutput(command) {
    const output = ensureOutput(command);
    if (!output) {
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      setStatus(`已复制 ${lineCount(output)} 条命令到剪贴板`, "success");
    } catch (error) {
      setStatus(`复制失败：${error.message}`, "error");
    }
    render();
  }

  async function writeOutput(command, appendMode) {
    const output = ensureOutput(command);
    if (!output) {
      return;
    }
    if (!await confirmRisk(command)) {
      setStatus("已取消执行", "error");
      render();
      return;
    }
    const ok = appendMode
      ? runtimeServices.targetWriter.append(output)
      : runtimeServices.targetWriter.fill(output);
    if (ok) {
      touchCommand(command.id);
      setStatus(appendMode ? "已追加到后台输入框" : "已填入后台输入框", "success");
    } else {
      setStatus("未找到可写入的后台输入框，请先点击 GM 后台的输入框", "error");
    }
    render();
  }

  async function sendToBackendInput(query) {
    if (!query) {
      setStatus("请先输入搜索关键字", "error");
      render();
      return;
    }
    const ok = runtimeServices.targetWriter.fill(query);
    setStatus(ok ? `已把“${query}”填入后台输入框，可直接使用后台联想` : "未找到后台输入框，请先点击后台搜索/命令输入框", ok ? "success" : "error");
    render();
  }

  async function confirmRisk(command) {
    if (!command || command.risk === "normal" || state.personalData.confirmedRiskCommands.includes(command.id)) {
      return true;
    }
    const ok = window.confirm(`命令“${command.title}”属于${riskLabel(command.risk)}操作，首次填入前请确认。\n\n是否继续？`);
    if (ok) {
      state.personalData.confirmedRiskCommands = uniqCommandIds([command.id, ...state.personalData.confirmedRiskCommands]);
    }
    return ok;
  }

  function savePreset(command) {
    const ws = ensureWorkspace(command.id);
    const name = String(ws.presetDraftName || "").trim();
    if (!name) {
      setStatus("请先输入预设名称", "error");
      return;
    }
    const id = `${command.id}:${name}`;
    state.personalData.presets = [{ id, name, commandId: command.id, batchMode: ws.batchMode, values: { ...ws.values } }, ...state.personalData.presets.filter((x) => x.id !== id)];
    ws.selectedPresetId = id;
    ws.presetDraftName = "";
    setStatus(`已保存预设：${name}`, "success");
  }

  function loadPreset(command) {
    const ws = ensureWorkspace(command.id);
    const preset = getPresets(command.id).find((x) => x.id === ws.selectedPresetId);
    if (!preset) {
      setStatus("请先选择一个预设", "error");
      return;
    }
    const fresh = createWorkspace(command.id);
    ws.values = { ...fresh.values, ...preset.values };
    ws.batchMode = preset.batchMode || ws.batchMode;
    ws.output = "";
    ws.multiValues = {};
    ws.pickerQueries = {};
    ws.pickerCursor = {};
    ws.pickerFilters = {};
    syncWorkspacePickerFilters(command, ws);
    syncWorkspaceMultiValues(command, ws);
    setStatus(`已加载预设：${preset.name}`, "success");
  }

  function deletePreset(command) {
    const ws = ensureWorkspace(command.id);
    const preset = getPresets(command.id).find((x) => x.id === ws.selectedPresetId);
    if (!preset) {
      setStatus("请先选择要删除的预设", "error");
      return;
    }
    state.personalData.presets = state.personalData.presets.filter((x) => x.id !== preset.id);
    ws.selectedPresetId = "";
    setStatus(`已删除预设：${preset.name}`, "success");
  }

  function saveCustomTemplateDraft() {
    const draft = state.ui.customTemplateDraft || { name: "", content: "", replaceUid: true };
    const name = String(draft.name || "").trim();
    const content = String(draft.content || "").trim();
    if (!name) {
      setStatus("请先填写模板名称", "error");
      return;
    }
    if (!content) {
      setStatus("请先填写模板命令文本", "error");
      return;
    }

    const templates = getCustomTemplates();
    const existing = templates.find((item) => String(item.name || "").trim().toLowerCase() === name.toLowerCase());
    const now = Date.now();
    const template = existing
      ? { ...existing, name, content, replaceUid: draft.replaceUid !== false, updatedAt: now }
      : { id: `ct_${now}_${Math.random().toString(36).slice(2, 8)}`, name, content, replaceUid: draft.replaceUid !== false, updatedAt: now };
    state.personalData.customTemplates = [template, ...templates.filter((item) => item.id !== template.id)];
    state.ui.customTemplateDraft = { name: "", content: "", replaceUid: draft.replaceUid !== false };
    setStatus(existing ? `已更新自定义模板：${name}` : `已保存自定义模板：${name}`, "success");
  }

  function deleteCustomTemplate(templateId) {
    const templates = getCustomTemplates();
    const target = templates.find((item) => item.id === templateId);
    if (!target) {
      setStatus("模板不存在或已被删除", "error");
      return;
    }
    state.personalData.customTemplates = templates.filter((item) => item.id !== templateId);
    state.personalData.customQuickTemplateIds = normalizeCustomQuickTemplateIds(
      state.personalData.customQuickTemplateIds,
      state.personalData.customTemplates
    );
    setStatus(`已删除自定义模板：${target.name}`, "success");
  }

  function applyUidPlaceholders(text, uid) {
    const patterns = [
      /\{\{\s*(uid|uuid)\s*\}\}/gi,
      /\{\s*(uid|uuid)\s*\}/gi,
      /\$\{\s*(uid|uuid)\s*\}/gi,
      /\$(uid|uuid)\b/gi,
      /<\s*(uid|uuid)\s*>/gi,
      /\[\s*(uid|uuid)\s*\]/gi,
      /\b(uid|uuid)\b/gi,
      /(角色UID|用户ID|当前UID|当前UUID)/g
    ];
    let output = String(text || "");
    let replacedCount = 0;
    patterns.forEach((pattern) => {
      output = output.replace(pattern, () => {
        replacedCount += 1;
        return uid;
      });
    });
    return { output, replacedCount };
  }

  function buildCustomTemplateOutput(template) {
    if (!template) {
      return fail("模板不存在");
    }
    const content = String(template.content || "").trim();
    if (!content) {
      return fail("模板内容为空");
    }
    if (template.replaceUid === false) {
      return ok(content, lineCount(content));
    }
    const uid = String(state.userContext.currentUid || "").trim();
    if (!uid) {
      return fail("该模板启用了 UID 替换，请先填写顶部当前 UID");
    }
    const replaced = applyUidPlaceholders(content, uid);
    return ok(replaced.output, lineCount(replaced.output));
  }

  async function applyCustomTemplate(templateId, appendMode) {
    const template = getCustomTemplates().find((item) => item.id === templateId);
    if (!template) {
      setStatus("模板不存在或已被删除", "error");
      render();
      return;
    }
    const result = buildCustomTemplateOutput(template);
    if (!result.ok) {
      setStatus(result.message, "error");
      render();
      return;
    }
    const okWrite = appendMode
      ? runtimeServices.targetWriter.append(result.output)
      : runtimeServices.targetWriter.fill(result.output);
    if (okWrite) {
      setStatus(appendMode ? `已追加模板：${template.name}` : `已填入模板：${template.name}`, "success");
    } else {
      setStatus("未找到可写入的后台输入框，请先点击 GM 后台的输入框", "error");
    }
    render();
  }

  function ensureWorkspace(commandId) {
    if (!state.workspaces[commandId]) {
      state.workspaces[commandId] = createWorkspace(commandId);
    }
    const command = COMMAND_MAP.get(commandId);
    const ws = state.workspaces[commandId];
    const fresh = createWorkspace(commandId);
    ws.values = { ...fresh.values, ...(ws.values || {}) };
    ws.output = ws.output || "";
    ws.presetDraftName = ws.presetDraftName || "";
    ws.selectedPresetId = ws.selectedPresetId || "";
    ws.multiValues = ws.multiValues && typeof ws.multiValues === "object" ? ws.multiValues : {};
    ws.pickerQueries = ws.pickerQueries && typeof ws.pickerQueries === "object" ? ws.pickerQueries : {};
    ws.pickerCursor = ws.pickerCursor && typeof ws.pickerCursor === "object" ? ws.pickerCursor : {};
    ws.pickerFilters = ws.pickerFilters && typeof ws.pickerFilters === "object" ? ws.pickerFilters : {};
    ws.mailTemplateItems = ws.mailTemplateItems && typeof ws.mailTemplateItems === "object" ? ws.mailTemplateItems : {};
    ws.batchMode = ws.batchMode || fresh.batchMode;
    if (command.batchModes && !command.batchModes.some((mode) => mode.id === ws.batchMode)) {
      ws.batchMode = command.batchModes[0].id;
    }
    syncWorkspacePickerFilters(command, ws);
    syncWorkspaceMultiValues(command, ws);
    syncMailTemplateBuilderValues(command, ws);
    return ws;
  }

  function createWorkspace(commandId) {
    const command = COMMAND_MAP.get(commandId);
    const values = {};
    command.params.forEach((p) => {
      values[p.key] = String(p.defaultValue ?? "");
    });
    return { values, output: "", presetDraftName: "", selectedPresetId: "", multiValues: {}, pickerQueries: {}, pickerCursor: {}, pickerFilters: {}, mailTemplateItems: {}, batchMode: command.batchModes?.[0]?.id || "" };
  }

  function syncWorkspacePickerFilters(command, ws) {
    if (!command?.params?.length) {
      return;
    }
    command.params.forEach((param) => {
      if (!isItemPickerParam(param)) {
        return;
      }
      ws.pickerFilters[param.key] = normalizeItemPickerFilter(ws.pickerFilters[param.key], param);
    });
  }

  function syncWorkspaceMultiValues(command, ws) {
    if (!command?.params?.length) {
      return;
    }
    command.params.forEach((param) => {
      const mode = param.inputMode || param.type;
      if (mode !== "picker_multi" && mode !== "enum_multi") {
        return;
      }
      const byStore = Array.isArray(ws.multiValues?.[param.key]) ? ws.multiValues[param.key].map((x) => String(x || "").trim()).filter(Boolean) : [];
      const byRaw = String(ws.values[param.key] || "").split(/[\s,，;；]+/).map((x) => x.trim()).filter(Boolean);
      const merged = byStore.length ? byStore : byRaw;
      ws.multiValues[param.key] = sortValuesByOptionOrder(uniqStrings(merged), param, ws);
      ws.values[param.key] = ws.multiValues[param.key].join(",");
    });
  }

  function syncMailTemplateBuilderValues(command, ws) {
    if (!command?.params?.length) {
      return;
    }
    ws.mailTemplateItems = ws.mailTemplateItems && typeof ws.mailTemplateItems === "object" ? ws.mailTemplateItems : {};
    command.params.forEach((param) => {
      const mode = String(param.inputMode || param.type || "");
      if (mode !== "picker_mail_item_list") {
        return;
      }
      const key = String(param.key || "");
      const byStore = Array.isArray(ws.mailTemplateItems[key]) ? ws.mailTemplateItems[key] : [];
      const rows = byStore.length ? byStore : parseMailTemplateItemList(ws.values[key]);
      const normalized = normalizeMailTemplateItemRows(rows);
      ws.mailTemplateItems[key] = normalized;
      ws.values[key] = serializeMailTemplateItemRows(normalized);
      ws.multiValues[key] = uniqStrings((Array.isArray(ws.multiValues[key]) ? ws.multiValues[key] : []).map((x) => String(x || "").trim()).filter(Boolean));
    });
  }

  function render() {
    const sidebar = document.getElementById("gm-helper-sidebar");
    if (!sidebar) {
      return;
    }
    applySidebarTheme(sidebar);
    const bodyScrollState = captureBodyScrollState();
    const searchQuery = state.ui.searchQuery.trim();
    const isLibraryTab = state.ui.tab === "library";
    const command = COMMAND_MAP.get(state.ui.selectedCommandId);
    const ws = command ? ensureWorkspace(command.id) : null;
    const results = searchQuery ? searchCommands(searchQuery) : [];
    const suggestions = buildSearchSuggestions(searchQuery, { command, ws, isWorkspaceView: isLibraryTab && state.ui.libraryView === "workspace" });
    state.ui.searchSuggestions = suggestions;
    const isWorkspaceView = isLibraryTab && state.ui.libraryView === "workspace" && command && ws;
    const shouldShowSuggestionPanel = isLibraryTab && Boolean(searchQuery);
    const title = isWorkspaceView ? escapeHtml(command?.title || "命令工作台") : escapeHtml(getTabTitle(state.ui.tab));
    const libraryHtml = `${renderLibraryTop(command)}${shouldShowSuggestionPanel ? renderSearchSuggestionPanel(suggestions) : ""}${isWorkspaceView ? renderWorkspace(command, ws) : renderLibraryList(results, suggestions)}`;
    const updateModalHtml = renderUpdateModal();
    sidebar.innerHTML = `
      <div class="gm-helper-resize-handle" data-role="sidebar-resize-handle" title="拖拽调整宽度"></div>
      <div class="gm-helper-wrap">
        ${renderRail()}
        <div class="gm-helper-main">
          <div class="gm-helper-header">
            <div>
              <div class="gm-helper-title-row">
                ${isWorkspaceView ? '<button type="button" class="gm-helper-back" data-action="go-library-list">返回命令库</button>' : ""}
                <div class="gm-helper-title">${title}</div>
              </div>
            </div>
            <button type="button" class="gm-helper-close" data-action="close">×</button>
          </div>
          <div class="gm-helper-body">
            ${state.ui.tab === "settings"
                ? renderSettingsTab()
                : libraryHtml}
          </div>
          <div class="gm-helper-footer ${state.ui.status?.kind === "error" ? "gm-helper-footer-error" : ""}">${escapeHtml(state.ui.status?.message || "系统已就绪，请选择场景开始操作。")}</div>
        </div>
        ${updateModalHtml}
      </div>
    `;
    restoreBodyScrollState(bodyScrollState);
  }

  function getTabTitle(tabId) {
    const found = NAV_TABS.find((tab) => tab.id === tabId);
    return found ? found.title : "GM 助手";
  }

  function renderRail() {
    return `
      <nav class="gm-helper-rail" aria-label="GM 助手一级导航">
        ${NAV_TABS.map((tab) => `
          <button
            type="button"
            class="gm-helper-rail-btn ${state.ui.tab === tab.id ? "gm-helper-rail-btn-active" : ""}"
            data-action="switch-tab"
            data-tab="${tab.id}"
            title="${escapeHtml(tab.tooltip)}"
            aria-label="${escapeHtml(tab.title)}"
          >
            <span class="gm-helper-rail-icon">${tab.icon}</span>
          </button>
        `).join("")}
      </nav>
    `;
  }

  function focusSearchInput(value) {
    const input = document.getElementById("gm-helper-search");
    if (!input) {
      return;
    }
    input.focus();
    const pos = String(value || "").length;
    if (input.setSelectionRange) {
      input.setSelectionRange(pos, pos);
    }
  }

  function focusPickerInput(commandId, key, value) {
    const input = document.querySelector(`[data-field="pickerQuery"][data-command-id="${escapeForSelector(commandId)}"][data-key="${escapeForSelector(key)}"]`);
    if (!input) {
      return;
    }
    input.focus();
    const pos = String(value || "").length;
    if (input.setSelectionRange) {
      input.setSelectionRange(pos, pos);
    }
  }

  function focusImportEntry() {
    window.setTimeout(() => {
      const entry = document.getElementById("gm-helper-import-btn");
      if (!entry) {
        return;
      }
      if (entry.scrollIntoView) {
        entry.scrollIntoView({ block: "center" });
      }
      if (entry.focus) {
        entry.focus();
      }
    }, 0);
  }

  function focusCustomTemplateEntry() {
    window.setTimeout(() => {
      const input = document.getElementById("gm-helper-custom-name");
      if (!input) {
        return;
      }
      if (input.scrollIntoView) {
        input.scrollIntoView({ block: "center" });
      }
      if (input.focus) {
        input.focus();
      }
    }, 0);
  }

  function buildPickerComposeKey(commandId, key) {
    return `${String(commandId || "")}:${String(key || "")}`;
  }

  function applyItemSuggestionToCommand(commandId, itemId) {
    const command = COMMAND_MAP.get(commandId);
    if (!command) {
      return false;
    }
    const ws = ensureWorkspace(commandId);
    const compatibleMode = resolveSuggestionBatchMode(command);
    if (compatibleMode) {
      ws.batchMode = compatibleMode;
    }
    const targetParam = command.params.find((param) => String(param.optionSource || "") === "items" && shouldShowParam(param, ws.batchMode));
    if (!targetParam) {
      return false;
    }
    const values = uniqStrings((Array.isArray(itemId) ? itemId : [itemId]).map((value) => String(value || "").trim()).filter(Boolean));
    if (!values.length) {
      return false;
    }
    ws.output = "";
    const mode = targetParam.inputMode || targetParam.type;
    if (mode === "picker_multi" || mode === "enum_multi") {
      ws.multiValues[targetParam.key] = values;
      ws.values[targetParam.key] = values.join(",");
    } else {
      ws.values[targetParam.key] = values[0];
    }
    if (isItemPickerParam(targetParam)) {
      const picked = (catalogStore.itemOptions || []).find((item) => item.id === values[0]);
      const filter = getItemPickerFilterState(ws, targetParam);
      if (picked) {
        filter.scope = picked.scope || filter.scope || "";
        if (picked.isExtended) {
          filter.typeId = "__extended__";
          filter.subTypeId = `ext:${picked.typeId}`;
        } else {
          filter.typeId = picked.typeId || "";
          filter.subTypeId = picked.subTypeId || "";
        }
      }
      filter.crossScope = false;
      ws.pickerQueries[targetParam.key] = values.length > 1 ? "" : (picked?.name || values[0]);
      ws.pickerCursor[targetParam.key] = 0;
    }
    return true;
  }

  function resolveSuggestionBatchMode(command) {
    if (!command?.params?.length) {
      return "";
    }
    const visibleMatch = (modeId) => command.params.some((param) => String(param.optionSource || "") === "items" && shouldShowParam(param, modeId));
    if (command.batchModes?.length) {
      const matched = command.batchModes.find((mode) => visibleMatch(mode.id));
      return matched?.id || command.batchModes[0]?.id || "";
    }
    return visibleMatch("") ? "" : "";
  }

  function resetWorkspaceForSuggestion(commandId) {
    if (!COMMAND_MAP.has(commandId)) {
      return;
    }
    state.workspaces[commandId] = createWorkspace(commandId);
  }

  function getSelectedSuggestionItemIds(suggestions) {
    const availableIds = new Set((Array.isArray(suggestions?.items) ? suggestions.items : []).map((item) => String(item.itemId || "").trim()).filter(Boolean));
    const selected = normalizeSuggestionSelection(state.ui.suggestionSelection);
    const filtered = selected.filter((itemId) => availableIds.has(itemId));
    if (filtered.length !== selected.length) {
      state.ui.suggestionSelection = filtered;
    }
    return filtered;
  }

  function renderLibraryTop(command) {
    return runtimeViews?.renderLibraryTop
      ? runtimeViews.renderLibraryTop(command)
      : "";
  }

  function renderLibraryList(results, suggestions) {
    const customTemplates = getCustomTemplates();
    const hasItemSuggestion = Boolean((suggestions?.items || []).length);

    if (state.ui.searchQuery.trim()) {
      if (hasItemSuggestion && !results.length) {
        return "";
      }
      return `
        <section class="gm-helper-panel">
          <div class="gm-helper-section-head">
            <div>
              <div class="gm-helper-section-title">搜索结果</div>
              <div class="gm-helper-section-desc">${hasItemSuggestion ? "命中命令模板如下。" : "优先使用插件推荐链路；未命中时再考虑后台原生联想兜底。"}</div>
            </div>
          </div>
          ${results.length ? `<div class="gm-helper-card-grid">${results.map((x) => renderCard(x.command, x.meta)).join("")}</div>` : '<div class="gm-helper-empty">未命中高频模板，可将关键字提交至后台原生命令搜索。</div>'}
          ${hasItemSuggestion ? "" : `<div class="gm-helper-fallback"><button type="button" class="gm-helper-button gm-helper-button-accent" data-action="fill-backend-search">把“${escapeHtml(state.ui.searchQuery.trim())}”填入后台输入框</button><div class="gm-helper-inline-tip">可继续使用后台原生联想列表进行精确定位。</div></div>`}
        </section>
      `;
    }

    return `
      ${renderCollapsibleSection({
        id: "library-featured",
        title: "自定义命令",
        desc: "支持保存多行命令模板，可一键填入后台输入框并复用当前 UID。",
        defaultCollapsed: false,
        body: customTemplates.length
          ? `<div class="gm-helper-card-grid gm-helper-template-card-grid">${customTemplates.map((template) => renderCustomTemplateCard(template)).join("")}</div>`
          : `<div class="gm-helper-empty">暂无自定义快捷模板，可在设置页导入/粘贴命令文本并命名保存。</div><div class="gm-helper-button-row"><button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="goto-settings-custom">前往设置创建模板</button></div>`
      })}
      ${GROUPS.map((group) => renderCollapsibleSection({
        id: `group-${group.id}`,
        title: group.title,
        desc: group.description,
        defaultCollapsed: true,
        body: `<div class="gm-helper-card-grid">${COMMANDS.filter((command) => command.group === group.id).map((command) => renderCard(command)).join("")}</div>`
      })).join("")}
    `;
  }

  function renderSearchSuggestionPanel(suggestions) {
    return runtimeViews?.renderSearchSuggestionPanel
      ? runtimeViews.renderSearchSuggestionPanel(suggestions)
      : "";
  }

  function formatDateTimeLabel(value) {
    const text = String(value || "").trim();
    if (!text) {
      return "未刷新";
    }
    const date = new Date(text);
    if (Number.isNaN(date.getTime())) {
      return text;
    }
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getUpdateCheckState() {
    const updateCheck = normalizeUpdateCheckState(state.personalData.updateCheck);
    const localVersionRaw = state.ui.runtimeInvalidated ? "unknown" : getExtensionVersionSafe();
    const localVersion = normalizeVersion(localVersionRaw);
    let result = updateCheck.lastResult || "idle";
    if (updateCheck.latestVersion) {
      const cmp = compareSemver(updateCheck.latestVersion, localVersionRaw);
      if (cmp === null) {
        result = "incomparable";
      } else if (cmp > 0) {
        result = "updateAvailable";
      } else {
        result = "upToDate";
      }
    } else if (updateCheck.lastStatus === "failed") {
      result = "failed";
    } else if (updateCheck.lastStatus === "incomparable") {
      result = "incomparable";
    }
    return {
      ...updateCheck,
      localVersionRaw,
      localVersion,
      result,
      latestUrlResolved: updateCheck.latestUrl || (updateCheck.latestTag ? `${REPO_RELEASE_PAGE_URL}/tag/${encodeURIComponent(updateCheck.latestTag)}` : REPO_RELEASE_PAGE_URL)
    };
  }

  function getReleasePageUrlFromUpdateState() {
    return getUpdateCheckState().latestUrlResolved || REPO_RELEASE_PAGE_URL;
  }

  function updateResultLabel(result) {
    if (result === "updateAvailable") {
      return "发现新版本";
    }
    if (result === "upToDate") {
      return "已是最新版本";
    }
    if (result === "failed") {
      return "检查失败";
    }
    if (result === "incomparable") {
      return "无法比较";
    }
    return "尚未检查";
  }

  function updateSourceLabel(source) {
    const value = String(source || "").trim();
    if (value === "release") {
      return "GitHub Release";
    }
    if (value === "release-page") {
      return "GitHub Release 页面";
    }
    if (value === "tag-page") {
      return "GitHub Tags 页面";
    }
    if (value === "manifest") {
      return "仓库 manifest";
    }
    if (value === "tag-api") {
      return "GitHub Tags API";
    }
    return "未命中";
  }

  function renderUpdateCheckPanel(extensionVersion) {
    const update = getUpdateCheckState();
    const latestLabel = update.latestVersion || update.latestTag || "暂无 Release";
    const publishedLabel = update.latestPublishedAt
      ? formatDateTimeLabel(update.latestPublishedAt)
      : ((update.latestSource === "release" || update.latestSource === "release-page") ? "未知" : "非 Release 来源");
    return `
      <div class="gm-helper-info-list">
        ${renderInfoRow("当前版本", extensionVersion)}
        ${renderInfoRow("最新版本", latestLabel)}
        ${renderInfoRow("发布时间", publishedLabel)}
        ${renderInfoRow("最近检查", formatDateTimeLabel(update.lastCheckedAt))}
        ${renderInfoRow("检查状态", updateResultLabel(update.result))}
        ${renderInfoRow("版本来源", updateSourceLabel(update.latestSource))}
      </div>
      ${update.lastError ? `<div class="gm-helper-empty">最近一次检查失败：${escapeHtml(update.lastError)}</div>` : ""}
      <div class="gm-helper-button-row">
        <button type="button" class="gm-helper-button gm-helper-button-accent" data-action="update-check-now">立即检查更新</button>
        <button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="open-release-page" data-url="${escapeHtml(update.latestUrlResolved)}">打开 Release 页面</button>
      </div>
    `;
  }

  function renderUpdateModal() {
    const payload = normalizeUpdateModalPayload(state.ui.updateModalPayload);
    if (!state.ui.updateModalOpen || !payload) {
      return "";
    }
    const isUpToDate = payload.mode === "upToDate";
    const versionText = payload.latestVersion || payload.localVersion || payload.latestTag || "最新版本";
    const publishedText = payload.latestPublishedAt ? formatDateTimeLabel(payload.latestPublishedAt) : "未知";
    const checkedText = payload.checkedAt ? formatDateTimeLabel(payload.checkedAt) : formatDateTimeLabel(new Date().toISOString());
    return `
      <div class="gm-helper-update-modal-mask">
        <div class="gm-helper-update-modal gm-helper-update-modal-centered" role="dialog" aria-modal="true" aria-label="版本更新提醒">
          <div class="gm-helper-update-modal-content gm-helper-update-modal-content-centered">
          <div class="gm-helper-update-modal-title">${isUpToDate ? `当前已是最新版本 ${escapeHtml(versionText)}` : `检测到新版本 ${escapeHtml(versionText)}`}</div>
          <div class="gm-helper-update-modal-desc">${isUpToDate ? "本地版本与远端版本一致，无需更新。" : "当前有新的 GitHub Release 可用，建议下载后刷新页面生效。"}</div>
          <div class="gm-helper-update-modal-meta">${isUpToDate ? `检查时间：${escapeHtml(checkedText)}` : `发布时间：${escapeHtml(publishedText)}`}</div>
          <div class="gm-helper-button-row">
            ${isUpToDate
              ? `<button type="button" class="gm-helper-button gm-helper-button-accent" data-action="dismiss-update-modal">知道了</button>`
              : `<button type="button" class="gm-helper-button gm-helper-button-accent" data-action="open-release-page" data-url="${escapeHtml(payload.latestUrl)}">去下载更新</button><button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="dismiss-update-modal">稍后提醒</button>`}
          </div>
          </div>
        </div>
      </div>
    `;
  }

  function externalBindingStatusLabel(binding) {
    if (!binding) {
      return "未绑定";
    }
    if (binding.lastStatus === "error") {
      return "刷新失败";
    }
    return "已绑定";
  }

  function getExternalBindingEffectiveState(binding) {
    if (!binding) {
      return {
        kind: "idle",
        title: "当前生效：内置词典",
        detail: "尚未绑定外部文件，搜索与推荐继续使用扩展内置数据。"
      };
    }
    const entryCount = Math.max(0, Number(binding.entryCount) || 0);
    if (binding.lastStatus === "error") {
      if (binding.lastImportedAt) {
        return {
          kind: "warning",
          title: `当前生效：上次成功快照${entryCount ? `（${entryCount} 条）` : ""}`,
          detail: "本次外部刷新失败，但已保留上一版成功解析结果，当前功能仍可继续使用。"
        };
      }
      return {
        kind: "error",
        title: "当前生效：内置词典",
        detail: "外部文件尚未成功解析，当前已回退为扩展内置词典。"
      };
    }
    return {
      kind: "success",
      title: `当前生效：外部快照${entryCount ? `（${entryCount} 条）` : ""}`,
      detail: "外部表格已成功接入，当前搜索、推荐和参数候选优先使用这份快照。"
    };
  }

  function getExternalBindingActiveHint(binding) {
    if (!binding) {
      return "当前未接入外部数据，继续使用内置词典。";
    }
    const entryCount = Math.max(0, Number(binding.entryCount) || 0);
    if (binding.lastStatus === "error") {
      return binding.lastImportedAt
        ? `当前继续使用上次成功快照${entryCount ? `（${entryCount} 条）` : ""}。`
        : "当前未启用外部快照，继续使用内置词典。";
    }
    return `当前已生效，使用外部快照${entryCount ? `（${entryCount} 条）` : ""}。`;
  }

  function renderExternalCatalogSlot(slot, title) {
    const binding = state.personalData.externalCatalogBindings?.[slot] || null;
    const status = externalBindingStatusLabel(binding);
    const effective = getExternalBindingEffectiveState(binding);
    const entryCount = Math.max(0, Number(binding?.entryCount) || 0);
    const fileName = String(binding?.fileName || "未绑定").trim() || "未绑定";
    const sourceHint = String(binding?.sourceHint || "").trim();
    const statusClass = binding?.lastStatus === "error" ? "gm-helper-badge-danger" : binding ? "gm-helper-badge-caution" : "gm-helper-badge-normal";
    const effectiveClass = effective.kind === "success"
      ? "gm-helper-source-state-success"
      : effective.kind === "warning"
        ? "gm-helper-source-state-warning"
        : effective.kind === "error"
          ? "gm-helper-source-state-error"
          : "gm-helper-source-state-idle";
    return `
      <div class="gm-helper-external-slot">
        <div class="gm-helper-template-head">
          <div class="gm-helper-template-title">${escapeHtml(title)}</div>
          <span class="gm-helper-badge ${statusClass}">${escapeHtml(status)}</span>
        </div>
        <div class="gm-helper-inline-tip">${escapeHtml(fileName)}</div>
        <div class="gm-helper-source-state ${effectiveClass}">
          <div class="gm-helper-source-state-title">${escapeHtml(effective.title)}</div>
          <div class="gm-helper-source-state-desc">${escapeHtml(effective.detail)}</div>
        </div>
        <div class="gm-helper-inline-tip">${escapeHtml(getExternalBindingActiveHint(binding))}</div>
        <div class="gm-helper-info-list gm-helper-external-info-list">
          ${renderInfoRow("最近成功刷新", formatDateTimeLabel(binding?.lastImportedAt))}
          ${renderInfoRow("解析条数", entryCount ? `${entryCount} 条` : "0 条")}
          ${renderInfoRow("来源", sourceHint || "项目内手动选择")}
        </div>
        ${binding?.lastStatus === "error" && binding?.lastError ? `<div class="gm-helper-empty">最近一次刷新失败：${escapeHtml(binding.lastError)}。${binding.lastImportedAt ? "当前继续沿用上次成功快照。" : "当前已回退使用内置词典。"} </div>` : ""}
        <div class="gm-helper-button-row">
          <button type="button" class="gm-helper-button gm-helper-button-accent" data-action="bind-external-slot" data-slot="${escapeHtml(slot)}">${binding ? "重新选择文件" : "选择文件并绑定"}</button>
          <button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="refresh-external-slot" data-slot="${escapeHtml(slot)}">${binding ? "刷新" : "选择后刷新"}</button>
          <button type="button" class="gm-helper-button gm-helper-button-danger" data-action="clear-external-slot" data-slot="${escapeHtml(slot)}" ${binding ? "" : "disabled"}>解除绑定</button>
        </div>
        <input id="gm-helper-external-input-${escapeHtml(slot)}" data-field="externalCatalogFile" data-slot="${escapeHtml(slot)}" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="gm-helper-hidden-file-input" />
      </div>
    `;
  }

  function renderThemeSettingsPanel() {
    const currentTheme = getThemeMeta(state.personalData.skinTheme);
    const optionsHtml = UI_THEME_OPTIONS.map((theme) => `
      <button
        type="button"
        class="gm-helper-mode-btn ${currentTheme.id === theme.id ? "gm-helper-mode-btn-active" : ""}"
        data-action="set-theme"
        data-theme="${escapeHtml(theme.id)}"
      >${escapeHtml(theme.label)}</button>
    `).join("");
    return renderCollapsibleSection({
      id: "settings-theme",
      title: "界面皮肤",
      desc: "支持切换面板视觉风格。当前提供 Default / Linear / Sentry / Notion 四套皮肤。",
      defaultCollapsed: false,
      body: `<div class="gm-helper-mode-row">${optionsHtml}</div><div class="gm-helper-inline-tip">当前皮肤：${escapeHtml(currentTheme.label)}。${escapeHtml(currentTheme.description)}</div>`
    });
  }

  function renderSettingsTab() {
    const themePanel = renderThemeSettingsPanel();
    const settingsHtml = runtimeViews?.renderSettingsTab
      ? runtimeViews.renderSettingsTab()
      : "";
    return `${themePanel}${settingsHtml}`;
  }

  function getExtensionVersionSafe() {
    try {
      return chrome?.runtime?.getManifest?.()?.version || "unknown";
    } catch (error) {
      handleRuntimeInvalidated(error);
      return "unknown";
    }
  }

  function renderInfoRow(label, value) {
    return `<div class="gm-helper-info-row"><span class="gm-helper-info-label">${escapeHtml(label)}</span><span class="gm-helper-info-value">${escapeHtml(value)}</span></div>`;
  }

  function renderWorkspace(command, ws) {
    return runtimeViews?.renderWorkspace
      ? runtimeViews.renderWorkspace(command, ws)
      : "";
  }

  function renderCollapsibleSection(options) {
    const collapsed = isSectionCollapsed(options.id, options.defaultCollapsed);
    return `
      <section class="gm-helper-panel ${options.panelClass || ""}">
        <div class="gm-helper-section-head gm-helper-section-head-collapsible gm-helper-section-head-clickable" data-action="toggle-section" data-section-id="${escapeHtml(options.id)}">
          <div class="gm-helper-section-main">
            <div class="gm-helper-section-toggle">
              <span>${escapeHtml(options.title)}</span>
              <span class="gm-helper-section-chevron ${collapsed ? "gm-helper-section-chevron-collapsed" : ""}">${SECTION_CHEVRON_ICON}</span>
            </div>
            ${options.desc ? `<div class="gm-helper-section-desc">${escapeHtml(options.desc)}</div>` : ""}
          </div>
          ${options.rightMeta || ""}
        </div>
        ${collapsed ? "" : options.body}
      </section>
    `;
  }

  function renderCard(command, meta) {
    return `
      <button type="button" class="gm-helper-card" data-action="open-command" data-command-id="${command.id}">
        <div class="gm-helper-card-top">
          <div class="gm-helper-card-title">${escapeHtml(command.title)}</div>
          <span class="gm-helper-badge ${badgeClass(command.risk)}">${escapeHtml(shortRisk(command.risk))}</span>
        </div>
        <div class="gm-helper-card-command">${escapeHtml(command.command)}</div>
        <div class="gm-helper-card-desc">${escapeHtml(command.description)}</div>
        <div class="gm-helper-card-footer">
          <span>${escapeHtml(groupTitle(command.group))}</span>
          <span>${escapeHtml(meta || command.tags.slice(0, 2).join(" / "))}</span>
        </div>
      </button>
    `;
  }

  function renderCustomTemplateCard(template) {
    return `
      <div class="gm-helper-card gm-helper-template-compact-card">
        <div class="gm-helper-card-top">
          <div class="gm-helper-card-title gm-helper-template-name-ellipsis">${escapeHtml(template.name)}</div>
          <span class="gm-helper-badge ${template.replaceUid ? "gm-helper-badge-caution" : "gm-helper-badge-normal"}">${template.replaceUid ? "UID替换" : "原样"}</span>
        </div>
        <div class="gm-helper-button-row gm-helper-template-compact-actions">
          <button type="button" class="gm-helper-button gm-helper-button-accent" data-action="apply-custom-template" data-template-id="${escapeHtml(template.id)}">填入后台</button>
          <button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="append-custom-template" data-template-id="${escapeHtml(template.id)}">追加</button>
        </div>
      </div>
    `;
  }

  function renderField(command, ws, p) {
    const helper = paramHelper(p);
    const span = p.type === "textarea" ? " gm-helper-field-grow" : "";
    const attrs = `data-field="workspace-param" data-command-id="${command.id}" data-key="${p.key}"`;
    const label = `${escapeHtml(p.label)}${p.required ? '<span class="gm-helper-required">*</span>' : ""}`;
    const value = ws.values[p.key] ?? "";
    const mode = p.inputMode || (p.type === "select" ? "enum_single" : p.type);

    if (mode === "picker_mail_item_list") {
      return renderMailTemplateItemBuilderField(command, ws, p, label, helper);
    }

    if (mode === "picker_multi" || mode === "picker_single" || mode === "enum_multi" || mode === "enum_single") {
      const query = ws.pickerQueries[p.key] || "";
      const selected = mode === "picker_multi" || mode === "enum_multi"
        ? getMultiValues(ws, p.key)
        : (ws.values[p.key] ? [ws.values[p.key]] : []);
      const options = getPickerOptions(p, query, selected, ws);
      const cursor = Math.max(0, Math.min(Number(ws.pickerCursor[p.key] || 0), Math.max(options.length - 1, 0)));
      const emptyHint = getPickerEmptyHint(p, ws, query, options);
      const itemFilterPanel = isItemPickerParam(p) ? renderItemPickerFilters(command, ws, p) : "";
      const isMulti = mode === "picker_multi" || mode === "enum_multi";
      const hasQuery = Boolean(normalizeSearch(query || ""));
      const showItemImportGuide = isItemPickerParam(p) && hasQuery && !options.length;
      const hideEmptyPickerMenu = isItemPickerParam(p) && !hasQuery && !options.length;
      const queryPlaceholder = isItemPickerParam(p)
        ? (isMulti ? "输入名称/ID开始搜索，可多选" : "输入名称/ID开始搜索，单选")
        : (p.placeholder || "输入关键字筛选");
      return `
        <div class="gm-helper-field gm-helper-field-grow">
          <div class="gm-helper-picker-head">
            <label class="gm-helper-label">${label}</label>
            <div class="gm-helper-picker-head-actions">
              ${isMulti
                ? `<button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="picker-select-all" data-command-id="${command.id}" data-key="${p.key}">全选当前筛选</button><button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="picker-invert" data-command-id="${command.id}" data-key="${p.key}">反选</button><button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="picker-clear" data-command-id="${command.id}" data-key="${p.key}">清空</button>`
                : `<button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="picker-clear" data-command-id="${command.id}" data-key="${p.key}">清空</button>`}
            </div>
          </div>
          <div class="gm-helper-picker">
            ${itemFilterPanel}
            <input class="gm-helper-input" data-field="pickerQuery" data-command-id="${command.id}" data-key="${p.key}" placeholder="${escapeHtml(queryPlaceholder)}" value="${escapeHtml(query)}" />
            ${selected.length ? `<div class="gm-helper-selected-chip-list"><div class="gm-helper-chip-row">${selected.map((id) => `<span class="gm-helper-chip gm-helper-chip-ghost">${escapeHtml(resolveOptionLabel(p, id, ws))}</span>`).join("")}</div></div>` : ""}
            ${hideEmptyPickerMenu
              ? (selected.length ? `<div class="gm-helper-picker-note">已选 ${selected.length} 项，继续输入名称/ID可追加。</div>` : "")
              : `<div class="gm-helper-picker-menu">
                ${options.length ? options.map((opt, index) => {
                  const checked = selected.includes(opt.value);
                  return `<button type="button" class="gm-helper-picker-option ${checked ? "gm-helper-picker-option-active" : ""} ${index === cursor ? "gm-helper-picker-option-focused" : ""}" data-action="picker-toggle-option" data-command-id="${command.id}" data-key="${p.key}" data-option-index="${index}" data-value="${escapeHtml(opt.value)}"><span class="gm-helper-picker-option-text">${escapeHtml(opt.label)}</span><span class="gm-helper-picker-check ${checked ? "gm-helper-picker-check-on" : ""}">${checked ? "✓" : ""}</span></button>`;
                }).join("") : `<div class="gm-helper-empty">${escapeHtml(emptyHint)}</div>${showItemImportGuide ? '<div class="gm-helper-button-row"><button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="goto-settings-import">前往设置页导入 Item.xlsx</button></div>' : ""}`}
              </div>`}
          </div>
          ${helper ? `<div class="gm-helper-inline-tip">${escapeHtml(helper)}</div>` : ""}
        </div>
      `;
    }

    if (mode === "bool_toggle") {
      const options = resolveSourceOptions(p, ws);
      if (options.length) {
        return `
          <div class="gm-helper-field${span}">
            <label class="gm-helper-label">${label}</label>
            <select class="gm-helper-select" ${attrs}>
              ${!p.required ? '<option value="">请选择</option>' : ""}
              ${options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(value) === String(option.value) ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
            </select>
            ${helper ? `<div class="gm-helper-inline-tip">${escapeHtml(helper)}</div>` : ""}
          </div>
        `;
      }
    }

    if (p.type === "select") {
      return `<div class="gm-helper-field${span}"><label class="gm-helper-label">${label}</label><select class="gm-helper-select" ${attrs}>${p.options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(value) === String(option.value) ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select>${helper ? `<div class="gm-helper-inline-tip">${escapeHtml(helper)}</div>` : ""}</div>`;
    }
    if (p.type === "textarea") {
      return `<div class="gm-helper-field${span}"><label class="gm-helper-label">${label}</label><textarea class="gm-helper-textarea" ${attrs} placeholder="${escapeHtml(p.placeholder)}">${escapeHtml(value)}</textarea>${helper ? `<div class="gm-helper-inline-tip">${escapeHtml(helper)}</div>` : ""}</div>`;
    }
    return `<div class="gm-helper-field${span}"><label class="gm-helper-label">${label}</label><input class="gm-helper-input" type="${p.type === "number" ? "number" : "text"}" ${attrs} placeholder="${escapeHtml(p.placeholder)}" value="${escapeHtml(value)}" />${helper ? `<div class="gm-helper-inline-tip">${escapeHtml(helper)}</div>` : ""}</div>`;
  }

  function renderMailTemplateItemBuilderField(command, ws, p, label, helper) {
    const query = ws.pickerQueries[p.key] || "";
    const selected = getMultiValues(ws, p.key);
    const options = getPickerOptions(p, query, selected, ws);
    const cursor = Math.max(0, Math.min(Number(ws.pickerCursor[p.key] || 0), Math.max(options.length - 1, 0)));
    const emptyHint = getPickerEmptyHint(p, ws, query, options);
    const itemFilterPanel = renderItemPickerFilters(command, ws, p);
    const rows = getMailTemplateRows(ws, p.key);
    return `
      <div class="gm-helper-field gm-helper-field-grow">
        <div class="gm-helper-picker-head">
          <label class="gm-helper-label">${label}</label>
          <div class="gm-helper-picker-head-actions">
            <button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="picker-select-all" data-command-id="${command.id}" data-key="${p.key}">全选当前筛选</button>
            <button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="picker-invert" data-command-id="${command.id}" data-key="${p.key}">反选</button>
            <button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="picker-clear" data-command-id="${command.id}" data-key="${p.key}">清空勾选</button>
          </div>
        </div>
        <div class="gm-helper-picker">
          ${itemFilterPanel}
          <input class="gm-helper-input" data-field="pickerQuery" data-command-id="${command.id}" data-key="${p.key}" placeholder="输入名称/ID开始搜索，可多选" value="${escapeHtml(query)}" />
          <div class="gm-helper-button-row">
            <button type="button" class="gm-helper-button gm-helper-button-accent" data-action="mail-template-add-selected" data-command-id="${command.id}" data-key="${p.key}">加入附件列表</button>
            <button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="mail-template-clear-items" data-command-id="${command.id}" data-key="${p.key}" ${rows.length ? "" : "disabled"}>清空附件列表</button>
          </div>
          <div class="gm-helper-picker-menu">
            ${options.length ? options.map((opt, index) => {
              const checked = selected.includes(opt.value);
              return `<button type="button" class="gm-helper-picker-option ${checked ? "gm-helper-picker-option-active" : ""} ${index === cursor ? "gm-helper-picker-option-focused" : ""}" data-action="picker-toggle-option" data-command-id="${command.id}" data-key="${p.key}" data-option-index="${index}" data-value="${escapeHtml(opt.value)}"><span class="gm-helper-picker-option-text">${escapeHtml(opt.label)}</span><span class="gm-helper-picker-check ${checked ? "gm-helper-picker-check-on" : ""}">${checked ? "✓" : ""}</span></button>`;
            }).join("") : `<div class="gm-helper-empty">${escapeHtml(emptyHint)}</div>`}
          </div>
          <div class="gm-helper-mail-item-list">
            <div class="gm-helper-subtitle">已加入附件（${rows.length}）</div>
            ${rows.length
              ? `<div class="gm-helper-mail-item-scroll">${rows.map((row) => `<div class="gm-helper-mail-item-row"><div class="gm-helper-mail-item-main"><div class="gm-helper-mail-item-title"><span class="gm-helper-mail-item-id">${escapeHtml(row.itemId)}</span><span class="gm-helper-mail-item-name">${escapeHtml(row.name || "")}</span></div><div class="gm-helper-mail-item-meta">${escapeHtml(`${row.itemId}/${row.count}/${row.bind}`)}</div></div><div class="gm-helper-mail-item-edit"><input class="gm-helper-input gm-helper-mail-item-count" type="number" min="1" data-field="mailTemplateItemCount" data-command-id="${command.id}" data-key="${p.key}" data-item-id="${escapeHtml(row.itemId)}" data-bind="${escapeHtml(row.bind)}" value="${escapeHtml(row.count)}" /><select class="gm-helper-select gm-helper-mail-item-bind" data-field="mailTemplateItemBind" data-command-id="${command.id}" data-key="${p.key}" data-item-id="${escapeHtml(row.itemId)}" data-bind="${escapeHtml(row.bind)}"><option value="0" ${row.bind === "0" ? "selected" : ""}>不绑(0)</option><option value="1" ${row.bind === "1" ? "selected" : ""}>绑定(1)</option></select><button type="button" class="gm-helper-button gm-helper-button-danger" data-action="mail-template-remove-item" data-command-id="${command.id}" data-key="${p.key}" data-item-id="${escapeHtml(row.itemId)}" data-bind="${escapeHtml(row.bind)}">删</button></div></div>`).join("")}</div>`
              : `<div class="gm-helper-empty">请先从上方搜索并加入道具，生成时会自动拼成 itemid/num/bind 列表。</div>`}
          </div>
        </div>
        ${helper ? `<div class="gm-helper-inline-tip">${escapeHtml(helper)}</div>` : ""}
      </div>
    `;
  }

  function shouldShowParam(param, batchMode) {
    return !param.modes || param.modes.includes(batchMode);
  }

  function paramHelper(param) {
    if (param.inheritGlobalUid && state.userContext.currentUid) {
      return `${param.helper ? `${param.helper} ` : ""}当前顶部 UID：${state.userContext.currentUid}`;
    }
    return param.helper || "";
  }

  function isItemPickerParam(param) {
    return String(param?.optionSource || "") === "items" && String(param?.inputMode || "").startsWith("picker");
  }

  function normalizeItemPickerFilter(rawFilter, param) {
    let scope = String(rawFilter?.scope || "");
    const typeId = String(rawFilter?.typeId || "");
    const subTypeId = String(rawFilter?.subTypeId || "");
    const crossScope = Boolean(rawFilter?.crossScope);
    if (!typeId && !subTypeId && !crossScope) {
      scope = "";
    }
    return { scope: scope === "out-game" || scope === "in-game" ? scope : "", typeId, subTypeId, crossScope };
  }

  function getItemPickerFilterState(ws, param) {
    ws.pickerFilters = ws.pickerFilters && typeof ws.pickerFilters === "object" ? ws.pickerFilters : {};
    const current = normalizeItemPickerFilter(ws.pickerFilters[param.key], param);
    const typeOptions = getItemTypeOptions(current);
    if (current.typeId && !typeOptions.some((opt) => opt.value === current.typeId)) {
      current.typeId = "";
      current.subTypeId = "";
    }
    const subTypeOptions = getItemSubTypeOptions(current);
    if (current.subTypeId && !subTypeOptions.some((opt) => opt.value === current.subTypeId)) {
      current.subTypeId = "";
    }
    ws.pickerFilters[param.key] = current;
    return current;
  }

  function isItemPickerFilterReady(filter) {
    if (!filter || filter.crossScope) {
      return true;
    }
    if (!filter.typeId || !filter.subTypeId) {
      return false;
    }
    if (filter.typeId === "__extended__") {
      return filter.subTypeId.startsWith("ext:");
    }
    return true;
  }

  function renderItemPickerFilters(command, ws, param) {
    const filter = getItemPickerFilterState(ws, param);
    const scopeOptions = getItemScopeOptions();
    const typeOptions = getItemTypeOptions(filter);
    const subTypeOptions = getItemSubTypeOptions(filter);
    const config = param.pickerFilters || {};
    const crossScopeEnabled = config.allowCrossScope !== false;
    return `
      <div class="gm-helper-item-filter">
        <div class="gm-helper-item-filter-grid">
          <div class="gm-helper-field">
            <label class="gm-helper-label">范围</label>
            <select class="gm-helper-select" data-field="itemPickerScope" data-command-id="${command.id}" data-key="${param.key}">
              <option value="">全部范围</option>
              ${scopeOptions.map((opt) => `<option value="${escapeHtml(opt.value)}" ${opt.value === filter.scope ? "selected" : ""}>${escapeHtml(opt.label)}</option>`).join("")}
            </select>
          </div>
          <div class="gm-helper-field">
            <label class="gm-helper-label">类型</label>
            <select class="gm-helper-select" data-field="itemPickerType" data-command-id="${command.id}" data-key="${param.key}">
              <option value="">请选择类型</option>
              ${typeOptions.map((opt) => `<option value="${escapeHtml(opt.value)}" ${opt.value === filter.typeId ? "selected" : ""}>${escapeHtml(opt.label)}</option>`).join("")}
            </select>
          </div>
          <div class="gm-helper-field gm-helper-field-grow">
            <label class="gm-helper-label">子类型</label>
            <select class="gm-helper-select" data-field="itemPickerSubType" data-command-id="${command.id}" data-key="${param.key}">
              <option value="">请选择子类型</option>
              ${subTypeOptions.map((opt) => `<option value="${escapeHtml(opt.value)}" ${opt.value === filter.subTypeId ? "selected" : ""}>${escapeHtml(opt.label)}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="gm-helper-picker-actions">
          <button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="item-picker-set-scope" data-command-id="${command.id}" data-key="${param.key}" data-scope="out-game">切到场外</button>
          <button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="item-picker-open-extended" data-command-id="${command.id}" data-key="${param.key}">扩展类型</button>
          ${crossScopeEnabled ? `<label class="gm-helper-item-cross"><input type="checkbox" data-field="itemPickerCrossScope" data-command-id="${command.id}" data-key="${param.key}" ${filter.crossScope ? "checked" : ""} />跨分类搜索</label>` : ""}
        </div>
      </div>
    `;
  }

  function getPickerEmptyHint(param, ws, query, options) {
    if (options.length) {
      return "";
    }
    if (!isItemPickerParam(param)) {
      return query ? "没有匹配项" : "暂无可选项";
    }
    if (!normalizeSearch(query || "")) {
      return "请输入名称/ID开始搜索";
    }
    return "当前词典未命中该道具";
  }

  function getItemScopeOptions() {
    return [...catalogStore.itemTaxonomyIndex.scopeMap.entries()].map(([value, label]) => ({ value, label }));
  }

  function getItemTypeOptions(filter) {
    const scopePool = filter.scope ? [filter.scope] : ["in-game", "out-game"];
    const list = scopePool.flatMap((scope) => catalogStore.itemTaxonomyIndex.typeByScope.get(scope) || []);
    const exists = new Set(list.map((row) => row.id));
    const resultMap = new Map();
    list.filter((row) => !row.isExtended).forEach((row) => {
      if (!resultMap.has(row.id)) {
        resultMap.set(row.id, { value: row.id, label: row.label });
      }
    });
    const result = [...resultMap.values()];

    const scopeItems = catalogStore.itemOptions.filter((item) => !filter.scope || item.scope === filter.scope);
    const extraTypeIds = uniqStrings(scopeItems.map((item) => item.typeId));
    extraTypeIds.forEach((typeId) => {
      if (exists.has(typeId) || catalogStore.itemTaxonomyIndex.extendedTypeSet.has(typeId)) {
        return;
      }
      result.push({ value: typeId, label: `类型${typeId}` });
    });

    const hasExtendedInScope = scopeItems.some((item) => item.isExtended);
    if (hasExtendedInScope) {
      result.push({ value: "__extended__", label: "扩展类型" });
    }
    return result;
  }

  function getItemSubTypeOptions(filter) {
    if (!filter.typeId) {
      return [];
    }
    if (filter.typeId === "__extended__") {
      const extRows = [];
      const seen = new Set();
      catalogStore.itemOptions.forEach((item) => {
        if ((filter.scope && item.scope !== filter.scope) || !item.isExtended || seen.has(item.typeId)) {
          return;
        }
        seen.add(item.typeId);
        extRows.push({ value: `ext:${item.typeId}`, label: `${item.typeId} ${item.typeLabel}` });
      });
      return extRows.sort((a, b) => a.value.localeCompare(b.value));
    }

    const rows = [...(catalogStore.itemTaxonomyIndex.subTypeByType.get(filter.typeId) || [])].map((row) => ({ value: row.id, label: row.label }));
    const exists = new Set(rows.map((x) => x.value));
    catalogStore.itemOptions.forEach((item) => {
      if ((filter.scope && item.scope !== filter.scope) || item.typeId !== filter.typeId || !item.subTypeId || exists.has(item.subTypeId)) {
        return;
      }
      exists.add(item.subTypeId);
      rows.push({ value: item.subTypeId, label: `子类型${item.subTypeId}` });
    });
    return rows.sort((a, b) => a.value.localeCompare(b.value, "en"));
  }

  function getMultiValues(ws, key) {
    return Array.isArray(ws.multiValues?.[key]) ? ws.multiValues[key] : [];
  }

  function parseMailTemplateItemList(raw) {
    return String(raw || "")
      .split(/[\r\n;；]+/)
      .map((entry) => String(entry || "").trim())
      .filter(Boolean)
      .map((entry) => {
        const parts = entry.split(/[\/,，]+/).map((x) => String(x || "").trim()).filter(Boolean);
        return {
          itemId: String(parts[0] || "").trim(),
          count: String(parts[1] || "1").trim(),
          bind: String(parts[2] || "0").trim()
        };
      });
  }

  function normalizeMailTemplateItemRows(rows) {
    const dedup = new Map();
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      const itemId = String(row?.itemId || "").trim();
      if (!/^\d+$/.test(itemId)) {
        return;
      }
      const countRaw = Number(row?.count);
      const count = Number.isFinite(countRaw) && countRaw > 0 ? Math.floor(countRaw) : 1;
      const bind = String(row?.bind || "0") === "1" ? "1" : "0";
      const name = resolveMailItemName(itemId);
      dedup.set(`${itemId}:${bind}`, {
        itemId,
        count: String(count),
        bind,
        name
      });
    });
    return Array.from(dedup.values()).sort((left, right) => String(left.itemId).localeCompare(String(right.itemId), "en"));
  }

  function serializeMailTemplateItemRows(rows) {
    return (Array.isArray(rows) ? rows : [])
      .map((row) => `${row.itemId}/${row.count}/${row.bind}`)
      .join(";");
  }

  function resolveMailItemName(itemId) {
    const id = String(itemId || "").trim();
    if (!id) {
      return "";
    }
    const found = (catalogStore.itemOptions || []).find((item) => String(item.id) === id);
    return String(found?.name || "").trim();
  }

  function getMailTemplateRows(ws, key) {
    ws.mailTemplateItems = ws.mailTemplateItems && typeof ws.mailTemplateItems === "object" ? ws.mailTemplateItems : {};
    const rows = normalizeMailTemplateItemRows(ws.mailTemplateItems[key]);
    ws.mailTemplateItems[key] = rows;
    return rows;
  }

  function setMailTemplateRows(ws, key, rows) {
    const normalized = normalizeMailTemplateItemRows(rows);
    ws.mailTemplateItems = ws.mailTemplateItems && typeof ws.mailTemplateItems === "object" ? ws.mailTemplateItems : {};
    ws.mailTemplateItems[key] = normalized;
    ws.values[key] = serializeMailTemplateItemRows(normalized);
  }

  function togglePickerOption(command, key, rawValue) {
    const value = String(rawValue || "").trim();
    if (!value) {
      return;
    }
    const ws = ensureWorkspace(command.id);
    const param = getParam(command, key);
    if (!param) {
      return;
    }
    const mode = param.inputMode || param.type;

    if (mode === "picker_mail_item_list") {
      const current = new Set(getMultiValues(ws, key));
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      ws.multiValues[key] = sortValuesByOptionOrder(Array.from(current), param, ws);
      return;
    }

    if (mode === "picker_multi" || mode === "enum_multi") {
      const current = new Set(getMultiValues(ws, key));
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      ws.multiValues[key] = sortValuesByOptionOrder(Array.from(current), param, ws);
      ws.values[key] = ws.multiValues[key].join(",");
      return;
    }
    ws.values[key] = ws.values[key] === value ? "" : value;
  }

  function clearPickerSelections(command, key) {
    const ws = ensureWorkspace(command.id);
    const param = getParam(command, key);
    const mode = String(param?.inputMode || param?.type || "");
    if (mode === "picker_mail_item_list") {
      ws.multiValues[key] = [];
      ws.pickerQueries[key] = "";
      ws.pickerCursor[key] = 0;
      return;
    }
    ws.multiValues[key] = [];
    ws.values[key] = "";
    ws.pickerQueries[key] = "";
    ws.pickerCursor[key] = 0;
  }

  function selectAllPickerOptions(command, key) {
    const ws = ensureWorkspace(command.id);
    const param = getParam(command, key);
    const options = getPickerOptions(param, ws.pickerQueries[key] || "", [], ws);
    const mode = String(param?.inputMode || param?.type || "");
    if (mode === "picker_mail_item_list") {
      ws.multiValues[key] = options.map((x) => x.value);
      ws.pickerCursor[key] = 0;
      return;
    }
    ws.multiValues[key] = options.map((x) => x.value);
    ws.values[key] = ws.multiValues[key].join(",");
    ws.pickerCursor[key] = 0;
  }

  function invertPickerOptions(command, key) {
    const ws = ensureWorkspace(command.id);
    const param = getParam(command, key);
    const options = getPickerOptions(param, ws.pickerQueries[key] || "", [], ws);
    const current = new Set(getMultiValues(ws, key));
    const next = options.map((x) => x.value).filter((id) => !current.has(id));
    const mode = String(param?.inputMode || param?.type || "");
    if (mode === "picker_mail_item_list") {
      ws.multiValues[key] = next;
      ws.pickerCursor[key] = 0;
      return;
    }
    ws.multiValues[key] = next;
    ws.values[key] = next.join(",");
    ws.pickerCursor[key] = 0;
  }

  function getPickerOptions(param, query, selected, ws) {
    const options = resolveSourceOptions(param, ws);
    const normalized = normalizeSearch(query || "");
    const rawQuery = String(query || "").trim().toLowerCase();
    const semanticIntent = String(param.optionSource || "") === "items" ? detectItemSemanticIntent(query) : { active: false };
    const aliasTokens = Array.isArray(param.aliasTokens) ? param.aliasTokens.map((x) => normalizeSearch(x)).filter(Boolean) : [];
    if (String(param.optionSource || "") === "items") {
      if (!normalized) {
        return [];
      }
    }
    let filtered = options;
    if (normalized) {
      filtered = options.filter((opt) => {
        const hay = normalizeSearch(`${opt.value} ${opt.label} ${(opt.aliases || []).join(" ")}`);
        return hay.includes(normalized)
          || matchAliasTerms(param, normalized, opt.value)
          || aliasTokens.some((token) => token === normalized || token.includes(normalized) || normalized.includes(token));
      });
      if (String(param.optionSource || "") === "items") {
        filtered = filtered
          .map((opt) => ({ opt, score: scoreItemPickerOption(opt, rawQuery, normalized) }))
          .sort((left, right) => right.score - left.score || String(left.opt.value).localeCompare(String(right.opt.value), "en"))
          .map((row) => row.opt);
      }
    }
    if (semanticIntent.active && String(param.optionSource || "") === "items") {
      filtered = options
        .map((opt) => {
          const meta = getItemOptionByValue(opt.value);
          return { opt, score: scoreItemSemanticIntent(meta, semanticIntent) };
        })
        .filter((row) => row.score > 0)
        .sort((left, right) => right.score - left.score || String(left.opt.value).localeCompare(String(right.opt.value), "en"))
        .map((row) => row.opt);
    }
    return filtered.slice(0, 120);
  }

  function getItemOptionByValue(value) {
    const id = String(value || "").trim();
    if (!id) {
      return null;
    }
    return (catalogStore.itemOptions || []).find((item) => String(item.id) === id) || null;
  }

  function scoreItemPickerOption(option, rawLowerQuery, normalizedQuery) {
    const value = String(option?.value || "");
    const label = String(option?.label || "");
    const labelLower = label.toLowerCase();
    const normalizedLabel = normalizeSearch(label);
    const aliasNorm = Array.isArray(option?.aliases) ? option.aliases.map((x) => normalizeSearch(x)).filter(Boolean) : [];
    let score = 0;

    if (labelLower === rawLowerQuery) {
      score = Math.max(score, 1200);
    }
    if (normalizedLabel === normalizedQuery) {
      score = Math.max(score, 1140);
    }
    if (rawLowerQuery && labelLower.includes(rawLowerQuery)) {
      score = Math.max(score, 1000);
    }
    if (normalizedLabel.includes(normalizedQuery)) {
      score = Math.max(score, 940);
    }
    if (aliasNorm.some((token) => token === normalizedQuery || token.includes(normalizedQuery) || normalizedQuery.includes(token))) {
      score = Math.max(score, 820);
    }
    if (value === rawLowerQuery) {
      score = Math.max(score, 760);
    } else if (value.startsWith(rawLowerQuery)) {
      score = Math.max(score, 720);
    } else if (value.includes(rawLowerQuery)) {
      score = Math.max(score, 680);
    }
    return score;
  }

  function resolveOptionLabel(param, value, ws) {
    const options = resolveSourceOptions(param, ws, { ignorePickerFilter: true });
    const found = options.find((x) => x.value === value);
    return found ? found.label : value;
  }

  function resolveSourceOptions(param, ws, opts) {
    const source = String(param.optionSource || "").trim();
    if (!source) {
      return [];
    }
    if (source === "items") {
      const options = catalogStore.itemOptions || [];
      const ignorePickerFilter = Boolean(opts?.ignorePickerFilter);
      if (ignorePickerFilter) {
        return options.map((x) => ({ value: x.value, label: x.label, aliases: x.aliases || [] })).filter((x) => x.value);
      }
      const filter = getItemPickerFilterState(ws || {}, param);
      let scoped = options;
      if (!filter.crossScope) {
        if (filter.scope) {
          scoped = scoped.filter((item) => item.scope === filter.scope);
        }
        if (filter.typeId === "__extended__") {
          const selectedTypeId = String(filter.subTypeId || "").replace(/^ext:/, "");
          scoped = scoped.filter((item) => item.isExtended && (!selectedTypeId || item.typeId === selectedTypeId));
        } else if (filter.typeId) {
          scoped = scoped.filter((item) => item.typeId === filter.typeId);
          if (filter.subTypeId) {
            scoped = scoped.filter((item) => item.subTypeId === filter.subTypeId);
          }
        }
      }
      return scoped.map((x) => ({ value: x.value, label: x.label, aliases: x.aliases || [] })).filter((x) => x.value);
    }
    if (source === "mail") {
      return catalogStore.groups.mail.map((x) => ({
        value: String(x.emailId),
        label: `${x.emailId} ${x.title || ""}`.trim(),
        aliases: [x.displayType, x.autoDelete, ...(Array.isArray(x.aliases) ? x.aliases : [])].filter(Boolean)
      })).filter((x) => x.value);
    }
    if (source === "tasks") {
      return catalogStore.groups.tasks.map((x) => ({
        value: String(x.taskId),
        label: `${x.taskId} ${x.name || ""}`.trim(),
        aliases: [x.group, x.desc, ...(Array.isArray(x.aliases) ? x.aliases : [])].filter(Boolean)
      })).filter((x) => x.value);
    }
    if (source.startsWith("enum:")) {
      const enumKey = source.replace(/^enum:/, "");
      return (catalogStore.enums[enumKey] || []).map((x) => ({ value: String(x.value), label: String(x.label || x.value), aliases: [] }));
    }
    if (source.startsWith("text-enum:")) {
      const enumKey = source.replace(/^text-enum:/, "");
      return (catalogStore.enums[`text:${enumKey}`] || catalogStore.enums[enumKey] || []).map((x) => ({ value: String(x.value), label: String(x.label || x.value), aliases: [] }));
    }
    return [];
  }

  function sortValuesByOptionOrder(values, param, ws) {
    const options = resolveSourceOptions(param, ws, { ignorePickerFilter: true });
    const order = new Map(options.map((item, index) => [item.value, index]));
    return [...values].sort((left, right) => (order.get(left) ?? Number.MAX_SAFE_INTEGER) - (order.get(right) ?? Number.MAX_SAFE_INTEGER));
  }

  function matchAliasTerms(param, normalizedTerm, optionValue) {
    if (!normalizedTerm || !optionValue) {
      return false;
    }
    const source = String(param.optionSource || "");
    const hit = (rows) => rows.some((x) => {
      const term = normalizeSearch(x.term);
      if (!term || !x.targets.includes(optionValue)) {
        return false;
      }
      return normalizedTerm === term || normalizedTerm.includes(term) || term.includes(normalizedTerm);
    });

    if (source === "items") {
      return hit(catalogStore.aliases.items || []);
    }
    if (source === "mail") {
      return hit(catalogStore.aliases.mail || []);
    }
    if (source === "tasks") {
      return hit(catalogStore.aliases.tasks || []);
    }
    return false;
  }

  function buildSearchSuggestions(query, context) {
    const text = String(query || "").trim();
    if (!text) {
      return { query: "", commands: [], items: [] };
    }
    const itemSuggestions = searchItemSuggestions(text);
    const commandSuggestions = searchCommandSuggestions(text, itemSuggestions).slice(0, 6);
    return { query: text, commands: commandSuggestions, items: itemSuggestions };
  }

  function detectItemSemanticIntent(query) {
    const normalized = normalizeSearch(query);
    if (!normalized) {
      return { active: false, forceTypeId: "", forceQualityId: "" };
    }
    const hasBigRed = normalized.includes("大红") || normalized.includes("超高价值") || normalized.includes("红装");
    const hasBigGold = normalized.includes("大金") || normalized.includes("高价值") || normalized.includes("金装");
    if (!hasBigRed && !hasBigGold) {
      return { active: false, forceTypeId: "", forceQualityId: "" };
    }
    return {
      active: true,
      forceTypeId: "30",
      forceQualityId: hasBigRed ? "6" : "5"
    };
  }

  function getSemanticComparableQualityId(item) {
    const qualityId = String(item?.qualityId || item?.quality || "").trim();
    if (qualityId && qualityId !== "unknown") {
      return qualityId;
    }
    return inferType30QualityId(item?.id || item?.itemId, item?.typeId || item?.itemType);
  }

  function matchesItemSemanticIntent(item, intent, opts) {
    if (!intent?.active) {
      return true;
    }
    if (intent.forceTypeId && String(item?.typeId || item?.itemType || "") !== String(intent.forceTypeId)) {
      return false;
    }
    if (opts?.ignoreQuality) {
      return true;
    }
    if (intent.forceQualityId && getSemanticComparableQualityId(item) !== String(intent.forceQualityId)) {
      return false;
    }
    return true;
  }

  function scoreItemSemanticIntent(item, intent) {
    if (!intent?.active || !matchesItemSemanticIntent(item, intent, { ignoreQuality: true })) {
      return 0;
    }
    if (matchesItemSemanticIntent(item, intent)) {
      return 980;
    }
    const qualityId = getSemanticComparableQualityId(item);
    if (!qualityId || qualityId === "unknown") {
      return 860;
    }
    return 780;
  }

  function searchItemSuggestions(query) {
    const normalizedQuery = normalizeSearch(query);
    const rawLower = String(query || "").trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }
    const semanticIntent = detectItemSemanticIntent(query);
    const allItems = catalogStore.itemOptions || [];
    const exactSemanticItems = semanticIntent.active
      ? allItems.filter((item) => matchesItemSemanticIntent(item, semanticIntent))
      : [];
    const fallbackSemanticItems = semanticIntent.active && !exactSemanticItems.length
      ? allItems.filter((item) => matchesItemSemanticIntent(item, semanticIntent, { ignoreQuality: true }) && !getSemanticComparableQualityId(item))
      : [];
    const sourceItems = semanticIntent.active
      ? (exactSemanticItems.length ? exactSemanticItems : fallbackSemanticItems)
      : allItems;
    const rows = [];
    sourceItems.forEach((item) => {
      const semanticScore = scoreItemSemanticIntent(item, semanticIntent);
      const score = Math.max(scoreItemSuggestion(item, rawLower, normalizedQuery), semanticScore);
      if (score <= 0) {
        return;
      }
      rows.push({
        itemId: item.id,
        name: item.name || item.id,
        path: item.pathLabel || "",
        score
      });
    });
    if (semanticIntent.active && exactSemanticItems.length) {
      return rows.sort((left, right) => right.score - left.score || String(left.itemId).localeCompare(String(right.itemId), "en"));
    }
    if (semanticIntent.active && !rows.length && fallbackSemanticItems.length) {
      return fallbackSemanticItems
        .map((item) => ({
          itemId: item.id,
          name: item.name || item.id,
          path: item.pathLabel || "",
          score: scoreItemSemanticIntent(item, semanticIntent)
        }))
        .filter((row) => row.score > 0)
        .sort((left, right) => right.score - left.score || String(left.itemId).localeCompare(String(right.itemId), "en"));
    }
    return rows.sort((left, right) => right.score - left.score || String(left.itemId).localeCompare(String(right.itemId), "en"));
  }

  function scoreItemSuggestion(item, rawLowerQuery, normalizedQuery) {
    const id = String(item?.id || "");
    const name = String(item?.name || "");
    const nameLower = name.toLowerCase();
    const normalizedName = normalizeSearch(name);
    const aliases = Array.isArray(item?.aliases) ? item.aliases.map((x) => String(x || "")).filter(Boolean) : [];
    const normalizedAliases = aliases.map((alias) => normalizeSearch(alias)).filter(Boolean);
    const pathLabel = String(item?.pathLabel || "");
    const typeLabel = String(item?.typeLabel || "");
    const subTypeLabel = String(item?.subTypeLabel || "");
    const qualityLabel = String(item?.qualityLabel || "");
    const normalizedComposite = normalizeSearch(`${id} ${name} ${aliases.join(" ")} ${typeLabel} ${subTypeLabel} ${qualityLabel} ${pathLabel}`);

    let score = 0;

    if (nameLower && nameLower === rawLowerQuery) {
      score = Math.max(score, 1200);
    }
    if (normalizedName && normalizedName === normalizedQuery) {
      score = Math.max(score, 1160);
    }
    if (rawLowerQuery && nameLower.includes(rawLowerQuery)) {
      score = Math.max(score, 1030);
    }
    if (normalizedName && normalizedName.includes(normalizedQuery)) {
      score = Math.max(score, 960);
    }
    if (normalizedAliases.some((token) => token === normalizedQuery || token.includes(normalizedQuery) || normalizedQuery.includes(token))) {
      score = Math.max(score, 820);
    }
    if (id === rawLowerQuery) {
      score = Math.max(score, 780);
    } else if (id.startsWith(rawLowerQuery)) {
      score = Math.max(score, 740);
    } else if (id.includes(rawLowerQuery)) {
      score = Math.max(score, 700);
    }
    if (normalizedComposite.includes(normalizedQuery)) {
      score = Math.max(score, 620);
    }

    return score;
  }

  function searchCommandSuggestions(query, itemSuggestions) {
    const rows = [];
    const dedup = new Set();
    const itemHitCount = Array.isArray(itemSuggestions) ? itemSuggestions.length : 0;

    if (itemHitCount) {
      ["add_item", "summon_item", "send_mail"].forEach((commandId, index) => {
        const command = COMMAND_MAP.get(commandId);
        if (!command || dedup.has(commandId)) {
          return;
        }
        dedup.add(commandId);
        rows.push({
          commandId,
          title: command.title,
          reason: itemHitCount === 1 ? "已匹配 1 个道具，可直接进入操作。" : `已匹配 ${itemHitCount} 个道具，可先勾选后批量处理。`,
          score: 1400 - index * 20,
          itemId: ""
        });
      });
    }

    searchCommands(query).forEach((row) => {
      if (!row?.command?.id || dedup.has(row.command.id)) {
        return;
      }
      dedup.add(row.command.id);
      rows.push({
        commandId: row.command.id,
        title: row.command.title,
        reason: row.meta || "关键词命中",
        score: 900 + Number(row.score || 0),
        itemId: ""
      });
    });

    if (!rows.length) {
      ["add_item", "summon_item", "send_mail"].forEach((commandId, index) => {
        const command = COMMAND_MAP.get(commandId);
        if (!command || dedup.has(commandId)) {
          return;
        }
        dedup.add(commandId);
        rows.push({
          commandId,
          title: command.title,
          reason: "可先进入该操作，再按道具ID发放",
          score: 500 - index * 10,
          itemId: ""
        });
      });
    }

    return rows.sort((left, right) => Number(right.score || 0) - Number(left.score || 0));
  }

  function searchCommands(query) {
    const normalized = normalizeSearch(query);
    return COMMANDS.map((command) => ({ command, ...scoreCommand(command, query, normalized) })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);
  }

  function scoreCommand(command, query, normalizedQuery) {
    const fields = [{ text: command.title, score: 1000, meta: "标题命中" }]
      .concat(command.aliases.map((text) => ({ text, score: 850, meta: "别名命中" })))
      .concat(command.tags.map((text) => ({ text, score: 700, meta: "标签命中" })))
      .concat([{ text: command.command, score: 600, meta: "命令名命中" }, { text: command.description, score: 450, meta: "说明命中" }, { text: command.useCases, score: 350, meta: "场景命中" }]);
    let best = { score: 0, meta: "" };
    fields.forEach((field) => {
      const normalizedField = normalizeSearch(field.text);
      if (!normalizedField) {
        return;
      }
      const contains = normalizedField.includes(normalizedQuery) || String(field.text).toLowerCase().includes(query.toLowerCase());
      const score = normalizedField === normalizedQuery ? field.score + 100 : contains ? field.score : 0;
      if (score > best.score) {
        best = { score, meta: field.meta };
      }
    });
    return best;
  }

  function normalizeSearch(value) {
    return String(value || "").toLowerCase().replace(/[\s_\-]+/g, "").trim();
  }

  function ensureOutput(command) {
    const output = String(ensureWorkspace(command.id).output || "").trim();
    if (!output) {
      setStatus("请先生成命令", "error");
      render();
      return "";
    }
    return output;
  }

  function buildSummonItem(command, ws) {
    const uid = required(command, ws, "uid");
    if (!uid.ok) {
      return uid;
    }
    if (ws.batchMode === "single") {
      const itemIds = resolveParamValues(getParam(command, "itemId"), ws);
      if (!itemIds.length) {
        return fail("请填写“物品ID”");
      }
      const lines = itemIds.map((itemId) => `${command.command} ${uid.value} ${itemId}`);
      return ok(lines.join("\n"), lines.length);
    }
    if (ws.batchMode === "list") {
      const ids = tokens(resolveParamValue(getParam(command, "itemIds"), ws));
      return ids.length ? ok(ids.map((id) => `${command.command} ${uid.value} ${id}`).join("\n"), ids.length) : fail("请至少输入一个物品ID");
    }
    const start = Number(resolveParamValue(getParam(command, "rangeStart"), ws));
    const end = Number(resolveParamValue(getParam(command, "rangeEnd"), ws));
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      return fail("区间模式需要有效的起始ID和结束ID");
    }
    if (end < start) {
      return fail("结束ID不能小于起始ID");
    }
    if (end - start > 5000) {
      return fail("单次区间最多生成 5001 条命令");
    }
    const ids = [];
    for (let value = start; value <= end; value += 1) {
      ids.push(String(value));
    }
    return ok(ids.map((id) => `${command.command} ${uid.value} ${id}`).join("\n"), ids.length);
  }

  function buildAddItem(command, ws) {
    const uid = required(command, ws, "uid");
    if (!uid.ok) {
      return uid;
    }
    if (ws.batchMode === "single") {
      const itemIds = resolveParamValues(getParam(command, "itemId"), ws);
      const count = required(command, ws, "count");
      const bind = required(command, ws, "bind");
      if (!itemIds.length) {
        return fail("请填写“道具ID”");
      }
      if (!count.ok || !bind.ok) {
        return count.ok ? bind : count;
      }
      const lines = itemIds.map((itemId) => `${command.command} ${uid.value} ${itemId} ${count.value} ${bind.value}`);
      return ok(lines.join("\n"), lines.length);
    }
    const defaultCount = required(command, ws, "defaultCount");
    const defaultBind = required(command, ws, "defaultBind");
    if (!defaultCount.ok || !defaultBind.ok) {
      return defaultCount.ok ? defaultBind : defaultCount;
    }
    const lines = nonEmptyLines(resolveParamValue(getParam(command, "batchItems"), ws));
    if (!lines.length) {
      return fail("请至少输入一行道具数据");
    }
    const output = [];
    for (const line of lines) {
      const parts = line.split(/[\s,，;；]+/).filter(Boolean);
      if (parts.length > 3) {
        return fail(`批量道具格式错误：${line}`);
      }
      const itemId = parts[0];
      const count = parts[1] || defaultCount.value;
      const bind = parts[2] || defaultBind.value;
      output.push(`${command.command} ${uid.value} ${itemId} ${count} ${bind}`);
    }
    return ok(output.join("\n"), output.length);
  }

  function buildSendMail(command, ws) {
    const uid = required(command, ws, "uid");
    const count = required(command, ws, "count");
    if (!uid.ok || !count.ok) {
      return uid.ok ? count : uid;
    }
    const templateIds = resolveParamValues(getParam(command, "mailTemplateId"), ws);
    const itemIds = resolveParamValues(getParam(command, "itemId"), ws);
    if (!templateIds.length) {
      return fail("请填写“邮件模板ID”");
    }
    if (!itemIds.length) {
      return fail("请填写“附件道具ID”");
    }
    const lines = [];
    for (const templateId of templateIds) {
      for (const itemId of itemIds) {
        lines.push(`${command.command} ${uid.value} ${templateId} ${itemId} ${count.value}`);
      }
    }
    return ok(lines.join("\n"), lines.length);
  }

  function buildSendTemplateMail(command, ws) {
    const uid = required(command, ws, "uid");
    const templateId = required(command, ws, "mailTemplateId");
    if (!uid.ok || !templateId.ok) {
      return uid.ok ? templateId : uid;
    }

    const rawList = resolveParamValue(getParam(command, "itemList"), ws);
    const segments = String(rawList || "")
      .split(/[\r\n;；]+/)
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);

    if (!segments.length) {
      return fail("请填写“道具列表”");
    }

    const normalized = [];
    for (let index = 0; index < segments.length; index += 1) {
      const source = segments[index];
      const parts = source
        .split(/[\/,，]+/)
        .map((x) => String(x || "").trim())
        .filter(Boolean);
      if (parts.length !== 3) {
        return fail(`道具列表第 ${index + 1} 项格式错误，请使用 itemid/num/bind`);
      }
      const [itemId, count, bind] = parts;
      if (!/^\d+$/.test(itemId) || !/^\d+$/.test(count) || !/^\d+$/.test(bind)) {
        return fail(`道具列表第 ${index + 1} 项包含非法数字，请使用 itemid/num/bind`);
      }
      normalized.push(`${itemId}/${count}/${bind}`);
    }

    return ok(`${command.command} ${uid.value} ${templateId.value} ${normalized.join(";")}`, 1);
  }

  function buildSendCustomMail(command, ws) {
    const uid = required(command, ws, "uid");
    const title = required(command, ws, "title");
    const content = required(command, ws, "content");
    if (!uid.ok || !title.ok || !content.ok) {
      return uid.ok ? (title.ok ? content : title) : uid;
    }
    const itemSpec = resolveParamValue(getParam(command, "itemSpec"), ws);
    const extraArgs = resolveParamValue(getParam(command, "extraArgs"), ws);
    return ok([command.command, uid.value, title.value, content.value, itemSpec, extraArgs].filter(Boolean).join(" "), 1);
  }

  function buildRevokeMail(command, ws) {
    const uid = required(command, ws, "uid");
    const timestamp = required(command, ws, "timestamp");
    if (!uid.ok || !timestamp.ok) {
      return uid.ok ? timestamp : uid;
    }
    const itemPairs = resolveParamValue(getParam(command, "itemPairs"), ws);
    return ok([command.command, uid.value, timestamp.value, itemPairs].filter(Boolean).join(" "), 1);
  }

  function required(command, ws, key) {
    const p = getParam(command, key);
    const value = resolveParamValue(p, ws);
    return value ? { ok: true, value } : fail(`请填写“${p.label}”`);
  }

  function resolveParamValue(param, ws) {
    const values = resolveParamValues(param, ws);
    return values[0] || "";
  }

  function resolveParamValues(param, ws) {
    if (!param) {
      return [];
    }
    const mode = param.inputMode || param.type;
    if (mode === "picker_multi" || mode === "enum_multi") {
      const byStore = Array.isArray(ws.multiValues?.[param.key]) ? ws.multiValues[param.key] : [];
      const byRaw = byStore.length
        ? byStore
        : String(ws.values[param.key] || "")
          .split(/[\s,，;；]+/)
          .map((x) => x.trim())
          .filter(Boolean);
      return sortValuesByOptionOrder(byRaw, param, ws).map((x) => String(x || "").trim()).filter(Boolean);
    }
    const value = String(ws.values[param.key] ?? "").trim();
    const finalValue = !value && param.inheritGlobalUid ? String(state.userContext.currentUid || "").trim() : value;
    return finalValue ? [finalValue] : [];
  }

  function inferUid(command, ws) {
    const p = command.params.find((item) => item.key === "uid");
    return p ? resolveParamValue(p, ws) : "";
  }

  function getParam(command, key) {
    return command.params.find((p) => p.key === key);
  }

  function getPresets(commandId) {
    return state.personalData.presets.filter((item) => item.commandId === commandId);
  }

  function getCustomTemplates() {
    return normalizeCustomTemplates(state.personalData.customTemplates);
  }

  function getQuickCustomTemplates() {
    const templates = getCustomTemplates();
    const configured = normalizeCustomQuickTemplateIds(state.personalData.customQuickTemplateIds, templates);
    if (!configured.length) {
      return [];
    }
    const byId = new Map(templates.map((item) => [item.id, item]));
    return configured.map((id) => byId.get(id)).filter(Boolean);
  }

  function toggleCustomQuickTemplate(templateId) {
    const id = String(templateId || "").trim();
    if (!id) {
      return;
    }
    const templates = getCustomTemplates();
    const configured = normalizeCustomQuickTemplateIds(state.personalData.customQuickTemplateIds, templates);
    if (configured.includes(id)) {
      state.personalData.customQuickTemplateIds = configured.filter((x) => x !== id);
      return;
    }
    state.personalData.customQuickTemplateIds = [...configured, id].slice(0, 8);
  }

  function tokens(text) {
    return String(text || "").split(/[\s,，;；]+/).map((x) => x.trim()).filter(Boolean);
  }

  function nonEmptyLines(text) {
    return String(text || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  }

  function lineCount(text) {
    return String(text || "").trim() ? String(text).split(/\r?\n/).filter((x) => x.trim()).length : 0;
  }

  function ok(output, count) {
    return { ok: true, output, count };
  }

  function fail(message) {
    return { ok: false, message };
  }

  function setStatus(message, kind) {
    state.ui.status = { message, kind };
  }

  function clearStatus() {
    state.ui.status = null;
  }

  function toggleSection(sectionId) {
    if (!sectionId) {
      return;
    }
    const collapsed = isSectionCollapsed(sectionId, false);
    state.ui.collapsedSections = {
      ...(state.ui.collapsedSections || {}),
      [sectionId]: !collapsed
    };
  }

  function isSectionCollapsed(sectionId, defaultCollapsed) {
    const explicit = state.ui.collapsedSections?.[sectionId];
    if (typeof explicit === "boolean") {
      return explicit;
    }
    return defaultCollapsed;
  }

  function groupTitle(groupId) {
    return GROUPS.find((group) => group.id === groupId)?.title || groupId;
  }

  function riskLabel(risk) {
    return risk === "danger" ? "危险" : risk === "caution" ? "谨慎" : "常规";
  }

  function shortRisk(risk) {
    return risk === "danger" ? "危险" : risk === "caution" ? "谨慎" : "常用";
  }

  function badgeClass(risk) {
    return risk === "danger" ? "gm-helper-badge-danger" : risk === "caution" ? "gm-helper-badge-caution" : "gm-helper-badge-normal";
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function escapeForSelector(value) {
    if (window.CSS?.escape) {
      return window.CSS.escape(String(value ?? ""));
    }
    return String(value ?? "").replace(/["\\]/g, "\\$&");
  }

  function uniqStrings(values) {
    const seen = new Set();
    return (Array.isArray(values) ? values : []).reduce((result, value) => {
      const trimmed = String(value || "").trim();
      if (!trimmed || seen.has(trimmed)) {
        return result;
      }
      seen.add(trimmed);
      result.push(trimmed);
      return result;
    }, []);
  }

  function uniqCommandIds(values) {
    const seen = new Set();
    return (Array.isArray(values) ? values : []).reduce((result, value) => {
      if (!COMMAND_MAP.has(value) || seen.has(value)) {
        return result;
      }
      seen.add(value);
      result.push(value);
      return result;
    }, []);
  }

  function writeToTarget(text, appendMode) {
    const target = findWritableTarget();
    if (!target) {
      return false;
    }
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const nextValue = appendMode && target.value ? `${target.value}\n${text}` : text;
      target.focus();
      target.value = nextValue;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    if (target.isContentEditable) {
      const nextValue = appendMode && target.innerText ? `${target.innerText}\n${text}` : text;
      target.focus();
      target.innerText = nextValue;
      target.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }));
      return true;
    }
    return false;
  }

  function findWritableTarget() {
    const active = document.activeElement;
    if (isWritable(active) && !isHelperNode(active) && isVisible(active) && isLikelyCommandInput(active)) {
      return active;
    }
    if (isWritable(lastCommandInputTarget) && isVisible(lastCommandInputTarget)) {
      return lastCommandInputTarget;
    }
    const preferred = findPreferredCommandInput();
    if (preferred) {
      lastCommandInputTarget = preferred;
      return preferred;
    }
    if (isWritable(active) && !isHelperNode(active) && isVisible(active)) {
      return active;
    }
    if (isWritable(lastExternalWritableTarget) && isVisible(lastExternalWritableTarget)) {
      return lastExternalWritableTarget;
    }
    const nodes = [...document.querySelectorAll('textarea, input[type="text"], input[type="search"], input:not([type]), [contenteditable="true"]')];
    return nodes.find((node) => isWritable(node) && !isHelperNode(node) && isVisible(node)) || null;
  }

  function findPreferredCommandInput() {
    const selectors = [
      ".command-box textarea.el-textarea__inner",
      "textarea.el-textarea__inner[placeholder*='在这输入命令']",
      "textarea.el-textarea__inner[placeholder*='输入命令']",
      ".command-box textarea",
      "textarea[placeholder*='在这输入命令']",
      "textarea[placeholder*='输入命令']",
      "textarea[placeholder*='命令']",
      "input[placeholder*='命令']"
    ];

    const candidates = new Set();
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => candidates.add(node));
    });

    document.querySelectorAll("textarea, input[type='text'], input[type='search'], input:not([type]), [contenteditable='true']").forEach((node) => {
      candidates.add(node);
    });

    const ranked = [...candidates]
      .map((node) => ({ node, score: scoreCommandInputCandidate(node) }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score);

    if (ranked.length === 0) {
      return null;
    }

    return ranked[0].score >= 40 ? ranked[0].node : null;
  }

  function isLikelyCommandInput(node) {
    return scoreCommandInputCandidate(node) >= 40;
  }

  function scoreCommandInputCandidate(node) {
    if (!isWritable(node) || isHelperNode(node) || !isVisible(node)) {
      return 0;
    }

    const placeholder = String(node.getAttribute?.("placeholder") || "").trim();
    const className = typeof node.className === "string" ? node.className : "";
    const nodeId = String(node.id || "");
    const name = String(node.getAttribute?.("name") || "");
    const ariaLabel = String(node.getAttribute?.("aria-label") || "");
    const rect = node.getBoundingClientRect?.() || { width: 0, height: 0 };

    let score = 0;

    if (node instanceof HTMLTextAreaElement) {
      score += 20;
    }
    if (placeholder.includes("在这输入命令")) {
      score += 120;
    } else if (placeholder.includes("输入命令")) {
      score += 100;
    } else if (placeholder.includes("命令")) {
      score += 60;
    }

    if (ariaLabel.includes("命令")) {
      score += 40;
    }
    if (className.includes("el-textarea__inner")) {
      score += 25;
    }
    if (node.closest?.(".command-box")) {
      score += 80;
    }
    if (node.closest?.(".el-textarea")) {
      score += 12;
    }
    if (/command|cmd|gm/i.test(className)) {
      score += 24;
    }
    if (/command|cmd|gm/i.test(nodeId)) {
      score += 24;
    }
    if (/command|cmd|gm/i.test(name)) {
      score += 18;
    }
    if (rect.height >= 80) {
      score += 16;
    }
    if (rect.width >= 280) {
      score += 10;
    }

    return score;
  }

  function isWritable(node) {
    if (!node) {
      return false;
    }
    if (node instanceof HTMLTextAreaElement) {
      return !node.readOnly && !node.disabled;
    }
    if (node instanceof HTMLInputElement) {
      const type = (node.type || "text").toLowerCase();
      return ["text", "search", "url", "email", "number", "tel", "password"].includes(type) && !node.readOnly && !node.disabled;
    }
    return Boolean(node.isContentEditable);
  }

  function isVisible(node) {
    if (!node?.getBoundingClientRect) {
      return false;
    }
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  }

  function isHelperNode(node) {
    return Boolean(node?.closest?.("#gm-helper-sidebar, #gm-helper-fab"));
  }
})();

