import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * inspector 挂载点对账：`LayoutPanel.vue` 的 page-frame ↔ `AppShell.vue` 的 Teleport 目标
 * ↔ `components/inspector/*.vue` 文件清单。
 *
 * ## 为什么需要这个用例（2026-10-01）
 *
 * 同一份 inspector 页面清单**维护在两处**：`AppShell.vue` 用 `import.meta.glob` 从文件名推导
 * `{ value, target }` 并渲染 Teleport；`LayoutPanel.vue` 手写 43 个 `<div class="page-frame">`
 * 当挂载点。两边靠**人脑**保持一致 —— 而它们**本来就该差一条**：
 *
 * `uiContainer` 没有 `.vue` 页面（它由命令式页面 `inspector/element-container-page.ts` 支撑，
 * `Inspector.uiContainer` 被 `engine/ui/ui-initialize.ts` 的 `container: 'uiContainer'` 按名取用），
 * 所以 glob 推导一定**看不到**它，而挂载点**必须留着**。
 *
 * 也就是说：`LayoutPanel` 里那 43 个挂载点**不能**简单地"改成从 glob 生成" ——
 * 那会删掉 `#uiContainer-vue-mount`，让 UI 引擎的容器页失去挂载目标。实测这条差值是
 * 43 − 42 = **1**，且**恰好只有** `uiContainer`。
 *
 * 本用例把这条契约钉死，并覆盖两种真实风险：
 *   1. 新增 inspector 页面却忘了加挂载点（页面永远不渲染）；
 *   2. 有人把 `uiContainer` 当"没人用的挂载点"删掉（UI 引擎静默失去目标）。
 *
 * ## 口径来源（刻意不在这里抄第三份）
 *
 * - 文件名 → value 的推导：与 `AppShell.vue` 的 `inspectorPages` 同算法；
 * - 「特例目标」（`#<value>` 而不是 `#<value>-vue-mount`）：**从 `AppShell.vue` 源码里读**
 *   `inspectorSpecialTargets`，不复制一份 —— 复制就是第三次分叉的开始。
 */

const ROOT = join(__dirname, '..', '..', '..');
const LAYOUT_PANEL = join(ROOT, 'src', 'components', 'layout', 'LayoutPanel.vue');
const APP_SHELL = join(ROOT, 'src', 'AppShell.vue');
const INSPECTOR_DIR = join(ROOT, 'src', 'components', 'inspector');
const CONTAINER_PAGE = join(ROOT, 'src', 'inspector', 'element-container-page.ts');

/** 唯一的「无 .vue 页面、但必须有挂载点」的 imperative 页 */
const IMPERATIVE_ONLY = ['uiContainer'];

interface PageEntry {
	file: string;
	value: string;
	domId: string;
}

interface Frame {
	value: string;
	id: string;
}

/** 与 `AppShell.vue` 的 `inspectorPages` 同算法：文件名 → 页面 value */
function deriveValue(file: string): string {
	const name = file.replace(/\.vue$/, '').replace(/Page$/, '');
	const raw = name.replace(/^UI(?=[A-Z])/, 'ui');
	return raw.charAt(0).toLowerCase() + raw.slice(1);
}

/** 从 `AppShell.vue` 源码读特例目标集合（少一份拷贝 = 少一条分叉路径） */
function readSpecialTargets(): Set<string> {
	const src = readFileSync(APP_SHELL, 'utf8');
	const block = /inspectorSpecialTargets\s*=\s*new Set\(\[([\s\S]*?)\]\)/.exec(src);
	if (!block) {
		throw new Error(
			'AppShell.vue 里找不到 inspectorSpecialTargets —— 口径改了就必须同步本用例（宁可红在清单过期）'
		);
	}
	return new Set([...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
}

/** 解析 `LayoutPanel.vue` 里 `#inspector-page-manager` 块内的全部 page-frame */
function readInspectorFrames(): Frame[] {
	const src = readFileSync(LAYOUT_PANEL, 'utf8');
	const start = src.indexOf('id="inspector-page-manager"');
	const end = src.indexOf('</PageManager>', start);
	if (start === -1 || end === -1) {
		throw new Error(
			'LayoutPanel.vue 里找不到 #inspector-page-manager 块 —— 结构变了就必须更新本用例（宁可红在清单过期）'
		);
	}
	const frames: Frame[] = [];
	for (const m of src.slice(start, end).matchAll(/<div\b([\s\S]*?)>/g)) {
		const value = /value="([^"]+)"/.exec(m[1])?.[1];
		const id = /id="([^"]+)"/.exec(m[1])?.[1];
		if (value && id) frames.push({ value, id });
	}
	return frames;
}

describe('inspector 挂载点对账（LayoutPanel ↔ AppShell ↔ 文件清单）', () => {
	const specials = readSpecialTargets();
	const files = readdirSync(INSPECTOR_DIR)
		.filter((f) => f.endsWith('.vue'))
		.sort();
	const pages: PageEntry[] = files.map((file) => {
		const value = deriveValue(file);
		return { file, value, domId: specials.has(value) ? value : `${value}-vue-mount` };
	});
	const frames = readInspectorFrames();
	const frameByValue = new Map(frames.map((f) => [f.value, f]));

	it('扫描面非空（防止"目录搬走 ⇒ 用例静默变绿"）', () => {
		// 与 bridge-integrity.spec.ts 同一条教训：覆盖面变小必须红，不能绿。
		expect(files.length).toBeGreaterThan(40);
		expect(frames.length).toBeGreaterThan(files.length);
	});

	it('每个 inspector 页面都有挂载点', () => {
		expect(pages.filter((p) => !frameByValue.has(p.value)).map((p) => p.file)).toEqual([]);
	});

	it('挂载点 id 与 AppShell 推导的 Teleport 目标一致', () => {
		expect(
			pages
				.filter((p) => frameByValue.get(p.value)?.id !== p.domId)
				.map((p) => `${p.value}: frame id=${frameByValue.get(p.value)?.id} 推导=${p.domId}`)
		).toEqual([]);
	});

	it('挂载点 value 唯一', () => {
		expect(frames.length).toBe(new Set(frames.map((f) => f.value)).size);
	});

	it('无 .vue 页面的挂载点恰好只有 uiContainer —— 且命令式页面仍在支撑它', () => {
		const pageValues = new Set(pages.map((p) => p.value));
		const orphans = frames.filter((f) => !pageValues.has(f.value)).map((f) => f.value);
		// 这一条是"不要顺手删掉它"的护栏：glob 看不到它，但 UI 引擎按名取用。
		expect(orphans).toEqual(IMPERATIVE_ONLY);
		// 例外之所以成立，是因为 `Inspector.uiContainer` 仍然被赋值。
		// 命令式页面一旦移除，这条断言会红，逼人重新判断那个挂载点是否还需要。
		expect(readFileSync(CONTAINER_PAGE, 'utf8')).toMatch(/Inspector\.uiContainer\s*=/);
	});
});
