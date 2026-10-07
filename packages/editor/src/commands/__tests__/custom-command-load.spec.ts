import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(process.cwd(), 'src');
const CALL = 'loadCustomCommandList(';

/** 递归列出 src 下的源码文件（跳过 __tests__）。 */
function sourceFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...sourceFiles(full));
		else if (/\.(ts|vue)$/.test(entry.name)) out.push(full);
	}
	return out;
}

/** 返回「调用 loadCustomCommandList 却没处理 rejection」的位置（file:line）。 */
function unhandledCallSites(): string[] {
	const found: string[] = [];
	for (const file of sourceFiles(SRC)) {
		const source = readFileSync(file, 'utf8');
		let index = source.indexOf(CALL);
		while (index >= 0) {
			const before = source.slice(Math.max(0, index - 24), index);
			const after = source.slice(index, index + 200);
			const isDefinition = before.includes('function ');
			const isAwaited = before.endsWith('await ');
			if (!isDefinition && !isAwaited && !after.includes('.catch(')) {
				found.push(file.replace(SRC, '') + ':' + source.slice(0, index).split('\n').length);
			}
			index = source.indexOf(CALL, index + CALL.length);
		}
	}
	return found;
}

describe('loadCustomCommandList 的调用点必须处理 rejection', () => {
	it('每个调用点都挂了 .catch（否则会变成 unhandledRejection）', () => {
		expect(existsSync(SRC), 'vitest 需在 packages/editor 目录内运行').toBe(true);
		expect(unhandledCallSites()).toEqual([]);
	});
});
