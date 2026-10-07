import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '..', '..', '..');
const SRC = join(ROOT, 'src');

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) walk(p, out);
		else if (entry.name.endsWith('.vue') || entry.name.endsWith('.ts')) out.push(p);
	}
	return out;
}

function stripComments(code: string): string {
	return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('全局挂载审计（window/globalThis 挂载点清除固化）', () => {
	it('浏览器 window 挂载仅保留 window.Window（ui-kit 消费）', () => {
		const files = walk(SRC).filter((p) => !/__tests__[\\/]|\.spec\.ts$/.test(p));
		const violations: string[] = [];
		const windowWrite = /(^|[^\w.\]])(window)\s*\.\s*[A-Za-z_$][\w$]*\s*=/;
		for (const p of files) {
			const code = stripComments(readFileSync(p, 'utf8'));
			for (const line of code.split('\n')) {
				if (!windowWrite.test(line)) continue;
				if (line.includes('window.Window =') || line.includes('window.Window =')) continue;
				if (line.includes('__yamiLayoutDebug')) continue;
				violations.push(relative(ROOT, p) + ': ' + line.trim());
			}
		}
		expect(violations).toEqual([]);
	});

	it('window as unknown 类型断言的读模式已清零（仅剩布局调试钩子豁免）', () => {
		const files = walk(SRC).filter(
			(p) => p !== __filename && !p.endsWith('bridge-integrity.spec.ts')
		);
		const violations: string[] = [];
		for (const p of files) {
			const code = stripComments(readFileSync(p, 'utf8'));
			for (const line of code.split('\n')) {
				if (line.includes('__yamiLayoutDebug')) continue;
				if (line.includes('window as unknown as') || line.includes('(window as any)')) {
					violations.push(relative(ROOT, p) + ': ' + line.trim());
				}
			}
		}
		expect(violations).toEqual([]);
	});

	it('globalThis 挂载已全部迁移', () => {
		const files = walk(SRC).filter((p) => p !== __filename);
		const violations: string[] = [];
		for (const p of files) {
			const code = stripComments(readFileSync(p, 'utf8'));
			if (code.includes('globalThis')) {
				violations.push(relative(ROOT, p));
			}
		}
		expect(violations).toEqual([]);
	});
});
