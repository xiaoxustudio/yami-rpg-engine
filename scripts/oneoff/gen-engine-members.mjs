/**
 * 打印 `UIEngine.<name> = <expr>` 的**右侧表达式类型** —— 一张成员表的原料。
 *
 * 为什么不能用 `getTypeOfSymbolAtLocation(UIEngine.<name>)`：容器本身是
 * `export const UIEngine: Record<string, any> = {}` ⇒ 属性读出来是 `any`，
 * 检查器对"值"一无所知。真正有类型的是每个赋值右侧的**函数表达式**，所以按 AST 取右侧。
 *
 * 用法：node scripts/oneoff/gen-engine-members.mjs [相对路径]
 * 只读，不改任何文件。
 */
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require_ = createRequire(new URL('../../packages/editor/package.json', import.meta.url));
const ts = require_('typescript');
const ROOT = process.cwd();
const target = process.argv[2] ?? 'packages/editor/src/engine/ui/ui-engine.ts';

const cfg = ts.readConfigFile(join(ROOT, 'packages/editor/tsconfig.strict.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, join(ROOT, 'packages/editor'));
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const file = program.getSourceFile(join(ROOT, target));
if (!file) throw new Error(`找不到 ${target}`);

const rows = [];
const visit = (node) => {
	if (
		ts.isBinaryExpression(node) &&
		node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
		ts.isPropertyAccessExpression(node.left) &&
		node.left.expression.getText(file) === 'UIEngine'
	) {
		const name = node.left.name.getText(file);
		const type = checker.typeToString(
			checker.getTypeAtLocation(node.right),
			node.right,
			ts.TypeFormatFlags.NoTruncation
		);
		rows.push([name, type, file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1]);
	}
	ts.forEachChild(node, visit);
};
visit(file);

console.log(`${target}：${rows.length} 个成员\n`);
for (const [name, type, line] of rows) {
	console.log(`\t${name}: ${type}; // L${line}`);
}
console.log('\n—— 去重后的名字数与类型数 ——');
console.log(
	`名字 ${new Set(rows.map((r) => r[0])).size} 个；类型 ${new Set(rows.map((r) => r[1])).size} 种`
);
