# 内网 GM 助手（v1.6.0）

浏览器插件形态的 GM 场景化操作加速器。  
定位是“命令工作台 + 智能参数选择”，不替代后台原生命令联想，不自动发送命令。

## 核心能力

- 悬浮球 + 侧边栏（支持拖动、位置记忆）
- 侧边栏宽度支持拖拽拉伸（最小宽度 420，自动记忆上次宽度）
- 左侧导轨双页签：`命令库`、`设置`
- 命令工作台：参数表单、结果预览、生成/复制/填入/追加
- SmartPicker：搜索、多选、全选/反选/清空、批量一项一条生成
- `send_template_mail` 多附件构建器：道具可搜索多选、加入附件列表后统一生成 `itemid/num/bind;...`
- 外部词典源：绑定 `Item.xlsx` / `Email.xlsx` / `Task.xlsx`，手动刷新
- 自定义命令模板：保存多行命令，一键填入后台输入框
- 多皮肤系统：`Default` / `Linear` / `Sentry` / `Notion`，支持设置页一键切换并持久化记忆

## v1.6.0 版本改动（多皮肤版）

- 新增：设置页 `界面皮肤` 入口，支持 `Default` / `Linear` / `Sentry` / `Notion` 四套风格切换。
- 新增：皮肤选择持久化存储，刷新页面后保留上次皮肤。
- 新增：`Linear` 皮肤（深色中性底 + 靛蓝高亮）。
- 新增：`Sentry` 皮肤（监控面板风格，深紫灰底 + 品红告警强调）。
- 新增：`Notion` 皮肤（纸面感浅色风格，温和留白 + 低饱和中性色）。
- 优化：统一间距变量与布局节奏，减少不同面板/卡片之间的视觉抖动。

## v1.5.0 版本改动（重构版）

- 重构：`content.js` 从单体实现重构为“入口壳 + 事件层 + 视图层 + 服务层”。
- 新增：`modules/runtime/events.js`（事件分发表），替代 `onClick/onInput/onChange` 大量条件分支。
- 新增：`modules/runtime/views.js`（命令库/工作台/设置页主视图），主 `render()` 改为页面拼装。
- 新增：`modules/runtime/services.js`（catalog / target-writer / version 服务入口）。
- 工程形态保持不变：继续无构建，`manifest` 多脚本顺序加载；用户功能与交互规则保持一致。

## v1.4.5 版本改动

- 新增：模板邮件支持“多附件道具列表”可视化构建（搜索、多选、加入、数量/绑定编辑、删除）。
- 新增：侧边栏支持左侧手柄拖拽调宽，刷新页面后保留上次宽度。
- 优化：已加入附件列表展示布局，优先完整显示道具 ID，降低文本被截断（`30...`）的问题。
- 修复：邮件附件构建场景下，多选交互与输入体验稳定性问题。

## 版本更新提醒（GitHub Release）

- 版本源：`https://api.github.com/repos/Kayungko/GM-Assistant/releases/latest`
- 检查策略：
  - 自动：每 24 小时最多检测一次
  - 手动：设置页“立即检查更新”
- 提醒方式：检测到新版本时弹窗提醒，支持“稍后提醒”
- 设置页展示：当前版本、最新版本、发布时间、最近检查、检查状态

## 版本对齐规则

- `manifest.json` 中 `version` 作为插件当前版本（当前为 `1.6.0`）
- GitHub 发布规范：
  - Tag：`vX.Y.Z`
  - Manifest：`X.Y.Z`
- 示例：发布 `v1.6.0` 时，`manifest.version` 必须是 `1.6.0`

## 数据目录

- `data/catalogs/items/*.json`
- `data/catalogs/mail/*.json`
- `data/catalogs/tasks/*.json`
- `data/catalogs/common/*.json`
- 统一入口：`data/catalogs/registry.json`

## 安装

1. 打开扩展管理页  
   - Chrome: `chrome://extensions/`  
   - Edge: `edge://extensions/`
2. 开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择本目录：`C:\Users\admin\Desktop\内网GM助手`

## 执行边界

- 插件只做“生成/复制/填入/追加”
- 不自动点击发送
