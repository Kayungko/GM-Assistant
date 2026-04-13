(function () {
  const root = window.__gmHelperModules = window.__gmHelperModules || {};

  root.createItemCommands = function createItemCommands(h) {
    const { cmd, param, num, uidParam, buildSimple, buildSummonItem, buildAddItem } = h;
    return [
      {
        ...cmd("summon_item", "局内刷物品", "summon_item", "items", ["刷物品", "掉物品", "局内道具", "召唤物品"], ["物品", "战斗", "高频"], "战斗中把物品召唤到玩家脚下。", "局内调试、连续刷物资。", "normal", [
          uidParam(),
          param("itemId", "物品ID", "text", { required: true, placeholder: "按分类选择后再搜索，可多选", inputMode: "picker_multi", optionSource: "items", pickerFilters: { defaultScope: "in-game", allowCrossScope: true }, modes: ["single"] }),
          param("itemIds", "物品ID列表", "textarea", { required: true, placeholder: "一行一个，或空格 / 逗号分隔", helper: "列表模式会按一行一条命令生成。", modes: ["list"] }),
          num("rangeStart", "起始ID", "3060003", { modes: ["range"] }),
          num("rangeEnd", "结束ID", "3060019", { modes: ["range"] })
        ], buildSummonItem),
        supportsBatch: true,
        batchModes: [{ id: "single", label: "单个" }, { id: "list", label: "列表" }, { id: "range", label: "区间" }]
      },
      {
        ...cmd("add_item", "背包加道具", "add_item", "items", ["发道具", "加道具", "背包加物品"], ["物品", "背包", "高频"], "给玩家背包添加道具，支持单条和多行批量。", "发礼包、配测试背包。", "normal", [
          uidParam(),
          param("itemId", "道具ID", "text", { required: true, placeholder: "按分类选择后再搜索，可多选", inputMode: "picker_multi", optionSource: "items", pickerFilters: { defaultScope: "in-game", allowCrossScope: true }, modes: ["single"] }),
          num("count", "数量", "1", { defaultValue: "1", modes: ["single"] }),
          param("bind", "是否绑定", "text", { required: true, defaultValue: "1", inputMode: "bool_toggle", optionSource: "enum:bool_01", modes: ["single"] }),
          param("batchItems", "批量内容", "textarea", { required: true, placeholder: "每行格式：道具ID 数量 是否绑定\n例如：1001001 5 1", helper: "只填道具ID时，会使用下方默认数量和绑定。", modes: ["list"] }),
          num("defaultCount", "默认数量", "1", { defaultValue: "1", modes: ["list"] }),
          param("defaultBind", "默认绑定", "text", { required: true, defaultValue: "1", inputMode: "bool_toggle", optionSource: "enum:bool_01", modes: ["list"] })
        ], buildAddItem),
        supportsBatch: true,
        batchModes: [{ id: "single", label: "单条" }, { id: "list", label: "批量" }]
      },
      cmd("add_item_unbind", "加未绑定道具", "add_item_unbind", "items", ["未绑定道具", "未绑道具"], ["物品", "背包", "发放"], "给玩家添加未绑定道具。", "测试交易和流通。", "normal", [uidParam(), param("itemId", "道具ID", "text", { required: true, placeholder: "按分类选择后再搜索，可多选", inputMode: "picker_multi", optionSource: "items", pickerFilters: { defaultScope: "in-game", allowCrossScope: true }, expandAsBatch: true }), num("count", "数量", "1", { defaultValue: "1" })], buildSimple(["uid", "itemId", "count"])),
      cmd("add_itemwithdur", "加耐久道具", "add_itemwithdur", "items", ["耐久道具", "带耐久道具"], ["物品", "背包", "装备"], "给玩家添加指定耐久的道具。", "装备耐久测试。", "normal", [uidParam(), param("itemId", "道具ID", "text", { required: true, placeholder: "按分类选择后再搜索", inputMode: "picker_single", optionSource: "items", pickerFilters: { defaultScope: "in-game", allowCrossScope: true } }), num("durability", "当前耐久", "例如 40"), num("maxDurability", "最大耐久", "0 表示默认", { defaultValue: "0" }), num("count", "数量", "1", { defaultValue: "1" })], buildSimple(["uid", "itemId", "durability", "maxDurability", "count"])),
      cmd("clear_all_item", "清空全部道具", "clear_all_item", "items", ["删所有道具", "清空背包"], ["物品", "删除", "危险"], "删除玩家所有道具。", "回归空仓状态。", "danger", [uidParam()], buildSimple(["uid"])),
      cmd("unlock_storage", "仓库解锁", "unlock_storage", "items", ["解锁仓库", "仓库开启"], ["物品", "仓库", "背包"], "解锁指定仓库类型。", "仓库功能测试。", "normal", [uidParam(), param("storageType", "仓库类型", "text", { required: true, placeholder: "输入仓库类型" })], buildSimple(["uid", "storageType"])),
      cmd("resize_backpack", "扩缩容背包", "resize_backpack", "items", ["背包扩容", "改背包行列"], ["物品", "背包", "空间"], "调整玩家背包行数与列数。", "背包容量验证。", "caution", [uidParam(), num("rows", "行数", "例如 8"), num("cols", "列数", "例如 8")], buildSimple(["uid", "rows", "cols"]))
    ];
  };
})();
