import { describe, expect, it, vi } from 'vitest';

const mockGL = vi.hoisted(() => ({ width: 800, height: 600 }));
vi.mock('@app/engine/webgl/webgl-init.ts', () => ({ GL: mockGL }));

import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import { UI } from '@app/engine/ui/ui-singleton.ts';
import { loadWindow } from '@app/tools/window-registry.ts';
import { loadUI } from '@app/stores/ui.ts';

const DRAW_CALLS = [
	'drawBackground',
	'drawElements',
	'drawCoordinateAxes',
	'drawHoverWireframe',
	'drawTargetWireframe',
	'drawTargetAnchor',
	'drawControlPoints'
] as const;

describe('1c ④ 前置：renderingFunction 的 7 个 draw 必须以 UI 为接收者执行', () => {
	it('裸调用 renderingFunction（this 为 undefined）时，7 个 draw 仍全部执行且接收者非空', async () => {
		await loadWindow('ui', loadUI);

		const seen: { name: string; receiver: unknown }[] = [];
		const saved = new Map<string, unknown>();
		const engine = UIEngine as Record<string, unknown>;
		const uiObject = UI as unknown as Record<string, unknown>;

		for (const name of DRAW_CALLS) {
			saved.set(name, engine[name]);
			const spy = vi.fn(function (this: unknown) {
				seen.push({ name, receiver: this });
			});
			engine[name] = spy;
			uiObject[name] = spy;
		}

		try {
			const render = UIEngine.renderingFunction as () => void;
			expect(
				(UIEngine as Record<string, unknown>).renderingFunction,
				'renderingFunction 必须真的挂在 UIEngine 上（否则下面的取函数会拿到 undefined）'
			).toBe(render);
			render();
		} finally {
			for (const name of DRAW_CALLS) engine[name] = saved.get(name);
		}

		expect(
			seen.map((s) => s.name),
			'7 个 draw 必须全部执行（漏一个就是「提前 return」那类静默失效）'
		).toEqual([...DRAW_CALLS]);

		for (const s of seen) {
			expect(
				s.receiver,
				`${s.name} 的接收者是 undefined ⇒ 实现里的 this.scaleX / this.centerX 取不到值 ⇒ 画布一片黑`
			).toBeDefined();
		}
	});
});
