# 内网 GM 助手（v1.4.4）

浏览器插件形态的 GM 场景化操作加速器。  
定位是“命令工作台 + 智能参数选择”，不替代后台原生命令联想，不自动发送命令。

## 核心能力

- 悬浮球 + 侧边栏（支持拖动、位置记忆）
- 左侧导轨双页签：`命令库`、`设置`
- 命令工作台：参数表单、结果预览、生成/复制/填入/追加
- SmartPicker：搜索、多选、全选/反选/清空、批量一项一条生成
- 外部词典源：绑定 `Item.xlsx` / `Email.xlsx` / `Task.xlsx`，手动刷新
- 自定义命令模板：保存多行命令，一键填入后台输入框

## 版本更新提醒（GitHub Release）

- 版本源：`https://api.github.com/repos/Kayungko/GM-Assistant/releases/latest`
- 检查策略：
  - 自动：每 24 小时最多检测一次
  - 手动：设置页“立即检查更新”
- 提醒方式：检测到新版本时弹窗提醒，支持“稍后提醒”
- 设置页展示：当前版本、最新版本、发布时间、最近检查、检查状态

## 版本对齐规则

- `manifest.json` 中 `version` 作为插件当前版本（当前为 `1.4.4`）
- GitHub 发布规范：
  - Tag：`vX.Y.Z`
  - Manifest：`X.Y.Z`
- 示例：发布 `v1.4.4` 时，`manifest.version` 必须是 `1.4.4`

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
