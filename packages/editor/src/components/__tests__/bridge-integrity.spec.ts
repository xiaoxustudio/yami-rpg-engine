import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
	it('所有 (window as any).Xxx?.method 桥接目标在迁移后源码中存在', () => {
		// ⚠️ 这份根目录清单**必须跟着目录结构调整**。
		// 2026-09-20 纯移动把 `src/ui/` 整个搬到 `src/engine/ui/legacy/`：
		// 当时 `src/ui` 只剩一个空目录，`walk()` 返回 []，用例**照样绿**（覆盖悄悄变小）；
		// 空目录一被删掉，`readdirSync` 直接 ENOENT ⇒ 用例红。
		// 两种表现都不对，所以下面加了「根目录必须存在」的显式断言：
		// **宁可红在「清单过期」，也不要绿在「覆盖变小」。**
		//
		// 2026-09-25 第 212 轮（④-4 收口）：单例从 `engine/ui/legacy/` 搬到 `engine/ui/`、
		// `legacy/` 整个删除 ⇒ 本清单把 `'engine/ui/legacy'` 换成 **`'engine/ui'`**
		// （覆盖面**变大**了：域模块也进了审计面。这正是那条断言的用意 —— 它红了，我就得更新清单）。
		const legacyRoots = [
			'animation',
			'attribute',
			'audio',
			'components',
			'data',
			'engine/ui',
			'enum',
			'file',
			'inspector',
			'local',
			'log',
			'main',
			'module',
			'palette',
			'particle',
			'plugin',
			'printer',
			'title',
			'tools',
			'utils',
			'variable'
		];
		const legacyFiles = legacyRoots.flatMap((d) => {
			const root = join(ROOT, 'src', d);
			if (!existsSync(root)) {
				throw new Error(
					`bridge-integrity: 待审根目录不存在 → src/${d}\n` +
						'目录被搬走了就必须更新这份清单（否则本审计的覆盖会静默变小）。'
				);
			}
			return walk(root);
		});
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
