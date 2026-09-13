/**
 * 生成 `packages/editor/src/localize/template-localized.ts`（R2b 迁移②③的产物）。
 *
 * 集合语义：「全部字段都已由模板承担」的本地化键——
 *   - `tip` 字段：承载 SFC 里有 `v-tip="t('components.<键>.tip')"`（或直接的 `t(…tip)`）
 *   - 其它字段：承载 SFC 里有 `t('components.<键>.<字段>')`
 * `localizeDomComponents` 对这些键**跳过 DOM 查询**，因此本集合的大小反比于本地化器的扫描面。
 *
 * 键**不从语言文件删除**：`components` 同时是 vue-i18n 的消息树（`t('components.…')` 引用它），
 * 删键会让模板解析失败 —— 详见 docs/remaining-work.md 的「R2b 迁移②及其重要更正」。
 *
 * 用法：node scripts/i18n-skip-list.mjs [--check]
 *   --check：只比对，不写入（供 CI/人工核对；等价于 spec 里的防漂移断言）
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const CHECK = process.argv.includes('--check');
const OUT = 'packages/editor/src/localize/template-localized.ts';

const vues = [];
const walk = (p) => {
	for (const e of readdirSync(p)) {
		const full = join(p, e);
		const st = statSync(full);
		if (st.isDirectory()) {
			if (e !== 'node_modules' && e !== '__tests__') walk(full);
		} else if (e.endsWith('.vue')) {
			vues.push({ f: full, src: readFileSync(full, 'utf8').replace(/\uFEFF/g, '') });
		}
	}
};
walk(join(ROOT, 'packages/editor/src'));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const components = JSON.parse(
	readFileSync(join(ROOT, 'packages/editor/Project/Locales/en-US.English.json'), 'utf8')
).components;

const covered = [];
for (const [key, item] of Object.entries(components)) {
	if (key === '[comment]' || key[0] === '[') continue;
	if (item.save !== undefined) continue; // saveItems 依赖，跳过后仍会被本地化器处理
	const carriers = vues.filter((v) => v.src.includes(`id="${key}"`));
	if (carriers.length === 0) continue;
	const fields = Object.keys(item);
	const ok = fields.every((field) =>
		carriers.some((v) =>
			field === 'tip'
				? v.src.includes(`v-tip="t('components.${key}.tip')"`) ||
					new RegExp(`t\\(['"]components\\.${esc(key)}\\.tip['"]`).test(v.src)
				: field === 'options'
					? new RegExp(`t\\(['"]components\\.${esc(key)}\\.options\\.`).test(v.src) ||
						v.src.includes(`useLocalizedOptions('${key}'`)
					: new RegExp(`t\\(['"]components\\.${esc(key)}\\.${esc(field)}['"]`).test(v.src)
		)
	);
	if (ok) covered.push(key);
}
covered.sort();

const total = Object.keys(components).filter((k) => k !== '[comment]').length;
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
		console.log(`i18n-skip-list: OK（${covered.length} 键已由模板承担；扫描面 ${total} → ${total - covered.length}）`);
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
