/**
 * 生成 `packages/editor/src/localize/template-localized.ts`（R2b 迁移②③的产物）。
 *
 * 集合语义：「全部字段都已由模板承担」的本地化键——
 *   - `tip` 字段：承载 SFC 里有 `v-tip="t('components.<键>.tip')"`（或直接的 `t(…tip)`）
 *   - 其它字段：承载 SFC 里有 `t('components.<键>.<字段>')`
 * `localizeDomComponents` 对这些键**跳过 DOM 查询**，因此本集合的大小反比于本地化器的扫描面。
 *
 * 键**不从语言文件删除**：`components` 同时是 vue-i18n 的消息树（`t('components.…')` 引用它），
 * 删键会让模板解析失败 —— `components` 既是本地化器的键表，也是 vue-i18n 的消息树，
 * 两者共用同一份数据（R2b 迁移②确立的关键约束）。
 *
 * 用法：node scripts/i18n-skip-list.mjs [--check]
 *   --check：只比对，不写入（供 CI/人工核对；等价于 spec 里的防漂移断言）
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const CHECK = process.argv.includes('--check');
const OUT = 'packages/editor/src/localize/template-localized.ts';

const vues = [];
const modules = [];
const walk = (p) => {
	for (const e of readdirSync(p)) {
		const full = join(p, e);
		const st = statSync(full);
		if (st.isDirectory()) {
			if (e !== 'node_modules' && e !== '__tests__') walk(full);
		} else if (e.endsWith('.vue')) {
			vues.push({ f: full, src: readFileSync(full, 'utf8').replace(/\uFEFF/g, '') });
		} else if (e.endsWith('.ts') && !e.endsWith('.d.ts')) {
			// 模块侧（元素工厂/数据模块）也用同一条"代码已承担"判据：见 applyLocalizedItems
			modules.push({ f: full, src: readFileSync(full, 'utf8').replace(/\uFEFF/g, '') });
		}
	}
};
walk(join(ROOT, 'packages/editor/src'));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const components = JSON.parse(
	readFileSync(join(ROOT, 'packages/editor/Project/Locales/en-US.English.json'), 'utf8')
).components;

/**
 * R2b 迁移⑮：editor 的 `common/SelectBox.vue` 现在**自己**按 `components.<id>.options` 生成选项名
 * （响应式 `t()`），因此凡是 `<SelectBox id="<键>">` 的控件，其 options 已由宿主组件承担。
 * 这里要求包装器里确实存在那段通用逻辑（避免判据比实现跑得快）。
 */
const selectBoxPath = join(ROOT, 'packages/editor/src/components/common/SelectBox.vue');
const selectBoxSrc = readFileSync(selectBoxPath, 'utf8');
const selectBoxGeneric = selectBoxSrc.includes('components.${id}.options') ? selectBoxPath : null;

const covered = [];
for (const [key, item] of Object.entries(components)) {
	if (key === '[comment]' || key[0] === '[') continue;
	const carriers = vues.filter((v) => v.src.includes(`id="${key}"`));
	// R2b 迁移⑩：有些键的元素由 ui-kit 组件内部持有 id（`<YMRename>` 之类），承载 SFC 里
	// 根本没有 `id="<键>"`；这些键的字段仍在模板里用 `t('components.<键>.<字段>')` 承担。
	// 判据放宽为：**唯一**引用该键消息的 SFC 也算承载者（多文件引用时仍要求含 id，避免误判）。
	const byMessage = vues.filter((v) => v.src.includes(`components.${key}.`));
	const effective = carriers.length > 0 ? carriers : byMessage.length === 1 ? byMessage : [];
	// `save` 不算"需要在 SFC 里承担"的显示字段：它是 `#别名` 的注册项，
	// 由 `localizeDomComponents` 按**全表**建索引（见 dom-localizer.ts 与
	// `__tests__/save-alias.spec.ts`），与"该键是否落在扫描面内"无关。
	// ⇒ 只有 `save` 没被模板承担的键（`particleLayer-anchor-x-1` 就是这种）
	// 也可以安全跳过。
	const fields = Object.keys(item).filter((field) => field !== 'save');
	// 模块侧等价路径：`applyLocalizedTip(el, '<键>')`（tooltip 的"代码已承担"形态，
	// 与 `applyLocalizedItems` 对 options 的作用相同）。用于元素由模板之外持有、
	// 模板 `v-tip` 够不着的键（`selector-search` 就是这种：搜索框在
	// `YMFileHeadPane` 里，而那个组件所在的 ui-kit 按设计不接 i18n）。
	const moduleCarriesTip = modules.some(
		(m) => m.src.includes('applyLocalizedTip(') && m.src.includes(`'${key}'`)
	);
	// 只有在"需要 SFC 承担某些字段"时才强制要求承载者存在
	if (
		effective.length === 0 &&
		!(fields.length > 0 && fields.every((f) => f === 'tip' && moduleCarriesTip))
	)
		continue;
	const ok = fields.every((field) =>
		field === 'tip' && moduleCarriesTip
			? true
			: effective.some((v) =>
					field === 'tip'
						? v.src.includes(`v-tip="t('components.${key}.tip')"`) ||
							new RegExp(`t\\(['"]components\\.${esc(key)}\\.tip['"]`).test(v.src)
						: field === 'options'
							? new RegExp(`t\\(['"]components\\.${esc(key)}\\.options\\.`).test(
									v.src
								) ||
								v.src.includes(`useLocalizedOptions('${key}'`) ||
								// 模块侧（非 Vue）等价路径：utils/localized-items 的 applyLocalizedItems
								modules.some((m) =>
									m.src.includes(`applyLocalizedItems('${key}'`)
								) ||
								// 宿主组件按约定承担（迁移⑮）
								(selectBoxGeneric !== null &&
									new RegExp(`<SelectBox[^>]*\\bid="${esc(key)}"`).test(v.src))
							: new RegExp(
									`t\\(['"]components\\.${esc(key)}\\.${esc(field)}['"]`
								).test(v.src)
				)
	);
	if (ok) covered.push(key);
}
covered.sort();

/**
 * 分母口径：**排除 `[` 前缀的分节键**（`[comment]` 之类）。它们既不是控件、也没有 `t()` 承载，
 * 生成器从来不会把它们判为"已承担"——若仍计入分母，扫描面就会被恒久高估 17 个键。
 */
const total = Object.keys(components).filter((k) => k !== '[comment]' && k[0] !== '[').length;
const content = `/**
 * 模板已承担的本地化键（R2b 迁移②③，**本文件由 scripts/i18n-skip-list.mjs 生成，勿手改**）。
 *
 * 这些键的**全部字段**都已由模板承担（\`t('components.<键>.<字段>')\` 或 \`v-tip="t('…tip')"\`），
 * 因此 \`localizeDomComponents\` 对它们**跳过 DOM 查询**——扫描面从 ${total} 键降到
 * ${total - covered.length} 键。
 *
 * 键本身**不从语言文件删除**：\`components\` 既是本地化器的键表，也是 vue-i18n 的消息树，
 * 删键会让模板里的 \`t('components.…')\` 解析失败。
 *
 * 复核：\`packages/editor/src/localize/__tests__/template-localized.spec.ts\` 会从源码反推本集合，
 * 与文件内容不一致即失败（防漂移）。
 */
export const templateLocalizedKeys: ReadonlySet<string> = new Set([
${covered.map((k) => `\t'${k}'`).join(',\n')}
]);
`;

const existing = (() => {
	try {
		return readFileSync(join(ROOT, OUT), 'utf8');
	} catch {
		return '';
	}
})();

if (CHECK) {
	if (existing === content) {
		console.log(
			`i18n-skip-list: OK（${covered.length} 键已由模板承担；扫描面 ${total} → ${total - covered.length}）`
		);
		process.exit(0);
	}
	console.error('i18n-skip-list: 与源码不一致，请运行 node scripts/i18n-skip-list.mjs 重新生成');
	process.exit(1);
}

writeFileSync(join(ROOT, OUT), content);
console.log(
	`i18n-skip-list: 写入 ${covered.length} 键（扫描面 ${total} → ${total - covered.length}）` +
		(existing === content ? '（内容未变）' : '')
);
