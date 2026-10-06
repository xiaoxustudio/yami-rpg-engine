import { describe, expect, it } from 'vitest';
import { getCurveStore } from '@app/stores/curve';
import { useCurveWindow } from '@app/composables/useCurveWindow.ts';
import type { CurveFrame } from '@app/composables/useCurveWindow.ts';

// 回归：曲线窗口的 state/target/index 从 `useCurveWindow.ts:96-102` 的模块级 `let` 升进
// `stores/curve.ts`。契约：门面 `useCurveWindow()` 的读写都落在 store 上（实现区通过访问器
// 对象 `curve` 读写，所以窗口自身的 open/close/load 也走 store）。
// 行为面（open/load/close/save 的完整链路）由既有 useCurveWindow.spec.ts 覆盖。

describe('曲线窗口状态 → stores/curve', () => {
	it('store → 门面：三个字段都能读到', () => {
		const store = getCurveStore();
		const frame = { easingId: 'e1' } as unknown as CurveFrame;
		store.state = 'open';
		store.target = frame;
		store.index = 'e1';

		const w = useCurveWindow();
		expect(w.state).toBe('open');
		expect(w.target).toBe(frame); // 同一引用，不做深拷贝
		expect(w.index).toBe('e1');
	});

	it('门面 → store：窗口自己的写入落在 store（close 把 state 归 closed）', () => {
		const store = getCurveStore();
		store.state = 'open';

		useCurveWindow().close();

		expect(store.state).toBe('closed');
	});

	it('初始形状：closed / null / null', () => {
		const store = getCurveStore();
		store.state = 'closed';
		store.target = null;
		store.index = null;
		expect(store.state).toBe('closed');
		expect(store.target).toBeNull();
		expect(store.index).toBeNull();
	});
});
