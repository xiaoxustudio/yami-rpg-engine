import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Palette } from '@app/palette/palette.ts';
import '@app/palette/palette-pointer.ts';

const SOURCE = resolve(process.cwd(), 'src/palette/palette-pointer.ts');

/** 返回「pointerup 注册后紧邻两行内没有 pointercancel」的行号。 */
function registrationsMissingCancel(source: string): number[] {
	const lines = source.split('\n');
	const missing: number[] = [];
	for (let i = 0; i < lines.length; i++) {
		if (!/^\s*window\.addEventListener\('pointerup', this\.pointerup\);$/.test(lines[i]))
			continue;
		if (
			!lines
				.slice(i + 1, i + 3)
				.some((line) => line.includes("addEventListener('pointercancel'"))
		) {
			missing.push(i + 1);
		}
	}
	return missing;
}

describe('palette 拖拽的系统取消（pointercancel）', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('pointercancel 结束拖拽并摘除三个全局监听', () => {
		const remove = vi.spyOn(window, 'removeEventListener');
		Palette.dragging = { mode: 'scroll' } as never;

		Palette.pointercancel(new PointerEvent('pointercancel'));

		expect(Palette.dragging).toBeNull();
		expect(remove.mock.calls.map((call) => call[0]).sort()).toEqual([
			'pointercancel',
			'pointermove',
			'pointerup'
		]);
	});

	it('每处 pointerup 注册都配了 pointercancel', () => {
		expect(registrationsMissingCancel(readFileSync(SOURCE, 'utf8'))).toEqual([]);
	});

	it('检测器自身：缺 pointercancel 的注册会被报出', () => {
		expect(
			registrationsMissingCancel(
				"window.addEventListener('pointerup', this.pointerup);\nwindow.addEventListener('pointermove', this.pointermove);"
			)
		).toEqual([1]);
		expect(
			registrationsMissingCancel(
				"window.addEventListener('pointerup', this.pointerup);\nwindow.addEventListener('pointercancel', this.pointercancel);"
			)
		).toEqual([]);
	});

	it('正常 pointerup 路径也摘除 pointercancel', () => {
		const source = readFileSync(SOURCE, 'utf8');
		const finallyBlock = source.slice(source.indexOf('} finally {'));
		expect(finallyBlock).toContain("removeEventListener('pointercancel', this.pointercancel)");
	});
});
