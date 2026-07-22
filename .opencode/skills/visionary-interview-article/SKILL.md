---
name: visionary-interview-article
description: Use when extracting mock frontend interview questions from Visionary article history, waiting for the user's answers, grading the answers, and publishing the final Q&A review as a Visionary article.
---

# Visionary Interview Article

Use this skill to run the recurring workflow:

1. Read the user's Visionary article history when useful.
2. Extract or generate interview questions from article history and general frontend interview knowledge.
3. Ask the user to answer the questions.
4. Grade and improve the user's answers.
5. Publish the final review as a Visionary article.

This skill is for the local Visionary project at `/Users/bytedance/Desktop/project/visionary/visionary`.

## CLI Surface

Use the project CLI instead of browser automation when possible:

```bash
node scripts/visionary-cli.mjs article list --published-only --limit 30
node scripts/visionary-cli.mjs article get --id <articleId>
node scripts/visionary-cli.mjs draft create --title "<title>" --content-file "<path>" --summary "<summary>" --tags "<tags>"
node scripts/visionary-cli.mjs draft publish --id <draftId> --confirm
node scripts/visionary-cli.mjs article get --id <articleId>
```

The CLI uses saved auth from `~/.visionary-cli/config.json`, `VISIONARY_TOKEN`, or `VISIONARY_COOKIE`.

## Workflow

### 1. Collect article history and choose question sources

When the user asks to use article history, personal history, recent articles, or Visionary content, run:

```bash
node scripts/visionary-cli.mjs article list --published-only --limit 30
```

Prefer recent published articles. Identify frontend-focused topics such as:

- React
- Next.js
- Server Component / Client Component
- SSR / ISR / CSR
- Hydration
- SEO
- sitemap / robots
- frontend tracking / SDK / Hooks
- IntersectionObserver
- page stay / exposure tracking

If the first batch is not enough, increase the limit or use targeted search:

```bash
node scripts/visionary-cli.mjs article search --keyword "Next.js" --page-size 20
node scripts/visionary-cli.mjs article search --keyword "React" --page-size 20
node scripts/visionary-cli.mjs article search --keyword "埋点" --page-size 20
```

Then fetch the most relevant article bodies:

```bash
node scripts/visionary-cli.mjs article get --id <articleId>
```

Do not invent article content. If a question is described as coming from an article, base it on fetched titles, summaries, tags, and article content.

Question sources can be mixed:

- Article-derived questions: grounded in the user's Visionary articles.
- Random general frontend questions: generated from common frontend interview topics even if not covered by the user's articles.
- Hybrid questions: start from an article topic, then extend to a common interview variant.

If the user does not specify the source, use a balanced default:

- About 60% article-derived or hybrid questions.
- About 40% random general frontend questions.

If the user explicitly asks for random questions, broader scope, or not limited to article history, you may skip article fetching or use article history only as light inspiration.

Good random/general frontend topics include:

- JavaScript runtime, event loop, Promise, async/await.
- Closure, prototype, `this`, scope, module system.
- Browser rendering, reflow/repaint, event delegation, storage, security.
- HTTP cache, CDN, CORS, cookies, auth, performance optimization.
- React rendering, state updates, effects, reconciliation, hooks, controlled components.
- Next.js routing, rendering modes, caching, server actions, middleware.
- TypeScript generics, utility types, type narrowing.
- CSS layout, flex/grid, BFC, stacking context, responsive design.
- Engineering topics: bundling, tree shaking, testing, monitoring, SDK design.
- Handwritten coding: debounce/throttle, deep clone, event emitter, LRU cache, promise concurrency limiter, retry, batch queue, virtual list, simple hooks.

### 2. Extract interview questions

Generate 8 to 10 questions unless the user asks for a different number. The set should not be only conceptual Q&A. Mix multiple interview formats.

Question design rules:

- Prefer a useful mix of article-derived and general frontend questions unless the user specifies otherwise.
- Cover both conceptual understanding and implementation tradeoffs.
- Avoid trivia-only questions.
- Phrase questions as realistic frontend interview prompts.
- Include topic diversity: React, Next.js rendering, caching, hydration, SEO, and tracking engineering when available.
- Include source diversity when helpful. Optionally label questions as `【文章延伸】`, `【随机八股】`, `【通用手撕】`, or `【综合场景】`.
- Include question-type diversity. Prefer a balanced mix of:
  - 常规八股文：definitions, comparisons, lifecycle/rendering/cache concepts.
  - 场景设计题：architecture tradeoffs, cache/permission boundaries, SDK design.
  - 代码阅读题：give a small snippet and ask what happens, where the bug is, or why hydration/caching behaves that way.
  - 代码实现题：ask the user to write a small function, Hook, component, or Next.js route snippet.
  - 手撕题：implement a core mechanism from the articles, such as debounce/throttle, mini event queue, `useTrackExposure`, `useTrackPageStay`, batch reporting, retry queue, or a simplified Markdown paragraph renderer.
- For 10 questions, a good default distribution is: 3 八股文, 2 场景设计题, 2 代码阅读题, 2 手撕/代码实现题, 1 综合追问题.
- Code questions should be small enough to answer in 10 to 20 minutes. Avoid asking for a full production SDK.

Good question shape:

```markdown
1. 【八股文】Server Component 和 Client Component 的核心区别是什么？为什么不能把页面全部写成 Client Component？
2. 【场景设计】Next.js Reader 页从 SSR 继续演进到 ISR 时，为什么要先拆分公开阅读页和预览页？
3. 【代码阅读】下面这个 Markdown 图片渲染为什么可能导致 hydration error？请指出真实 DOM 问题并给出修复思路。
4. 【手撕题】实现一个简化版 `useTrackExposure`：返回 ref，当元素进入视口且可见比例达到阈值时上报一次。
```

When asking code questions, include enough constraints for grading, for example:

```markdown
【手撕题】实现一个简化版批量埋点队列。

要求：
- `push(event)` 添加事件。
- 队列长度达到 `batchSize` 时立即 flush。
- 超过 `batchInterval` 仍未 flush 时自动 flush。
- 页面隐藏时尽量 flush。
- 只需要写核心 TypeScript 逻辑，不需要完整 React SDK。
```

After presenting the questions, also create a Markdown answer template under:

```text
/Users/bytedance/Desktop/project/visionary/visionary/tmp
```

Use a clear filename such as:

```text
tmp/模拟面试一回答.md
tmp/模拟面试二回答.md
tmp/前端模拟面试回答.md
```

Use `apply_patch` to create the template file. Do not use shell redirection or Python for manual file creation.

The template should include:

- The title.
- Brief instructions for the user.
- All generated questions.
- A blank answer section under each question.
- For code questions, an empty fenced code block with a suitable language tag such as `tsx`, `ts`, or `js`.

Template example:

````markdown
# 模拟面试（一）回答

说明：请直接在每道题的“我的回答”下填写答案。代码题可以直接写在代码块里。

## 1. 【八股文】Server Component 和 Client Component 的核心区别是什么？

### 我的回答


## 2. 【手撕题】实现一个简化版 `useTrackExposure`

### 我的回答

```tsx

```
````

After creating the template, tell the user the file path and wait for the user's answers. Do not grade before the user provides answers.

### 3. Accept the user's answers

The user may answer inline or provide a local file path, for example:

```text
/Users/bytedance/Desktop/project/visionary/visionary/tmp/面试回答.md
```

If the user provides a file path, read it directly. Do not ask the user to copy the file contents.

### 4. Grade answers one by one

For each question, provide:

- A score, usually out of 10.
- What the answer got right.
- What is inaccurate, missing, or risky.
- A stronger interview-ready answer.

Use direct, specific feedback. Prefer practical frontend wording over academic definitions.

When grading, emphasize:

- Accurate terminology.
- Rendering and data-fetching boundaries.
- Cache and permission boundaries.
- Browser behavior and real DOM output.
- Reliability and performance tradeoffs.
- Edge cases that interviewers are likely to probe.

Suggested structure:

```markdown
## 1. Server Component 和 Client Component

评价：**7/10**

正确点：

- ...

需要修正：

- ...

更好的表达：

> ...
```

End with an overall summary that explains the user's current level and the two or three highest-impact improvements.

### 5. Publish as a Visionary article

Only publish when the user explicitly asks to publish, for example:

```text
把你的这次回答发布到 visionary，标题叫模拟面试（一）
```

Create a Markdown file under `tmp/`. Use the requested title as the leading `#` heading. The CLI strips the leading H1 by default unless `--keep-title` is passed, so the article title should still be passed through `--title`.

The published article must preserve the complete interview context. Do not publish only the critique. For each question, include:

- The full original question text, not a shortened topic label.
- The user's original answer, even if it is empty.
- The score and detailed feedback.
- The improved interview-ready answer.

Recommended article structure:

````markdown
# 模拟面试（一）

这篇文章记录一次前端模拟面试的完整过程：先给出题目，再保留原始回答，最后逐题点评并给出更适合面试表达的版本。

## 1. Server Component 和 Client Component 的核心区别是什么？为什么不能把页面全部写成 Client Component？

### 我的回答

```markdown
用户原始回答放这里。即使回答为空，也保留这个区域。
```

### 点评

评价：**7/10**

正确点：

- ...

需要修正：

- ...

更好的表达：

> ...
````

Wrap the user's original answer in a fenced code block. This prevents raw HTML, JSX, or Markdown in the answer from being interpreted by the article renderer and makes it clear what was actually submitted.

Use a concise summary and tags relevant to the content.

Recommended tags:

```text
前端面试,React,Next.js,SSR,埋点
```

Create the draft:

```bash
node scripts/visionary-cli.mjs draft create \
  --title "模拟面试（一）" \
  --content-file "tmp/模拟面试一点评.md" \
  --summary "基于一次模拟前端面试回答的逐题点评，覆盖 Next.js、React、SSR/ISR、Hydration、SEO 和前端埋点等主题。" \
  --tags "前端面试,React,Next.js,SSR,埋点"
```

Publish the draft:

```bash
node scripts/visionary-cli.mjs draft publish --id <draftId> --confirm
```

Verify the article status:

```bash
node scripts/visionary-cli.mjs article get --id <articleId>
```

Report back with:

- Title
- Draft ID
- Article ID
- Article URL
- Current review/publish status

If the article returns `review_status: pending_review` or `is_published: 0`, explain that the backend async review has accepted the publish request but the article is not publicly published yet.

## Safety And Quality Notes

- Do not publish until the user explicitly asks for publication.
- Do not fabricate article history. Fetch it through the CLI.
- Do not overwrite user answer files.
- If creating a temporary Markdown file, use `apply_patch` for manual file creation or edits.
- Keep published content faithful to the final feedback already given to the user.
- Preserve full questions and original user answers in the published article. Do not collapse questions into short headings such as only `Server Component 和 Client Component` unless the full question is also present.
- If the CLI reports missing auth, ask the user to run `node scripts/visionary-cli.mjs auth login ...` or provide `VISIONARY_TOKEN` / `VISIONARY_COOKIE`.
- If publishing succeeds but review is pending, do not claim it is publicly live.
