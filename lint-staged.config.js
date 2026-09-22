const fs = require('fs');
const templateDirs = [
	'Project/Templates/',
	'packages/template-arpg/runtime/',
	'packages/template-arpg/languages/',
	'packages/template-arpg/out/',
	'packages/template-arpg/build/',
	'packages/script/template/'
];
const filterTemplates = (files) =>
	files.filter((f) => {
		// 已删除（未提交的删除）文件不交给工具，避免找不到文件
		if (!fs.existsSync(f)) return false;
		const n = f.replace(/\\/g, '/');
		return !templateDirs.some((dir) => n.includes(dir));
	});
/**
 * @type {import('lint-staged').Configuration}
 *
 * glob 必须覆盖**真正会被写坏的文件类型**：2026-09-21 发现原来的 `*.{js,ts,css}` 漏了
 * `.vue`（350+ 个 SFC）与 `.mjs`（`scripts/` 下的门禁脚本本身）—— 而 `.oxlintrc.json` 对
 * `.vue` 有专门的 `no-restricted-imports` 规则、`scripts/**\/*.mjs` 也有专门 override，
 * 也就是说「规则写了，但提交路径上从不跑」。补上这两类。
 *
 * 刻意不加 `.json`：`oxfmt` 会重排 `package.json` / `*.json` 的键与缩进，而本仓的 json 里有
 * `packages/editor/src/module/packmeta.json` 这类**运行时读取**的文件，机械重排的风险大于收益
 * （真要收口时按 `format` 脚本单独跑一次并复核）。
 */
module.exports = {
	'*.{js,ts,mjs,cjs,css,vue}': (files) => {
		const filtered = filterTemplates(files);
		return filtered.length > 0 ? `oxfmt -c ./.oxfmtrc.json --write ${filtered.join(' ')}` : '';
	},
	'*.{js,ts,mjs,cjs,vue}': (files) => {
		const filtered = filterTemplates(files);
		return filtered.length > 0 ? `oxlint -c ./.oxlintrc.json --fix ${filtered.join(' ')}` : '';
	}
};
