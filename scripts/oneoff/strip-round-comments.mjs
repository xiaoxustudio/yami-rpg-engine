// 一次性：清掉「第 N 轮 …」这类重构溯源注释。
//
// 用法：
//   node scripts/oneoff/strip-round-comments.mjs            # 干跑，只报告
//   node scripts/oneoff/strip-round-comments.mjs --write    # 真正写回
//
// 安全规则（本会话有过批量替换误删 220 行的前车之鉴，规则刻意收窄）：
//   1. 只处理**整行都是注释**的行：`// …` 或块注释里的 `* …` / `/** …` / `*/`；
//   2. 行内含 `第 <数字> 轮` 才删；
//   3. 若所在块注释里出现「未完成 / 待定 / 收口计划 / 待办 / 工作单」等**未完成任务标记**，
//      整个块一行都不动（任务没做完前，注释里的工单要留着）；
//   4. 删空后的 `/** … */` 空块一并去掉；
//   5. 含代码的行永不改动；行尾注释永不改动。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WRITE = process.argv.includes('--write');
const ROOT = 'packages/editor/src';
const ROUND = /第\s*\d+\s*轮/;
const TODO = /未完成|待定|收口计划|待办|工作单|尚未|未落地|下一轮|待收口/;
const LINE_COMMENT = /^\s*\/\//;
const BLOCK_ONLY = /^\s*(\/\*\*?|\*|\*\/)/;

const files = [];
(function walk(dir) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full);
		else if (name.endsWith('.ts')) files.push(full);
	}
})(ROOT);

let removed = 0;
const report = [];
for (const file of files) {
	const text = readFileSync(file, 'utf8');
	const eol = text.includes('\r\n') ? '\r\n' : '\n';
	const lines = text.split(/\r?\n/);
	const keep = Array.from({ length: lines.length }, () => true);

	// 1) 整行 // 注释
	for (let i = 0; i < lines.length; i++) {
		if (LINE_COMMENT.test(lines[i]) && ROUND.test(lines[i])) keep[i] = false;
	}
	// 2) 块注释：先按 /** … */ 分段判定
	for (let i = 0; i < lines.length; i++) {
		if (!/^\s*\/\*\*?/.test(lines[i])) continue;
		let end = i;
		while (end < lines.length && !/\*\/\s*$/.test(lines[end])) end++;
		if (end >= lines.length) continue; // 跨到文件尾，放弃
		const block = lines.slice(i, end + 1);
		const allComment = block.every((l) => l.trim() === '' || BLOCK_ONLY.test(l));
		if (!allComment) {
			i = end;
			continue;
		}
		const bodyText = block.join('\n');
		if (TODO.test(bodyText)) {
			i = end;
			continue; // 未完成的工单：整块保留
		}
		const hasRound = block.some((l) => ROUND.test(l));
		if (!hasRound) {
			i = end;
			continue;
		}
		const body = block
			.filter((l) => !ROUND.test(l))
			.filter((l) => l.trim() !== '' && !/^\s*(\/\*\*?|\*\/)\s*$/.test(l));
		if (body.every((l) => l.trim() === '*')) {
			for (let k = i; k <= end; k++) keep[k] = false; // 整块只剩轮次叙述 ⇒ 全删
		} else {
			for (let k = i + 1; k < end; k++) if (ROUND.test(lines[k])) keep[k] = false; // 保留块壳与仍有用的话
		}
		i = end;
	}
	// 3) 整行 /** … */ 单行块
	for (let i = 0; i < lines.length; i++) {
		if (/^\s*\/\*\*?.*\*\/\s*$/.test(lines[i]) && ROUND.test(lines[i]) && !TODO.test(lines[i]))
			keep[i] = false;
	}

	const kept = lines.filter((_, idx) => keep[idx]);
	const hit = lines.length - kept.length;
	if (hit > 0) {
		removed += hit;
		report.push(`${file}: ${hit}`);
		if (WRITE) writeFileSync(file, kept.join(eol), 'utf8');
	}
}
console.log(
	`files with hits: ${report.length}, lines removed: ${removed}${WRITE ? '' : ' (dry run)'}`
);
for (const line of report.slice(0, 40)) console.log('  ' + line);
