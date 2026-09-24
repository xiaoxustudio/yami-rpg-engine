#!/usr/bin/env node
// 文本污染门禁：`node scripts/check-text-integrity.mjs`
//
// 用法：
//   node scripts/check-text-integrity.mjs             扫描并判定（有问题 exit 1）
//   node scripts/check-text-integrity.mjs --rules     只打印规则表与理由
//   node scripts/check-text-integrity.mjs --json      机器可读输出
//
// 与 `migration-ledger.mjs` 同样的纪律：**零依赖、零子进程**（纯文本扫描）。
// 这样它在任何环境里都跑得出同样的结论 —— 「门禁起不来」绝不能被读成「门禁通过」。
//
// 为什么需要它（2026-09-21 实测）：本仓出现过一族**语法合法**的写坏 —— 单词首字母被换成
// 控制字符、代码行被吞进 `//` 注释、整段注释被复制进自己。`tsc` / `oxlint` / `oxfmt` /
// vitest **全都看不见**。规则、理由与「为什么这么窄」写在 `scripts/lib/text-integrity.mjs`。

import { ROOT } from './lib/scan.mjs';
import { TEXT_RULES, scanTextIntegrity } from './lib/text-integrity.mjs';

const argv = new Set(process.argv.slice(2));

if (argv.has('--rules')) {
	console.log('\n文本污染规则表（口径实现在 scripts/lib/text-integrity.mjs）\n');
	for (const rule of TEXT_RULES) {
		console.log(`  ${rule.id}`);
		console.log(`      现象：${rule.label}`);
		console.log(`      为什么算污染：${rule.why}`);
	}
	console.log('');
	process.exit(0);
}

const { files, issues } = scanTextIntegrity(ROOT);

if (argv.has('--json')) {
	console.log(JSON.stringify({ scannedFiles: files.length, issues }, null, '\t'));
	process.exit(issues.length === 0 ? 0 : 1);
}

console.log('');
console.log('文本污染门禁（check-text-integrity）');
console.log(`  扫描文件：${files.length}`);
console.log(`  规则：${TEXT_RULES.map((r) => r.id).join(' / ')}`);
console.log('');

if (issues.length === 0) {
	console.log(
		'  ✓ 无命中 —— 没有控制字符污染、没有乱码、没有被吞进注释的代码、没有重复的注释块。'
	);
	console.log('');
	process.exit(0);
}

console.log(`  ✗ ${issues.length} 处命中：`);
for (const issue of issues) {
	const rule = TEXT_RULES.find((r) => r.id === issue.rule);
	console.log(`    ${issue.rel}:${issue.line}  [${issue.rule}]  ${issue.detail}`);
	console.log(`        ${rule?.why ?? ''}`);
}
console.log('');
console.log('  修法：按上面每一行的「现象」还原被吃掉的字符 / 拆回被吞进注释的语句。');
console.log('  注意：这类污染**语法合法**，`tsc` 与 `oxlint` 都不会报 —— 不要靠它们兜底。');
console.log('');
process.exit(1);
