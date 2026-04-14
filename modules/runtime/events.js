(function () {
  const root = window.__gmHelperRuntime = window.__gmHelperRuntime || {};

  root.createEventMaps = function createEventMaps() {
    const clickActionMap = {
      close: async (ctx) => {
        document.getElementById("gm-helper-sidebar")?.classList.remove("gm-helper-open");
      },
      "switch-tab": async (ctx, payload) => {
        const tab = String(payload.node.dataset.tab || "");
        if (["library", "settings"].includes(tab)) {
          ctx.state.ui.tab = tab;
          if (tab === "library") {
            ctx.state.ui.libraryView = "list";
          } else {
            void ctx.services.versionService.maybeAutoCheckLatestRelease();
          }
        }
        ctx.clearItemActionMenu();
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "goto-settings-import": async (ctx) => {
        ctx.state.ui.tab = "settings";
        ctx.state.ui.collapsedSections = {
          ...(ctx.state.ui.collapsedSections || {}),
          "settings-advanced-import": false
        };
        ctx.clearItemActionMenu();
        ctx.clearStatus();
        ctx.render();
        ctx.focusImportEntry();
        await ctx.persistState();
      },
      "goto-settings-custom": async (ctx) => {
        ctx.state.ui.tab = "settings";
        ctx.state.ui.collapsedSections = {
          ...(ctx.state.ui.collapsedSections || {}),
          "settings-custom-templates": false
        };
        ctx.clearItemActionMenu();
        ctx.clearStatus();
        ctx.render();
        ctx.focusCustomTemplateEntry();
        await ctx.persistState();
      },
      "go-library-list": async (ctx) => {
        ctx.state.ui.tab = "library";
        ctx.state.ui.libraryView = "list";
        ctx.clearItemActionMenu();
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "open-item-action-menu": async (ctx, payload) => {
        const itemId = String(payload.node.dataset.itemId || "").trim();
        const itemName = String(payload.node.dataset.itemName || "").trim();
        const currentId = String(ctx.state.ui.itemActionMenu?.itemId || "");
        if (!itemId) {
          return;
        }
        if (currentId === itemId) {
          ctx.clearItemActionMenu();
        } else {
          ctx.setItemActionMenu(itemId, itemName);
        }
        ctx.clearStatus();
        ctx.render();
      },
      "choose-item-action": async (ctx, payload) => {
        const targetCommandId = String(payload.node.dataset.commandId || "");
        const itemId = String(payload.node.dataset.itemId || "").trim();
        if (!ctx.commandMap.has(targetCommandId) || !itemId) {
          return;
        }
        ctx.clearItemActionMenu();
        ctx.resetWorkspaceForSuggestion(targetCommandId);
        ctx.openWorkspace(targetCommandId);
        ctx.applyItemSuggestionToCommand(targetCommandId, itemId);
        ctx.setStatus(`已打开命令并预填道具 ${itemId}`, "success");
        ctx.render();
        await ctx.persistState();
      },
      "toggle-suggestion-item": async (ctx, payload) => {
        const itemId = String(payload.node.dataset.itemId || "").trim();
        if (!itemId) {
          return;
        }
        const current = new Set(ctx.normalizeSuggestionSelection(ctx.state.ui.suggestionSelection));
        if (current.has(itemId)) {
          current.delete(itemId);
        } else {
          current.add(itemId);
        }
        ctx.state.ui.suggestionSelection = Array.from(current);
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "suggestion-select-all": async (ctx) => {
        ctx.state.ui.suggestionSelection = ctx.normalizeSuggestionSelection((ctx.state.ui.searchSuggestions?.items || []).map((item) => item.itemId));
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "suggestion-invert": async (ctx) => {
        const availableIds = ctx.normalizeSuggestionSelection((ctx.state.ui.searchSuggestions?.items || []).map((item) => item.itemId));
        const selected = new Set(ctx.normalizeSuggestionSelection(ctx.state.ui.suggestionSelection));
        ctx.state.ui.suggestionSelection = availableIds.filter((itemId) => !selected.has(itemId));
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "suggestion-clear": async (ctx) => {
        ctx.clearSuggestionSelection();
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "apply-suggestion-items-action": async (ctx, payload) => {
        const targetCommandId = String(payload.node.dataset.commandId || "").trim();
        const selectedItemIds = ctx.getSelectedSuggestionItemIds(ctx.state.ui.searchSuggestions);
        if (!ctx.commandMap.has(targetCommandId)) {
          return;
        }
        if (!selectedItemIds.length) {
          ctx.setStatus("请先勾选要处理的道具。", "error");
          ctx.render();
          await ctx.persistState();
          return;
        }
        ctx.clearItemActionMenu();
        ctx.resetWorkspaceForSuggestion(targetCommandId);
        ctx.openWorkspace(targetCommandId);
        ctx.applyItemSuggestionToCommand(targetCommandId, selectedItemIds);
        ctx.setStatus(`已打开命令并预填 ${selectedItemIds.length} 个道具`, "success");
        ctx.render();
        await ctx.persistState();
      },
      "open-suggested-command": async (ctx, payload) => {
        const targetCommandId = String(payload.node.dataset.commandId || "");
        if (!ctx.commandMap.has(targetCommandId)) {
          return;
        }
        ctx.clearItemActionMenu();
        ctx.resetWorkspaceForSuggestion(targetCommandId);
        ctx.openWorkspace(targetCommandId);
        const selectedItemIds = ctx.getSelectedSuggestionItemIds(ctx.state.ui.searchSuggestions);
        if (selectedItemIds.length) {
          ctx.applyItemSuggestionToCommand(targetCommandId, selectedItemIds);
        }
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "open-command": async (ctx, payload) => {
        ctx.openWorkspace(payload.commandId);
        await ctx.persistState();
      },
      "save-custom-template": async (ctx) => {
        ctx.saveCustomTemplateDraft();
        ctx.render();
        await ctx.persistState();
      },
      "toggle-custom-quick": async (ctx, payload) => {
        const templateId = String(payload.node.dataset.templateId || "").trim();
        if (!templateId) {
          return;
        }
        ctx.toggleCustomQuickTemplate(templateId);
        ctx.setStatus("已更新顶部快捷入口配置", "success");
        ctx.render();
        await ctx.persistState();
      },
      "delete-custom-template": async (ctx, payload) => {
        const templateId = String(payload.node.dataset.templateId || "").trim();
        if (!templateId) {
          return;
        }
        ctx.deleteCustomTemplate(templateId);
        ctx.render();
        await ctx.persistState();
      },
      "apply-custom-template": async (ctx, payload) => {
        const templateId = String(payload.node.dataset.templateId || "").trim();
        await ctx.applyCustomTemplate(templateId, false);
        await ctx.persistState();
      },
      "append-custom-template": async (ctx, payload) => {
        const templateId = String(payload.node.dataset.templateId || "").trim();
        await ctx.applyCustomTemplate(templateId, true);
        await ctx.persistState();
      },
      "bind-external-slot": async (ctx, payload) => {
        const slot = String(payload.node.dataset.slot || "").trim();
        const input = document.getElementById(`gm-helper-external-input-${slot}`);
        if (input) {
          input.value = "";
          input.click();
        }
      },
      "refresh-external-slot": async (ctx, payload) => {
        const slot = String(payload.node.dataset.slot || "").trim();
        const input = document.getElementById(`gm-helper-external-input-${slot}`);
        if (input) {
          input.value = "";
          input.click();
        }
      },
      "clear-external-slot": async (ctx, payload) => {
        const slot = String(payload.node.dataset.slot || "").trim();
        await ctx.clearExternalCatalogSlot(slot);
        ctx.render();
        await ctx.persistState();
      },
      "open-import": async () => {
        const input = document.getElementById("gm-helper-import-input");
        if (input) {
          input.value = "";
          input.click();
        }
      },
      "update-check-now": async (ctx) => {
        const result = await ctx.services.versionService.checkLatestRelease({ force: true, trigger: "manual", allowModal: true });
        if (result.status === "updateAvailable") {
          ctx.setStatus(`发现新版本 ${result.latestVersion || result.latestTag}，可前往 Release 页面更新`, "success");
        } else if (result.status === "upToDate") {
          ctx.openUpToDateModal(result);
          ctx.setStatus("已是最新版本", "success");
        } else if (result.status === "incomparable") {
          ctx.setStatus("版本格式无法比较，请确认 manifest.version 与 tag 格式", "error");
        } else {
          ctx.setStatus(`检查更新失败：${result.error || "未知错误"}`, "error");
        }
        ctx.render();
        await ctx.persistState();
      },
      "open-release-page": async (ctx, payload) => {
        const targetUrl = String(payload.node.dataset.url || "").trim();
        ctx.openReleasePage(targetUrl || ctx.services.versionService.getReleasePageUrl());
      },
      "dismiss-update-modal": async (ctx) => {
        ctx.dismissUpdateModal();
        ctx.render();
        await ctx.persistState();
      },
      "toggle-favorite": async (ctx, payload) => {
        ctx.toggleFavorite(payload.commandId);
        ctx.render();
        await ctx.persistState();
      },
      "toggle-section": async (ctx, payload) => {
        ctx.toggleSection(payload.node.dataset.sectionId);
        ctx.render();
        await ctx.persistState();
      },
      "use-uid": async (ctx, payload) => {
        ctx.state.userContext.currentUid = payload.node.dataset.uid || "";
        ctx.pushUid(ctx.state.userContext.currentUid);
        ctx.render();
        await ctx.persistState();
      },
      "use-last-command": async (ctx) => {
        ctx.openWorkspace(ctx.state.userContext.lastCommandId);
        await ctx.persistState();
      },
      "set-batch-mode": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        const ws = ctx.ensureWorkspace(payload.commandId);
        ws.batchMode = payload.node.dataset.mode || ws.batchMode;
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      generate: async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        const result = payload.command.build(payload.command, ctx.ensureWorkspace(payload.commandId));
        if (!result.ok) {
          ctx.setStatus(result.message, "error");
        } else {
          if (result.count > 200 && !ctx.confirm(`本次将生成 ${result.count} 条命令，确认继续吗？`)) {
            ctx.setStatus("已取消生成", "error");
            ctx.render();
            return;
          }
          const ws = ctx.ensureWorkspace(payload.commandId);
          ws.output = result.output;
          ctx.touchCommand(payload.commandId);
          const uid = ctx.inferUid(payload.command, ws);
          if (uid) {
            ctx.pushUid(uid);
          }
          ctx.setStatus(`已生成 ${result.count} 条命令`, "success");
        }
        ctx.render();
        await ctx.persistState();
      },
      copy: async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        await ctx.copyOutput(payload.command);
        await ctx.persistState();
      },
      fill: async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        await ctx.writeOutput(payload.command, false);
        await ctx.persistState();
      },
      append: async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        await ctx.writeOutput(payload.command, true);
        await ctx.persistState();
      },
      "clear-output": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        ctx.ensureWorkspace(payload.commandId).output = "";
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "save-preset": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        ctx.savePreset(payload.command);
        ctx.render();
        await ctx.persistState();
      },
      "load-preset": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        ctx.loadPreset(payload.command);
        ctx.render();
        await ctx.persistState();
      },
      "delete-preset": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        ctx.deletePreset(payload.command);
        ctx.render();
        await ctx.persistState();
      },
      "fill-backend-search": async (ctx) => {
        await ctx.sendToBackendInput(ctx.state.ui.searchQuery.trim());
        await ctx.persistState();
      },
      "picker-toggle-option": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        ctx.togglePickerOption(payload.command, payload.node.dataset.key, payload.node.dataset.value);
        const ws = ctx.ensureWorkspace(payload.command.id);
        ws.pickerCursor[payload.node.dataset.key] = Math.max(0, Number(payload.node.dataset.optionIndex || 0));
        ctx.render();
        await ctx.persistState();
      },
      "picker-clear": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        ctx.clearPickerSelections(payload.command, payload.node.dataset.key);
        ctx.render();
        await ctx.persistState();
      },
      "picker-select-all": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        ctx.selectAllPickerOptions(payload.command, payload.node.dataset.key);
        ctx.render();
        await ctx.persistState();
      },
      "picker-invert": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        ctx.invertPickerOptions(payload.command, payload.node.dataset.key);
        ctx.render();
        await ctx.persistState();
      },
      "mail-template-add-selected": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        const key = String(payload.node.dataset.key || "").trim();
        if (!key) {
          return;
        }
        const ws = ctx.ensureWorkspace(payload.command.id);
        const selectedIds = ctx.getMultiValues(ws, key);
        if (!selectedIds.length) {
          ctx.setStatus("请先勾选要加入的道具", "error");
          ctx.render();
          await ctx.persistState();
          return;
        }
        const rows = ctx.getMailTemplateRows(ws, key);
        const existing = new Set(rows.map((row) => `${row.itemId}:${row.bind}`));
        let addedCount = 0;
        selectedIds.forEach((itemId) => {
          const keyId = `${itemId}:0`;
          if (existing.has(keyId)) {
            return;
          }
          rows.push({ itemId, count: "1", bind: "0", name: ctx.resolveMailItemName(itemId) });
          existing.add(keyId);
          addedCount += 1;
        });
        ctx.setMailTemplateRows(ws, key, rows);
        ws.multiValues[key] = [];
        ws.output = "";
        ctx.setStatus(addedCount ? `已加入 ${addedCount} 个道具到附件列表` : "所选道具已在附件列表中", "success");
        ctx.render();
        await ctx.persistState();
      },
      "mail-template-remove-item": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        const key = String(payload.node.dataset.key || "").trim();
        const itemId = String(payload.node.dataset.itemId || "").trim();
        const bind = String(payload.node.dataset.bind || "0").trim() === "1" ? "1" : "0";
        if (!key || !itemId) {
          return;
        }
        const ws = ctx.ensureWorkspace(payload.command.id);
        const rows = ctx.getMailTemplateRows(ws, key).filter((row) => !(row.itemId === itemId && row.bind === bind));
        ctx.setMailTemplateRows(ws, key, rows);
        ws.output = "";
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "mail-template-clear-items": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        const key = String(payload.node.dataset.key || "").trim();
        if (!key) {
          return;
        }
        const ws = ctx.ensureWorkspace(payload.command.id);
        ctx.setMailTemplateRows(ws, key, []);
        ws.multiValues[key] = [];
        ws.output = "";
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "item-picker-set-scope": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        const ws = ctx.ensureWorkspace(payload.command.id);
        const param = ctx.getParam(payload.command, payload.node.dataset.key);
        if (param) {
          const filter = ctx.getItemPickerFilterState(ws, param);
          filter.scope = String(payload.node.dataset.scope || filter.scope || "in-game");
          filter.typeId = "";
          filter.subTypeId = "";
          filter.crossScope = false;
        }
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      "item-picker-open-extended": async (ctx, payload) => {
        if (!payload.command) {
          return;
        }
        const ws = ctx.ensureWorkspace(payload.command.id);
        const param = ctx.getParam(payload.command, payload.node.dataset.key);
        if (param) {
          const filter = ctx.getItemPickerFilterState(ws, param);
          filter.scope = "out-game";
          filter.typeId = "__extended__";
          filter.subTypeId = "";
          filter.crossScope = false;
        }
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      }
    };

    const inputFieldMap = {
      searchQuery: async (ctx, payload) => {
        const target = payload.target;
        ctx.state.ui.searchQuery = target.value;
        ctx.clearSuggestionSelection();
        ctx.clearItemActionMenu();
        ctx.clearStatus();
        if (ctx.isSearchComposing() || target.dataset.composing === "1") {
          return;
        }
        ctx.render();
        ctx.focusSearchInput(target.value);
        await ctx.persistState();
      },
      currentUid: async (ctx, payload) => {
        ctx.state.userContext.currentUid = payload.target.value;
        ctx.clearStatus();
        await ctx.persistState();
      },
      customTemplateName: async (ctx, payload) => {
        ctx.state.ui.customTemplateDraft.name = payload.target.value;
        ctx.clearStatus();
        await ctx.persistState();
      },
      customTemplateContent: async (ctx, payload) => {
        ctx.state.ui.customTemplateDraft.content = payload.target.value;
        ctx.clearStatus();
        await ctx.persistState();
      },
      pickerQuery: async (ctx, payload) => {
        const target = payload.target;
        const ws = ctx.ensureWorkspace(target.dataset.commandId);
        ws.pickerQueries[target.dataset.key] = target.value;
        ws.pickerCursor[target.dataset.key] = 0;
        ctx.clearStatus();
        const key = ctx.buildPickerComposeKey(target.dataset.commandId, target.dataset.key);
        if (payload.event.isComposing || target.dataset.composing === "1" || ctx.getPickerComposingKey() === key) {
          await ctx.persistState();
          return;
        }
        ctx.render();
        ctx.focusPickerInput(target.dataset.commandId, target.dataset.key, target.value);
        await ctx.persistState();
      },
      "workspace-param": async (ctx, payload) => {
        const target = payload.target;
        ctx.ensureWorkspace(target.dataset.commandId).values[target.dataset.key] = target.value;
        ctx.clearStatus();
        await ctx.persistState();
      },
      "workspace-output": async (ctx, payload) => {
        const target = payload.target;
        ctx.ensureWorkspace(target.dataset.commandId).output = target.value;
        ctx.clearStatus();
        await ctx.persistState();
      },
      presetDraftName: async (ctx, payload) => {
        const target = payload.target;
        ctx.ensureWorkspace(target.dataset.commandId).presetDraftName = target.value;
        await ctx.persistState();
      }
    };

    const changeFieldMap = {
      currentUid: async (ctx, payload) => {
        ctx.pushUid(payload.target.value);
        ctx.render();
        await ctx.persistState();
      },
      selectedPresetId: async (ctx, payload) => {
        ctx.ensureWorkspace(payload.target.dataset.commandId).selectedPresetId = payload.target.value;
        await ctx.persistState();
      },
      customTemplateReplaceUid: async (ctx, payload) => {
        ctx.state.ui.customTemplateDraft.replaceUid = Boolean(payload.target.checked);
        ctx.clearStatus();
        await ctx.persistState();
      },
      "workspace-param": async (ctx, payload) => {
        const target = payload.target;
        if (String(target.tagName || "").toUpperCase() === "SELECT") {
          ctx.ensureWorkspace(target.dataset.commandId).values[target.dataset.key] = target.value;
          ctx.clearStatus();
          await ctx.persistState();
        }
      },
      itemPickerScope: async (ctx, payload) => {
        const target = payload.target;
        const ws = ctx.ensureWorkspace(target.dataset.commandId);
        const command = ctx.commandMap.get(target.dataset.commandId);
        const param = command ? ctx.getParam(command, target.dataset.key) : null;
        if (param) {
          const filter = ctx.getItemPickerFilterState(ws, param);
          filter.scope = String(target.value || "");
          filter.typeId = "";
          filter.subTypeId = "";
          filter.crossScope = false;
        }
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      itemPickerType: async (ctx, payload) => {
        const target = payload.target;
        const ws = ctx.ensureWorkspace(target.dataset.commandId);
        const command = ctx.commandMap.get(target.dataset.commandId);
        const param = command ? ctx.getParam(command, target.dataset.key) : null;
        if (param) {
          const filter = ctx.getItemPickerFilterState(ws, param);
          filter.typeId = String(target.value || "");
          filter.subTypeId = "";
        }
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      itemPickerSubType: async (ctx, payload) => {
        const target = payload.target;
        const ws = ctx.ensureWorkspace(target.dataset.commandId);
        const command = ctx.commandMap.get(target.dataset.commandId);
        const param = command ? ctx.getParam(command, target.dataset.key) : null;
        if (param) {
          const filter = ctx.getItemPickerFilterState(ws, param);
          filter.subTypeId = String(target.value || "");
        }
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      itemPickerCrossScope: async (ctx, payload) => {
        const target = payload.target;
        const ws = ctx.ensureWorkspace(target.dataset.commandId);
        const command = ctx.commandMap.get(target.dataset.commandId);
        const param = command ? ctx.getParam(command, target.dataset.key) : null;
        if (param) {
          const filter = ctx.getItemPickerFilterState(ws, param);
          filter.crossScope = Boolean(target.checked);
        }
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      mailTemplateItemCount: async (ctx, payload) => {
        const target = payload.target;
        const ws = ctx.ensureWorkspace(target.dataset.commandId);
        const key = String(target.dataset.key || "").trim();
        const itemId = String(target.dataset.itemId || "").trim();
        const bind = String(target.dataset.bind || "0").trim() === "1" ? "1" : "0";
        if (key && itemId) {
          const rows = ctx.getMailTemplateRows(ws, key).map((row) => {
            if (row.itemId !== itemId || row.bind !== bind) {
              return row;
            }
            const nextCount = Number(target.value);
            return { ...row, count: String(Number.isFinite(nextCount) && nextCount > 0 ? Math.floor(nextCount) : 1) };
          });
          ctx.setMailTemplateRows(ws, key, rows);
          ws.output = "";
        }
        ctx.clearStatus();
        await ctx.persistState();
      },
      mailTemplateItemBind: async (ctx, payload) => {
        const target = payload.target;
        const ws = ctx.ensureWorkspace(target.dataset.commandId);
        const key = String(target.dataset.key || "").trim();
        const itemId = String(target.dataset.itemId || "").trim();
        const oldBind = String(target.dataset.bind || "0").trim() === "1" ? "1" : "0";
        if (key && itemId) {
          const rows = ctx.getMailTemplateRows(ws, key).map((row) => {
            if (row.itemId !== itemId || row.bind !== oldBind) {
              return row;
            }
            return { ...row, bind: String(target.value || "0") === "1" ? "1" : "0" };
          });
          ctx.setMailTemplateRows(ws, key, rows);
          ws.output = "";
        }
        ctx.clearStatus();
        ctx.render();
        await ctx.persistState();
      },
      importFile: async (ctx, payload) => {
        await ctx.importCatalogData(payload.target.files?.[0]);
        payload.target.value = "";
      },
      externalCatalogFile: async (ctx, payload) => {
        await ctx.bindExternalCatalogFile(payload.target.dataset.slot, payload.target.files?.[0], payload.target.value || "");
        payload.target.value = "";
      }
    };

    return { clickActionMap, inputFieldMap, changeFieldMap };
  };
})();

