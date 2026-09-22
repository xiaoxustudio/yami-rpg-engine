// 设计豁免白名单的**单一真源**。
//
// 历史（2026-09-17 之前）：同一份 14 条豁免路径被写了两遍——`.oxlintrc.json` 的 `overrides`
// 里一份（真正决定 `pnpm lint` 放不放行），`scripts/dom-guard.mjs` 的 `WHITELIST` 字面量数组里
// 另一份（决定台账把哪些文件算成「设计豁免」而不是「迁移债」）。两份已经漂移过：
// `dom-guard.mjs tracker` 现在报「设计豁免 46」而白名单只有 14 条，就是两边口径不同的表现。
//
// 现在**只从 `.oxlintrc.json` 读**。理由很直接：能放行 lint 的才是真豁免——台账如果认一份
// lint 不认的名单，报表就会声称「已豁免」而 `pnpm lint` 照样报错；反过来 lint 认而台账不认，
// 迁移债就会被永久虚高。以 lint 配置为真源，两边不可能再分叉。
//
// `migration-ledger.mjs` 的 `dom-whitelist-drift` 轴会持续守住这件事。

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, SCAN_DIRS, collectFiles } from './scan.mjs';

/** 未提供类型的第三方依赖声明文件、测试、playground 不是「设计豁免」，只是不参与门禁 */
const NOT_A_DESIGN_EXEMPTION = [
	/(?:^|\/)__tests__\//,
	/\.spec\.[jt]s$/,
	/(?:^|\/)playground\//,
	/(?:^|\/)node_modules\//,
	/(?:^|\/)dist\//,
	/(?:^|\/)build\//
];

/**
 * 每条豁免的**设计理由**，按 glob 精确匹配。
 *
 * 为什么不写在 `.oxlintrc.json` 里：oxlint 的 override **只接受** `files` / `excludeFiles` /
 * `env` / `globals` / `plugins` / `jsPlugins` / `rules` 七个字段，多一个 `comment` 就直接
 * 解析失败（实测：`unknown field 'comment'`）。所以理由留在这里，由 `migration-ledger.mjs`
 * 的 `dom-whitelist-unjustified` 轴强制**每条豁免都必须有理由**——白名单只许通过「有理由」
 * 这一关进来，避免它悄悄变成「加一行就能绕过门禁」的后门。
 */
export const WHITELIST_RATIONALE = {
	'packages/editor/src/engine/webgl/webgl-init.ts':
		'A 类·真画布上下文：createElement("canvas") 取 WebGL 上下文，模板无法替代',
	'packages/editor/src/engine/webgl/webgl-methods.ts': 'A 类·真画布上下文：WebGL 方法与像素读回',
	'packages/editor/src/engine/palette/palette-engine.ts':
		'A 类·真画布上下文：调色板离屏画布与像素读回',
	'packages/editor/src/engine/scene/draw-start-position.ts':
		'A 类·真画布上下文：起点绘制需要真实 2D 上下文',
	'packages/editor/src/printer/printer.ts': 'A 类·真画布上下文：打印/渲染输出画布',
	'packages/editor/src/audio/audio-manager.ts':
		'A 类·宿主对象：new Audio() 与音频节点必须命令式创建',
	'packages/editor/src/data/transition-window.ts':
		'A 类·真画布上下文：转场预览需要真实 2D 上下文',
	'packages/editor/src/main.ts': '应用挂载点：Vue 的挂载容器来自 index.html，只能按 id 取一次',
	'packages/editor/src/utils/dom.ts':
		'唯一 DOM 创建/查询缝隙：$() 与 renderDetached 的实现处，收口用',
	'packages/ui-kit/src/utils/detached.ts':
		'ui-kit 侧同类缝隙：离屏建元素收在一处（B1 收口），组件内不再直接 createElement',
	'packages/editor/src/composables/usePointerObjectWindow.ts':
		'index.html 外壳元素（#cursor-region），非 SFC 渲染',
	'packages/ui-kit/src/components/**':
		'元素优先的组件 API 层（P2b 重定义：架构性设计豁免，不以文件数归零为准）',
	'packages/ui-kit/src/utils/radio-proxy.ts': '元素优先 API 层的配套代理，同上',
	'packages/editor/src/localize/dom-localizer.ts':
		'R2b 收口后的选择器式本地化器：按语言表的键发现元素；id 键扫描面已归零（改由模板 t() / v-tip / useLocalizedOptions 承担），剩下的只有 [name=…] / [.class] 分组键——name 是组件内部的稳定契约属性（YMFormButtons 的 CSS 依赖 button[name="confirm"]），无法用 id/模板替代'
};

/**
 * 读 `.oxlintrc.json`，取出所有把 `eslint/no-restricted-properties` 关掉的 override 的 files 列表。
 * @returns {{ pattern: string, reason: string | null }[]} 保持文件里的出现顺序
 */
export function readDomWhitelist() {
	const rcPath = join(ROOT, '.oxlintrc.json');
	const rc = JSON.parse(readFileSync(rcPath, 'utf8'));
	const entries = [];
	for (const override of rc.overrides ?? []) {
		const rules = override.rules ?? {};
		if (rules['eslint/no-restricted-properties'] !== 'off') continue;
		for (const pattern of override.files ?? []) {
			if (NOT_A_DESIGN_EXEMPTION.some((re) => re.test(pattern))) continue;
			entries.push({ pattern, reason: WHITELIST_RATIONALE[pattern] ?? null });
		}
	}
	return entries;
}

/**
 * glob → 正则（`**` 跨目录、`*` 不跨目录），与 dom-guard 历史语义一致。
 *
 * ⚠️ 必须**一趟**替换完：先替 `**`→`.*` 再替 `*`→`[^/]*` 会让第二趟吃掉第一趟产出的 `*`，
 * 所以旧写法中间塞了一个 0 号哨兵字符 —— 而正则会因此被 `eslint/no-control-regex` 判为坏味道。
 * `migration-ledger.mjs` 的 `dom-whitelist-drift` 轴里有一份**逐字同源**的实现，改这里要同步改那里。
 */
export function globToRegExp(pattern) {
	const escaped = String(pattern).replace(/[.+^${}()|[\]\\]/g, '\\$&');
	const body = escaped.replace(/\*\*|\*/g, (m) => (m === '**' ? '.*' : '[^/]*'));
	return new RegExp(`^${body}$`);
}

/**
 * 编译成判定函数。
 * @returns {{ patterns: string[], match: (rel: string) => boolean }}
 */
export function loadDomWhitelist() {
	const entries = readDomWhitelist();
	const res = entries.map((e) => globToRegExp(e.pattern));
	const patterns = entries.map((e) => e.pattern);
	return {
		patterns,
		match: (rel) => res.some((re) => re.test(rel))
	};
}

/**
 * 台账侧口径：白名单覆盖的**源码文件**（glob 展开到实际存在的文件）。
 * 只有落在扫描面内的文件才可能有「受限 API 命中」，所以这里也只报扫描面内的。
 */
export function domWhitelistFiles() {
	const { match } = loadDomWhitelist();
	return collectFiles({ dirs: SCAN_DIRS, includeTests: true }).filter((f) => match(f.rel));
}
