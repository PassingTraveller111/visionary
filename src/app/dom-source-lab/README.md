# DOM Source Mapping Lab

这个目录用于独立验证 DOM 到源码的映射方案。它复用 `src/lib/dom-picker` 选择页面元素，但不把任何源码映射逻辑放进选择器本身。

## 路由

| 路由 | 用途 | 状态 |
| --- | --- | --- |
| `/dom-source-lab` | 实验室入口与方案概览 | 已实现 |
| `/dom-source-lab/line-marker` | 通过 `data-source-*` 读取源码位置 | 已实现 |
| `/dom-source-lab/ast` | AST 节点 ID 与映射表 | 计划中 |
| `/dom-source-lab/source-map` | 生成代码位置回溯原始源码 | 计划中 |
| `/dom-source-lab/runtime` | 运行时特征匹配 | 计划中 |
| `/dom-source-lab/compare` | 多方案结果与性能对比 | 计划中 |

## 目录职责

```text
dom-source-lab/
├── _components/       # 方案间共享的选择画布和源码面板
├── _lib/              # 公共类型
├── _strategies/       # DomSourceMapper 的具体实现
├── line-marker/       # 行号标记方案及其独立 Fixture
├── layout.tsx         # 实验室导航
└── page.tsx           # 方案概览
```

源码内容由 `src/app/api/dom-source-lab/source/route.ts` 提供。接口只读取明确加入 `ALLOWED_SOURCE_FILES` 的文件，禁止将用户输入直接拼成任意磁盘路径。

## 映射器约定

所有方案实现相同接口：

```ts
type DomSourceMapper = {
  name: string;
  locate: (
    element: Element,
  ) => SourceLocation | null | Promise<SourceLocation | null>;
};
```

`DemoShell` 只负责选择元素和展示结果。具体方案负责将 `Element` 转换为 `SourceLocation`。新增方案时不要修改 `DomPicker`，也不要在 `DemoShell` 中根据方案名称编写分支。

## 行号标记方案

`line-marker/Fixture.tsx` 使用以下属性：

```html
<button
  data-source-file="src/app/dom-source-lab/line-marker/Fixture.tsx"
  data-source-line="50"
  data-source-column="9"
  data-source-id="add-instance"
>
```

`lineMarkerMapper` 会从选中元素开始，通过 `closest` 向上寻找最近的完整标记。子节点没有标记时会映射到最近的已标记祖先；整条祖先链都没有标记时返回 `null`。

当前行号为手工标记。修改 `Fixture.tsx` 的结构或在标记节点之前增删代码后，必须同步更新后续 `sourceMarker` 的行号。手工维护是这个方案需要展示的限制，不要通过运行时搜索源码文本掩盖它。

动态列表中的多个 DOM 实例共用同一个源码位置和 `data-source-id`，用于展示“一个模板节点对应多个运行时实例”。如果未来需要区分实例，应额外引入 `instanceId`，不要改变源码节点 ID 的语义。

## 新增方案

1. 在 `_strategies` 下实现一个 `DomSourceMapper`。
2. 新建方案子路由和独立 Fixture，避免不同编译方式相互干扰。
3. 使用 `DemoShell` 复用选择、状态和源码展示交互。
4. 如需读取新的源码文件，将精确路径加入 API 的 `ALLOWED_SOURCE_FILES`。
5. 在 `layout.tsx` 启用导航入口，并更新本 README 的状态表。

AST 方案推荐在编译阶段注入短节点 ID，并把完整位置放入独立映射表。Source Map 方案应建立在“DOM 节点已经能关联到生成代码位置”的前提上，不应直接用序列化 DOM 猜测代码偏移。

## 验证清单

- 普通元素能定位到自身标记行。
- 未标记子节点能回退到已标记祖先。
- 无标记区域显示映射失败，而不是猜测位置。
- 动态新增实例映射到相同模板行。
- 源码面板只允许读取白名单文件。
- 桌面端与窄屏下都能完成选择和查看源码。
