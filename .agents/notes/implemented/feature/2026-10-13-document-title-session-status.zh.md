# Agent Note: Session status prefix in the browser document title

Status: implemented

[English](2026-10-13-document-title-session-status.md) | 中文

## Problem

Harness 页面大部分时间处在后台浏览器标签页或失去焦点的 Desktop 窗口里，对话内容不可见。Session 停下来等待批准、或仍在运行时，在用户切回标签页之前没有任何信号，待处理的交互就这样被晾着。

## Decision

`client/ui-layout` 的 `DocumentTitle` 在会话列表和面板信息之外，追加订阅根槽位运行时的 `useSessionStatus` 快照。组合标题保留原有基底——没有活动面板时取主视图保留的 Session 标题，否则取构建配置的产品标题——并在此基础上叠加跨工作区所有 Session 聚合的状态前缀：任一 Session 存在待处理交互时加 `❗`，否则任一 Session 正在运行时加 `●`。前缀同样作用于面板视图，因此用户从对话页导航走后信号仍然保留。组件卸载时依旧恢复为裸产品标题。

`AppFrame` 把根 props 中的 `useSessionStatus` 透传给 `DocumentTitle`，其他消费者不变。前缀字符是固定符号而非本地化文案，语言词典不新增条目。

## Alternatives considered

**只标记当前选中的 Session。** 选中的 Session 本来就是用户正在看的那个；这个信号是为用户没在看的 Session 准备的。跨工作区聚合能让任何一个待批准的 Session 都给标签页打上标记，与当前选中哪个 Session 无关。

**用 `completionUnread` 代替 `running`。** 完成徽标属于会话列表行，用户在那里选择要打开什么。已结束的运行不需要标签页级别的紧迫感；待处理交互和进行中的工作才是会改变用户下一步行动的状态。

**用 favicon 或侧边栏徽标代替标题。** favicon 方案需要按主题准备素材，且在固定标签页（pinned tab）中不可见。标题文本在标签栏、窗口标题和系统任务切换器中都保持可见，Web 和 Desktop 两端一致。

## Consequences

一个等待中的 Session 会给整个应用打标记：前缀不指出是哪个 Session 需要处理，用户切回来后从会话列表中确认。标题写入仍集中在 `DocumentTitle`，前缀与未来基底标题的改动组合时不需要新增订阅者。Desktop 的窗口标题继承同一信号，无需 Electron 专属代码。

## Testing

`document-title.client.spec.tsx` 覆盖运行前缀随状态快照出现与消失、待处理交互优先于运行中、以及前缀作用于面板视图。既有用例钉住基底标题选择与卸载恢复行为不变。
