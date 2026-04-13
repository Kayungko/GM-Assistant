(function () {
  const root = window.__gmHelperModules = window.__gmHelperModules || {};

  root.createMailCommands = function createMailCommands(h) {
    const { cmd, param, num, uidParam, buildSimple, buildSendCustomMail, buildRevokeMail } = h;
    return [
      cmd("send_mail", "发送模板邮件", "send_mail", "mail", ["邮件", "邮箱", "发信", "补偿邮件"], ["邮件", "发放", "奖励"], "给玩家发送带附件的模板邮件。", "补偿发放、模板奖励验证。", "normal", [uidParam(), param("mailTemplateId", "邮件模板ID", "text", { required: true, placeholder: "输入邮件标题/ID筛选，可多选", inputMode: "picker_multi", optionSource: "mail", expandAsBatch: true }), param("itemId", "附件道具ID", "text", { required: true, placeholder: "按分类选择后再搜索", inputMode: "picker_single", optionSource: "items", pickerFilters: { defaultScope: "in-game", allowCrossScope: true } }), num("count", "附件数量", "例如 1", { defaultValue: "1" })], buildSimple(["uid", "mailTemplateId", "itemId", "count"])),
      cmd("send_custom_mail", "发送自定义邮件", "send_custom_mail", "mail", ["自定义邮件", "自定义邮箱", "手动发邮件"], ["邮件", "发放", "运营"], "发送标题、内容、附件都可自定义的邮件。", "临时补偿和活动公告。", "normal", [uidParam(), param("title", "标题", "text", { required: true, placeholder: "例如 测试补偿" }), param("content", "内容", "textarea", { required: true, placeholder: "输入邮件正文" }), param("itemSpec", "可选道具", "text", { placeholder: "item=1001,1;1002,2" }), param("extraArgs", "可选内容参数", "text", { placeholder: "例如 0=1 cdkey=AAABBC", helper: "按后台原始命令格式输入。" })], buildSendCustomMail),
      cmd("see_mail", "查看邮件", "see_mail", "mail", ["看邮件", "查邮件", "邮箱记录"], ["邮件", "查询"], "查看玩家当前邮件。", "核对补偿是否到账。", "normal", [uidParam()], buildSimple(["uid"])),
      cmd("del_mail", "删除邮件", "del_mail", "mail", ["删邮件", "删除邮箱邮件"], ["邮件", "删除", "危险"], "删除玩家指定 ID 的邮件。", "清理异常邮件。", "danger", [uidParam(), param("mailId", "邮件ID", "text", { required: true, placeholder: "输入邮件ID" })], buildSimple(["uid", "mailId"])),
      cmd("revoke_mail", "撤回邮件", "revoke_mail", "mail", ["回收邮件", "邮件撤回"], ["邮件", "回收", "谨慎"], "撤回指定邮件和附件列表。", "发放错误后的回收处理。", "caution", [uidParam(), param("timestamp", "时间戳", "text", { required: true, placeholder: "例如 1710000000" }), param("itemPairs", "附件列表", "textarea", { placeholder: "格式：itemid1,num1;itemid2,num2" })], buildRevokeMail)
    ];
  };
})();
