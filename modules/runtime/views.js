(function () {
  const root = window.__gmHelperRuntime = window.__gmHelperRuntime || {};

  root.createRuntimeViews = function createRuntimeViews(runtime) {
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

    function renderInfoRow(label, value) {
      return `<div class="gm-helper-info-row"><span class="gm-helper-info-label">${runtime.escapeHtml(label)}</span><span class="gm-helper-info-value">${runtime.escapeHtml(value)}</span></div>`;
    }

    function renderUpdateCheckPanel(extensionVersion) {
      const update = runtime.getUpdateCheckState();
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
      ${update.lastError ? `<div class="gm-helper-empty">最近一次检查失败：${runtime.escapeHtml(update.lastError)}</div>` : ""}
      <div class="gm-helper-button-row">
        <button type="button" class="gm-helper-button gm-helper-button-accent" data-action="update-check-now">立即检查更新</button>
        <button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="open-release-page" data-url="${runtime.escapeHtml(update.latestUrlResolved)}">打开 Release 页面</button>
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
      const binding = runtime.state.personalData.externalCatalogBindings?.[slot] || null;
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
          <div class="gm-helper-template-title">${runtime.escapeHtml(title)}</div>
          <span class="gm-helper-badge ${statusClass}">${runtime.escapeHtml(status)}</span>
        </div>
        <div class="gm-helper-inline-tip">${runtime.escapeHtml(fileName)}</div>
        <div class="gm-helper-source-state ${effectiveClass}">
          <div class="gm-helper-source-state-title">${runtime.escapeHtml(effective.title)}</div>
          <div class="gm-helper-source-state-desc">${runtime.escapeHtml(effective.detail)}</div>
        </div>
        <div class="gm-helper-inline-tip">${runtime.escapeHtml(getExternalBindingActiveHint(binding))}</div>
        <div class="gm-helper-info-list gm-helper-external-info-list">
          ${renderInfoRow("最近成功刷新", formatDateTimeLabel(binding?.lastImportedAt))}
          ${renderInfoRow("解析条数", entryCount ? `${entryCount} 条` : "0 条")}
          ${renderInfoRow("来源", sourceHint || "项目内手动选择")}
        </div>
        ${binding?.lastStatus === "error" && binding?.lastError ? `<div class="gm-helper-empty">最近一次刷新失败：${runtime.escapeHtml(binding.lastError)}。${binding.lastImportedAt ? "当前继续沿用上次成功快照。" : "当前已回退使用内置词典。"} </div>` : ""}
        <div class="gm-helper-button-row">
          <button type="button" class="gm-helper-button gm-helper-button-accent" data-action="bind-external-slot" data-slot="${runtime.escapeHtml(slot)}">${binding ? "重新选择文件" : "选择文件并绑定"}</button>
          <button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="refresh-external-slot" data-slot="${runtime.escapeHtml(slot)}">${binding ? "刷新" : "选择后刷新"}</button>
          <button type="button" class="gm-helper-button gm-helper-button-danger" data-action="clear-external-slot" data-slot="${runtime.escapeHtml(slot)}" ${binding ? "" : "disabled"}>解除绑定</button>
        </div>
        <input id="gm-helper-external-input-${runtime.escapeHtml(slot)}" data-field="externalCatalogFile" data-slot="${runtime.escapeHtml(slot)}" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="gm-helper-hidden-file-input" />
      </div>
    `;
    }

    return {
      renderLibraryTop(command) {
        const recentUidChips = runtime.state.userContext.recentUids.slice(0, 6);
        return `
      <section class="gm-helper-panel gm-helper-top-panel">
        <div class="gm-helper-top-grid">
          <div class="gm-helper-field gm-helper-field-grow">
            <label class="gm-helper-label" for="gm-helper-search">搜你要做什么</label>
            <input id="gm-helper-search" class="gm-helper-input" data-field="searchQuery" placeholder="例如：刷物品、邮箱、加钻石、查玩家" value="${runtime.escapeHtml(runtime.state.ui.searchQuery)}" />
          </div>
          <div class="gm-helper-field">
            <label class="gm-helper-label" for="gm-helper-current-uid">当前 UID</label>
            <input id="gm-helper-current-uid" class="gm-helper-input" data-field="currentUid" placeholder="例如 11980" value="${runtime.escapeHtml(runtime.state.userContext.currentUid)}" />
          </div>
        </div>
        <div class="gm-helper-chip-row">
          ${runtime.state.userContext.lastCommandId ? `<button type="button" class="gm-helper-chip gm-helper-chip-ghost" data-action="use-last-command">继续上次：${runtime.escapeHtml(runtime.commandMap.get(runtime.state.userContext.lastCommandId).title)}</button>` : ""}
          <button type="button" class="gm-helper-chip gm-helper-chip-ghost" data-action="switch-tab" data-tab="settings">设置</button>
          <span class="gm-helper-top-hint">${command && command.params.some((p) => p.key === "uid") ? "当前命令可直接复用顶部 UID" : "建议先设置 UID，再进入命令工作台。"}</span>
        </div>
        ${recentUidChips.length ? `<div class="gm-helper-subtitle">最近 UID</div><div class="gm-helper-chip-row">${recentUidChips.map((uid) => `<button type="button" class="gm-helper-chip" data-action="use-uid" data-uid="${runtime.escapeHtml(uid)}">${runtime.escapeHtml(uid)}</button>`).join("")}</div>` : ""}
      </section>
    `;
      },
      renderSearchSuggestionPanel(suggestions) {
        const itemSuggestions = Array.isArray(suggestions?.items) ? suggestions.items : [];
        const commandSuggestions = Array.isArray(suggestions?.commands) ? suggestions.commands : [];
        const hasItemHits = itemSuggestions.length > 0;
        const selectedItemIds = runtime.getSelectedSuggestionItemIds(suggestions);
        const selectedSet = new Set(selectedItemIds);
        return `
      <section class="gm-helper-panel gm-helper-suggestion-panel">
        <div class="gm-helper-section-head">
          <div>
            <div class="gm-helper-section-title">搜索推荐</div>
            <div class="gm-helper-section-desc">先勾选道具，再统一选择操作；不会默认替你预填某一个物品。</div>
          </div>
        </div>
        <div class="gm-helper-suggest-grid">
          <div class="gm-helper-suggest-block">
            <div class="gm-helper-subtitle">推荐操作</div>
            ${commandSuggestions.length
            ? `<div class="gm-helper-chip-row gm-helper-suggest-op-row">${commandSuggestions.map((row) => `<button type="button" class="gm-helper-chip" data-action="open-suggested-command" data-command-id="${runtime.escapeHtml(row.commandId)}">${runtime.escapeHtml(row.title)}</button>`).join("")}</div>${commandSuggestions[0].reason ? `<div class="gm-helper-inline-tip">${runtime.escapeHtml(commandSuggestions[0].reason)}</div>` : ""}`
            : '<div class="gm-helper-empty">未命中推荐操作，请继续输入更精确关键词。</div>'}
          </div>
          <div class="gm-helper-suggest-block">
            <div class="gm-helper-picker-head">
              <div class="gm-helper-subtitle">推荐道具</div>
              ${hasItemHits ? `<div class="gm-helper-picker-head-actions"><button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="suggestion-select-all">全选当前结果</button><button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="suggestion-invert">反选</button><button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="suggestion-clear">清空</button></div>` : ""}
            </div>
            ${hasItemHits
            ? `<div class="gm-helper-inline-tip">当前已选 ${selectedItemIds.length} 项。勾选后可统一带入下方高频物品操作。</div><div class="gm-helper-chip-row gm-helper-suggest-op-row"><button type="button" class="gm-helper-chip" data-action="apply-suggestion-items-action" data-command-id="add_item" ${selectedItemIds.length ? "" : "disabled"}>背包加道具</button><button type="button" class="gm-helper-chip" data-action="apply-suggestion-items-action" data-command-id="summon_item" ${selectedItemIds.length ? "" : "disabled"}>局内刷物品</button></div><div class="gm-helper-suggest-item-list">${itemSuggestions.map((item) => {
              const itemId = String(item.itemId || "");
              const checked = selectedSet.has(itemId);
              return `<button type="button" class="gm-helper-suggest-item gm-helper-suggest-item-select ${checked ? "gm-helper-suggest-item-expanded" : ""}" data-action="toggle-suggestion-item" data-item-id="${runtime.escapeHtml(itemId)}"><div class="gm-helper-suggest-item-main"><div class="gm-helper-suggest-item-title">${runtime.escapeHtml(itemId)} ${runtime.escapeHtml(item.name)}</div><div class="gm-helper-suggest-item-meta">${runtime.escapeHtml(item.path)}</div></div><span class="gm-helper-picker-check ${checked ? "gm-helper-picker-check-on" : ""}">${checked ? "✓" : ""}</span></button>`;
            }).join("")}</div>`
            : `<div class="gm-helper-empty">当前词典未命中该道具。</div><div class="gm-helper-button-row"><button type="button" id="gm-helper-import-guide-btn" class="gm-helper-button gm-helper-button-secondary" data-action="goto-settings-import">前往设置页导入 Item.xlsx</button></div>`}
          </div>
        </div>
      </section>
    `;
      },
      renderSettingsTab() {
        const imported = runtime.state.personalData.importedCatalogs || {};
        const importCount = (imported.items?.length || 0) + (imported.mail?.length || 0) + (imported.tasks?.length || 0) + (imported.common?.length || 0);
        const catalogMeta = importCount ? `已导入 ${importCount} 条词典` : "使用内置词典";
        const warnings = runtime.getCatalogLoadWarnings();
        const warningMeta = warnings.length ? `（${warnings.length} 项加载失败）` : "";
        const extensionVersion = runtime.state.ui.runtimeInvalidated ? "unknown" : runtime.getExtensionVersionSafe();
        const customTemplates = runtime.getCustomTemplates();
        const quickTemplateIds = new Set(runtime.normalizeCustomQuickTemplateIds(runtime.state.personalData.customQuickTemplateIds, customTemplates));
        const draft = runtime.normalizeCustomTemplateDraft(runtime.state.ui.customTemplateDraft);
        return `
      ${runtime.renderCollapsibleSection({
        id: "settings-version-update",
        title: "版本更新",
        desc: "每日自动检测一次，也可手动立即检查。",
        defaultCollapsed: true,
        body: renderUpdateCheckPanel(extensionVersion)
      })}

      ${runtime.renderCollapsibleSection({
        id: "settings-external-catalogs",
        title: "外部数据源",
        desc: "可直接绑定项目内的 Item.xlsx、Email.xlsx、Task.xlsx。表更新后手动点击刷新；刷新失败时继续沿用上次成功快照。控制台里的 HTTP 404 更可能是内置词典告警，请以这里每个槽位的“当前生效”状态为准。",
        defaultCollapsed: false,
        body: `<div class="gm-helper-template-list gm-helper-external-slot-list">${renderExternalCatalogSlot("item", "Item.xlsx")}${renderExternalCatalogSlot("email", "Email.xlsx")}${renderExternalCatalogSlot("tasks", "Task.xlsx")}</div>`
      })}

      ${runtime.renderCollapsibleSection({
        id: "settings-advanced-import",
        title: "高级导入",
        desc: "用于调试或临时覆盖词典，不作为日常主数据源。",
        defaultCollapsed: true,
        body: `<div class="gm-helper-button-row gm-helper-import-row"><button type="button" id="gm-helper-import-btn" class="gm-helper-button gm-helper-button-secondary" data-action="open-import">导入词典(Item/Email .xlsx/.json)</button><input id="gm-helper-import-input" data-field="importFile" type="file" accept=".xlsx,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="gm-helper-hidden-file-input" /><span class="gm-helper-inline-tip">当前词典：${runtime.escapeHtml(catalogMeta)}${warningMeta ? ` ${runtime.escapeHtml(warningMeta)}` : ""}</span></div>${warnings.length ? `<div class="gm-helper-empty">存在 ${warnings.length} 项词典加载告警，详情请查看控制台日志。</div>` : ""}`
      })}

      ${runtime.renderCollapsibleSection({
        id: "settings-custom-templates",
        title: "自定义命令模板",
        desc: "粘贴多行命令并命名保存。可开启 UID 占位符替换（支持 {{uid}} / {uid} / 用户ID / 角色UID）。并可管理顶部“自定义快捷”入口。",
        defaultCollapsed: true,
        body: `<div class="gm-helper-form-grid"><div class="gm-helper-field gm-helper-field-grow"><label class="gm-helper-label" for="gm-helper-custom-name">模板名称</label><input id="gm-helper-custom-name" class="gm-helper-input" data-field="customTemplateName" placeholder="例如：日常补偿包" value="${runtime.escapeHtml(draft.name)}" /></div><div class="gm-helper-field gm-helper-field-grow"><label class="gm-helper-label" for="gm-helper-custom-content">命令文本</label><textarea id="gm-helper-custom-content" class="gm-helper-textarea" data-field="customTemplateContent" placeholder="支持多行命令，一行一条">${runtime.escapeHtml(draft.content)}</textarea></div></div><label class="gm-helper-item-cross gm-helper-template-switch"><input type="checkbox" data-field="customTemplateReplaceUid" ${draft.replaceUid ? "checked" : ""} /><span>使用顶部当前 UID 替换占位符</span></label><div class="gm-helper-button-row"><button type="button" class="gm-helper-button gm-helper-button-accent" data-action="save-custom-template">保存模板</button></div>${customTemplates.length ? `<div class="gm-helper-subtitle">已保存模板</div><div class="gm-helper-template-list">${customTemplates.map((template) => { const previewLine = runtime.nonEmptyLines(template.content || "")[0] || ""; const preview = previewLine.length > 72 ? `${previewLine.slice(0, 72)}...` : previewLine; const pinned = quickTemplateIds.has(template.id); return `<div class="gm-helper-template-item"><div class="gm-helper-template-head"><div class="gm-helper-template-title">${runtime.escapeHtml(template.name)}</div><span class="gm-helper-badge ${template.replaceUid ? "gm-helper-badge-caution" : "gm-helper-badge-normal"}">${template.replaceUid ? "UID替换" : "原样"}</span></div><div class="gm-helper-inline-tip">${runtime.escapeHtml(preview || "（空模板）")}</div><div class="gm-helper-button-row"><button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="apply-custom-template" data-template-id="${runtime.escapeHtml(template.id)}">填入后台</button><button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="append-custom-template" data-template-id="${runtime.escapeHtml(template.id)}">追加</button><button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="toggle-custom-quick" data-template-id="${runtime.escapeHtml(template.id)}">${pinned ? "移出顶部快捷" : "加入顶部快捷"}</button><button type="button" class="gm-helper-button gm-helper-button-danger" data-action="delete-custom-template" data-template-id="${runtime.escapeHtml(template.id)}">删除</button></div></div>`; }).join("")}</div>` : `<div class="gm-helper-empty">暂无自定义模板。可先粘贴一组命令并保存，后续点击一次即可直接填入后台输入框。</div>`}`
      })}

      <section class="gm-helper-panel">
        <div class="gm-helper-section-head">
          <div>
            <div class="gm-helper-section-title">开发者信息</div>
            <div class="gm-helper-section-desc">如需反馈问题或提交需求，请通过内部渠道联系。</div>
          </div>
        </div>
        <div class="gm-helper-info-list">
          ${renderInfoRow("团队", runtime.developerInfo.team)}
          ${renderInfoRow("维护项目", runtime.developerInfo.maintainer)}
          ${renderInfoRow("联系渠道", runtime.developerInfo.contact)}
        </div>
      </section>

      <section class="gm-helper-panel">
        <div class="gm-helper-section-head">
          <div>
            <div class="gm-helper-section-title">后续接入说明</div>
            <div class="gm-helper-section-desc">${runtime.escapeHtml(runtime.futureAccessNote)}</div>
          </div>
        </div>
      </section>
    `;
      },
      renderWorkspace(command, ws) {
        return `
      ${runtime.renderCollapsibleSection({
        id: `workspace-summary-${command.id}`,
        title: command.title,
        desc: command.description,
        defaultCollapsed: false,
        panelClass: command.risk === "danger" ? "gm-helper-risk-danger" : command.risk === "caution" ? "gm-helper-risk-caution" : "",
        rightMeta: `<span class="gm-helper-badge ${runtime.badgeClass(command.risk)}">${runtime.escapeHtml(runtime.riskLabel(command.risk))}</span>`,
        body: `<div class="gm-helper-command-name">${runtime.escapeHtml(command.command)}</div><div class="gm-helper-inline-tip">适用场景：${runtime.escapeHtml(command.useCases)}</div><div class="gm-helper-button-row"><button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="toggle-favorite" data-command-id="${command.id}">${runtime.state.personalData.favorites.includes(command.id) ? "取消收藏" : "加入收藏"}</button></div>`
      })}

      ${runtime.renderCollapsibleSection({
        id: `workspace-form-${command.id}`,
        title: "参数表单",
        desc: "参数顺序已固定，可减少手动拼接命令时的遗漏与格式错误。",
        defaultCollapsed: false,
        body: `${command.batchModes ? `<div class="gm-helper-mode-row">${command.batchModes.map((mode) => `<button type="button" class="gm-helper-mode-btn ${ws.batchMode === mode.id ? "gm-helper-mode-btn-active" : ""}" data-action="set-batch-mode" data-command-id="${command.id}" data-mode="${mode.id}">${runtime.escapeHtml(mode.label)}</button>`).join("")}</div>` : ""}<div class="gm-helper-form-grid">${command.params.filter((p) => runtime.shouldShowParam(p, ws.batchMode)).map((p) => runtime.renderField(command, ws, p)).join("")}</div>`
      })}

      ${runtime.renderCollapsibleSection({
        id: `workspace-output-${command.id}`,
        title: "结果预览",
        desc: "生成结果可复制、填入或追加至后台输入框；默认不自动发送。",
        defaultCollapsed: false,
        rightMeta: `<div class="gm-helper-result-meta">共 ${runtime.lineCount(ws.output)} 条命令</div>`,
        body: `<textarea class="gm-helper-textarea gm-helper-output" data-field="workspace-output" data-command-id="${command.id}" placeholder="点击“生成命令”后显示在这里">${runtime.escapeHtml(ws.output)}</textarea><div class="gm-helper-button-row"><button type="button" class="gm-helper-button gm-helper-button-accent" data-action="generate" data-command-id="${command.id}">生成命令</button><button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="copy" data-command-id="${command.id}">复制</button><button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="fill" data-command-id="${command.id}">填入后台</button><button type="button" class="gm-helper-button gm-helper-button-secondary" data-action="append" data-command-id="${command.id}">追加到后台</button><button type="button" class="gm-helper-button gm-helper-button-ghost" data-action="clear-output" data-command-id="${command.id}">清空结果</button></div>`
      })}
    `;
      }
    };
  };
})();

