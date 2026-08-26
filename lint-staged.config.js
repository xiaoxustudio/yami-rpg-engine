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
 */
module.exports = {
	'*.{js,ts,css}': (files) => {
		const filtered = filterTemplates(files);
		return filtered.length > 0 ? `oxfmt -c ./.oxfmtrc.json --write ${filtered.join(' ')}` : '';
	},
	'*.{js,ts}': (files) => {
		const filtered = filterTemplates(files);
		return filtered.length > 0 ? `oxlint -c ./.oxlintrc.json --fix ${filtered.join(' ')}` : '';
	}
};
