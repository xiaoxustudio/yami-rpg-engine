const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..', 'Project');
const cssDir = path.join(projectDir, 'css');
const outFile = path.join(projectDir, 'index.css');

if (!fs.existsSync(cssDir)) {
	console.error(`[build-css] 目录不存在: ${cssDir}`);
	process.exit(1);
}

const files = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'));

const order = (f) => {
	if (f === 'foundation.css') return '0';
	if (f === 'dialogs.css') return '9';
	return '1' + f;
};
files.sort((a, b) => order(a).localeCompare(order(b)));

// Vite 接管 CSS bundle：用 @import './css/...' 相对路径（Vite 兼容），
// 不用 @import url(css/...)（Vite 不认 url() 形式，会炸）
// ui-kit design tokens（--ym-*）最先加载，供组件 CSS Module 使用
// --dist-css：生产构建（编辑器用 dist 产物）时引入 ui-kit 组件样式；
// dev 模式走 ui-kit 源码别名，组件样式由 Vue SFC 运行时注入，不引入 dist CSS。
const useDistCss = process.argv.includes('--dist-css');

const imports = [
	"@import '../../ui-kit/src/theme/tokens.css';",
	"@import '../../ui-kit/src/styles/components.css';",
	...(useDistCss ? ["@import '../../ui-kit/dist/ui-kit.css';"] : []),
	...files.map((f) => `@import './css/${f}';`)
].join('\n');

const header = `/* 此文件由 build-css.js 自动生成，请勿直接编辑。 */
${imports}
`;

fs.writeFileSync(outFile, header, 'utf-8');
console.log(`[build-css] ✓ index.css 已生成 (${files.length} 个模块)`);
