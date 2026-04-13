(function () {
  const root = window.__gmHelperModules = window.__gmHelperModules || {};

  root.createPlayerCommands = function createPlayerCommands(h) {
    const { cmd, param, num, uidParam, buildSimple } = h;
    return [
      cmd("see", "查看玩家", "see", "player", ["查玩家", "玩家信息", "角色信息", "uid信息"], ["玩家", "查询"], "查看用户基础信息。", "排查玩家状态。", "normal", [uidParam()], buildSimple(["uid"])),
      cmd("see_account", "查看账号", "see_account", "player", ["账号信息", "查账号"], ["玩家", "账号", "查询"], "查看账号信息，支持 UID 或账号名。", "查角色绑定账号。", "normal", [param("target", "角色UID或账号名", "text", { required: true, placeholder: "例如 11980 或 test_account" })], buildSimple(["target"])),
      cmd("get_uid", "根据角色名查UID", "get_uid", "player", ["查uid", "角色名查uid", "查角色uid"], ["玩家", "uid", "查询"], "根据角色名查找 UID。", "名字反查 UID。", "normal", [param("roleName", "角色名", "text", { required: true, placeholder: "输入完整角色名" })], buildSimple(["roleName"])),
      cmd("add_exp", "增加经验", "add_exp", "player", ["加经验", "经验"], ["玩家", "经验", "资源"], "为玩家增加经验值。", "测试升级进度。", "normal", [uidParam(), num("value", "经验值", "例如 1000")], buildSimple(["uid", "value"])),
      cmd("set_exp", "设置经验", "set_exp", "player", ["改经验", "设经验"], ["玩家", "经验", "资源"], "直接设置玩家经验值。", "回放指定经验状态。", "caution", [uidParam(), num("value", "经验值", "例如 5000")], buildSimple(["uid", "value"])),
      cmd("add_level", "增加等级", "add_level", "player", ["加等级", "升级"], ["玩家", "等级", "资源"], "为玩家增加等级。", "快速进入指定等级段。", "normal", [uidParam(), num("value", "增加等级数", "例如 3")], buildSimple(["uid", "value"])),
      cmd("set_level", "设置等级", "set_level", "player", ["改等级", "设等级"], ["玩家", "等级", "资源"], "直接设置玩家等级。", "回放指定等级状态。", "caution", [uidParam(), num("value", "目标等级", "例如 20")], buildSimple(["uid", "value"])),
      cmd("add_coin", "增加金币", "add_coin", "player", ["加金币", "金币", "发金币"], ["玩家", "金币", "资源"], "为玩家增加金币。", "经济系统测试。", "normal", [uidParam(), num("value", "金币数值", "例如 10000")], buildSimple(["uid", "value"])),
      cmd("set_coin", "设置金币", "set_coin", "player", ["改金币", "设金币"], ["玩家", "金币", "资源"], "直接设置玩家金币数值。", "回放指定金币状态。", "caution", [uidParam(), num("value", "金币数值", "例如 50000")], buildSimple(["uid", "value"])),
      cmd("add_diamond", "增加钻石", "add_diamond", "player", ["加钻石", "钻石", "发钻石"], ["玩家", "钻石", "资源"], "为玩家增加钻石。", "购买链路测试。", "normal", [uidParam(), num("value", "钻石数值", "例如 8888")], buildSimple(["uid", "value"])),
      cmd("set_diamond", "设置钻石", "set_diamond", "player", ["改钻石", "设钻石"], ["玩家", "钻石", "资源"], "直接设置玩家钻石数值。", "回放指定钻石状态。", "caution", [uidParam(), num("value", "钻石数值", "例如 20000")], buildSimple(["uid", "value"]))
    ];
  };
})();
