import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) walk(p, out);
		else if (entry.name.endsWith('.vue') || entry.name.endsWith('.ts')) out.push(p);
	}
	return out;
}

describe('迁移桥接目标完整性（防迁移遗漏/拼写错误——9.101 审计固化）', () => {
	it('所有 (window as any).Xxx?.method 桥接目标在 legacy 中存在', () => {
		const legacyFiles = walk(join(ROOT, 'src', 'legacy'));
		const allLegacy = legacyFiles.map((p) => readFileSync(p, 'utf8')).join('\n');
		const vueFiles = walk(join(ROOT, 'src', 'components'));
		const missing: string[] = [];
		for (const p of vueFiles) {
			const c = readFileSync(p, 'utf8');
			const calls = c.match(/\(window as any\)\.(\w+)\??\.(\w+)\??\.\(/g) || [];
			for (const call of calls) {
				const m = call.match(/\(window as any\)\.(\w+)\??\.(\w+)\??\.\(/);
				if (!m) continue;
				const [, name, method] = m;
				if (name === 'Command' && method === 'cases') continue;
				const hasMethod =
					new RegExp(name + '\\.' + method + '\\s*=').test(allLegacy) ||
					new RegExp('static\\s+' + method + '\\s*\\(').test(allLegacy) ||
					new RegExp('\\b' + method + '\\s*\\([^)]*\\)\\s*\\{').test(allLegacy);
				if (!hasMethod) {
					missing.push(relative(ROOT, p) + ': ' + name + '.' + method);
				}
			}
		}
		expect(missing).toEqual([]);
	});
});
