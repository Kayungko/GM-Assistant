(function () {
  const root = window.__gmHelperModules = window.__gmHelperModules || {};

  root.createTaskCommands = function createTaskCommands(h) {
    const { cmd, param, num, uidParam, buildSimple } = h;
    return [
      cmd(
        "accept_task",
        "接取任务",
        "accept_task",
        "tasks",
        ["任务接取", "接任务"],
        ["任务", "进度", "高频"],
        "给玩家接取指定任务。",
        "任务链路与奖励回归。",
        "normal",
        [
          uidParam(),
          param("taskId", "任务ID", "text", { required: true, placeholder: "选择任务ID", inputMode: "picker_multi", optionSource: "tasks", expandAsBatch: true }),
          num("status", "状态值", "通常填 0", { defaultValue: "0" })
        ],
        buildSimple(["uid", "taskId", "status"])
      ),
      cmd(
        "set_task_complete",
        "完成任务",
        "set_task_complete",
        "tasks",
        ["任务完成", "完成主线"],
        ["任务", "进度", "高频"],
        "将任务状态直接置为完成。",
        "快速回放任务完成状态。",
        "caution",
        [
          uidParam(),
          param("taskId", "任务ID", "text", { required: true, placeholder: "选择任务ID", inputMode: "picker_multi", optionSource: "tasks", expandAsBatch: true }),
          num("status", "状态值", "通常填 0", { defaultValue: "0" })
        ],
        buildSimple(["uid", "taskId", "status"])
      ),
      cmd(
        "set_rookie_task_process",
        "新手任务进度",
        "set_rookie_task_process",
        "tasks",
        ["新手任务", "新手进度"],
        ["任务", "新手", "高频"],
        "设置新手任务进度值。",
        "新手流程验证。",
        "normal",
        [
          uidParam(),
          param("taskId", "新手任务ID", "text", { required: true, placeholder: "选择新手任务ID", inputMode: "picker_multi", optionSource: "tasks", expandAsBatch: true }),
          num("progress", "进度值", "例如 9999", { defaultValue: "9999" })
        ],
        buildSimple(["uid", "taskId", "progress"])
      )
    ];
  };
})();
