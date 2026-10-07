import { describe, expect, it } from 'vitest';
import { getUIStore, uiStateKeys } from '@app/stores/ui';
import { UI } from '@app/engine/ui/ui-singleton.ts';
import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import { uiEls } from '@app/engine/ui/element-registry';
import type { UINodeShape } from '@app/engine/ui/element-classes.ts';

/**
 * 最小节点样本。
 *
 * 会被 `tsc` 拒绝（缺 `name` / `transform` / `presetId` / `enabled` / `parent`）——
 * 这正是那条索引签名过去掩盖的东西：本测试只关心 `target` 的存取，但**节点数据的形状是契约**，
 * 样本就该按契约造。这里的取值都是「中性初值」（不变换、启用、无父节点）。
 */
const minimalNode = (className: string): UINodeShape => ({
	class: className,
	children: [],
	name: className,
	transform: {
		anchorX: 0,
		anchorY: 0,
		x: 0,
		x2: 0,
		y: 0,
		y2: 0,
		width: 0,
		width2: 0,
		height: 0,
		height2: 0,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		skewX: 0,
		skewY: 0,
		opacity: 1
	},
	presetId: '',
	enabled: true,
	parent: null
});

describe('useUIStore（UI 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getUIStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.zoom).toBe(null);
		expect(store.width).toBe(null);
		expect(store.height).toBe(null);
		expect(store.mode).toBe(null);
	});

	it('状态键覆盖全部 store 字段', () => {
		const store = getUIStore();
		for (const key of uiStateKeys) {
			expect(key in store, `uiStateKeys 里的 ${key} 在 store 上不存在`).toBe(true);
		}
		expect(new Set(uiStateKeys).size).toBe(uiStateKeys.length);
	});

	it('六个原始桥接键仍在（回归保护）', () => {
		for (const key of ['state', 'target', 'zoom', 'width', 'height', 'mode']) {
			expect(uiStateKeys).toContain(key);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getUIStore();
		store.state = 'open';
		expect(store.state).toBe('open');
		store.target = minimalNode('image');
		expect(store.target?.class).toBe('image');
		store.zoom = 2;
		expect(store.zoom).toBe(2);
		store.width = 480;
		expect(store.width).toBe(480);
		store.height = 320;
		expect(store.height).toBe(320);
		store.mode = 'select';
		expect(store.mode).toBe('select');
		store.state = 'closed';
		store.target = null;
		store.zoom = null;
		store.width = null;
		store.height = null;
		store.mode = null;
	});

	it('引擎写入经 store 生效（store 为源）', () => {
		const store = getUIStore();
		UIEngine.setZoom!.call(UI, 2);
		expect(store.zoom).toBe(2);
		UIEngine.setZoom!.call(UI, 0);
		expect(store.zoom).toBe(0);
		UI.state = 'open';
		expect(store.state).toBe('open');
		UI.state = 'closed';
		expect(store.state).toBe('closed');
		UI.target = minimalNode('image');
		expect(store.target?.class).toBe('image');
		UI.target = null;
		expect(store.target).toBe(null);
		UI.width = 480;
		expect(store.width).toBe(480);
		UI.height = 320;
		expect(store.height).toBe(320);
		UI.mode = 'select';
		expect(store.mode).toBe('select');
	});

	it('store 的 7 个引擎动作走「引擎注册表」转发（回归保护：曾经是静默 no-op）', async () => {
		const { uiWindowReady } = await import('@app/engine/ui/ui-singleton.ts');
		await uiWindowReady;
		const store = getUIStore();
		store.setZoom(3);
		expect(store.zoom).toBe(3);
		store.setZoom(0);
		expect(store.zoom).toBe(0);
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getUIStore();
		store.state = 'open';
		expect(UI.state).toBe('open');
		store.zoom = 2;
		expect(UI.zoom).toBe(2);
		store.mode = 'select';
		expect(UI.mode).toBe('select');
		store.state = 'closed';
		store.zoom = null;
		store.mode = null;
	});

	describe('DOM 引用从元素注册表派生', () => {
		const derived = [
			['list', 'ui-list'],
			['head', 'ui-head'],
			['body', 'ui-body'],
			['screen', 'ui-screen']
		] as const;

		/** 就地登记，返回还原函数——注册表是模块级共享 Map，不能污染同文件其他用例 */
		const seed = (id: string, el: unknown): (() => void) => {
			const had = uiEls.has(id);
			const prev = uiEls.get(id);
			uiEls.set(id, el as never);
			return () => {
				if (had) uiEls.set(id, prev as never);
				else uiEls.delete(id);
			};
		};

		it('未登记时为 null（不抛错）', () => {
			const store = getUIStore();
			const restores = derived.map(([, id]) => seed(id, null));
			try {
				for (const [key] of derived) {
					expect(store.elements[key], `未登记时 ${key} 应为 null`).toBe(null);
				}
			} finally {
				for (const restore of restores) restore();
			}
		});

		it('登记后立即读出该元素（这正是桥接方案失败的那条路径）', () => {
			const store = getUIStore();
			for (const [key, id] of derived) {
				const el = { tag: id, unselect: () => undefined, focus: () => undefined };
				const restore = seed(id, el);
				try {
					expect(store.elements[key], `${id} 登记后 ${key} 应读出该元素`).toBe(el);
				} finally {
					restore();
				}
			}
		});

		it('跟随注册表**当前**内容，而不是首次读到的快照', () => {
			const store = getUIStore();
			const first = { tag: 'first' };
			const second = { tag: 'second' };
			const restore = seed('ui-list', first);
			try {
				expect(store.elements.list).toBe(first);
				uiEls.set('ui-list', second as never);
				expect(store.elements.list, '注册表换元素后应随之变化（不是缓存快照）').toBe(
					second
				);
			} finally {
				restore();
			}
		});

		it('先读后登记也必须生效（防 computed 永久缓存回归）', () => {
			const store = getUIStore();
			const restore = seed('ui-list', null);
			try {
				expect(store.elements.list, '预置：登记前应为 null').toBe(null);
				const el = { tag: 'late' };
				uiEls.set('ui-list', el as never);
				expect(
					store.elements.list,
					'登记前读过一次之后，登记后必须能读出元素（computed 会永久缓存 null）'
				).toBe(el);
			} finally {
				restore();
			}
		});

		it('这四个键不在 uiStateKeys 里（只读派生，不能从单例桥接写入）', () => {
			for (const [key] of derived) {
				expect(
					uiStateKeys,
					`${key} 是只读派生访问器，不该出现在桥接写入白名单 uiStateKeys 里`
				).not.toContain(key);
			}
		});
	});

	describe('可写字段的写入-读回契约', () => {
		it('root / nodes / history 写入后能读回（确认 store 侧有真实存储）', () => {
			const store = getUIStore();
			const root = { addReference: () => undefined };
			const nodes = [{ class: 'image', children: [] }];
			const history = { save: () => undefined };
			try {
				store.root = root as never;
				store.nodes = nodes as never;
				store.history = history as never;
				expect(store.root).toBe(root);
				expect(store.nodes).toBe(nodes);
				expect(store.history).toBe(history);
			} finally {
				store.root = null;
				store.nodes = null;
				store.history = null;
			}
		});

		it('elements.target 跟随 store 的 target（遗留 UI.updateTargetItem 的取值口）', () => {
			const store = getUIStore();
			const node = { class: 'image', children: [] };
			try {
				expect(store.elements.target, '初始应为 null').toBe(null);
				store.target = node as never;
				expect(store.elements.target, 'elements.target 必须反映 store 的 target').toBe(
					node
				);
			} finally {
				store.target = null;
			}
			expect(store.elements.target).toBe(null);
		});

		it('scroll*/dragging/hover 是委托访问器而不是 store 私有存储', () => {
			const store = getUIStore();
			const ui = UI as unknown as Record<string, unknown>;

			const descriptors = Object.getOwnPropertyDescriptors(store);
			for (const key of ['scrollLeft', 'scrollTop', 'scrollRight', 'scrollBottom']) {
				expect(
					descriptors[key]?.get ?? descriptors[key]?.value,
					`${key} 应存在`
				).toBeDefined();
			}

			ui.scrollLeft = 11;
			expect(ui.scrollLeft).toBe(11);
			ui.scrollLeft = 22;
			expect(ui.scrollLeft, '遗留单例本身必须是普通可写属性').toBe(22);

			const node = { class: 'image' };
			ui.hover = node;
			expect(ui.hover).toBe(node);
		});

		it('loadFromConfig 把配色写进 store（drawBackground 的真源）', () => {
			const store = getUIStore();
			try {
				store.loadFromConfig({
					colors: { uiBackground: '1e1e1eff', uiForeground: 'ffffffff' }
				});
				expect(
					store.background?.hex,
					'store.background 必须是配置里的颜色，不能停在透明兜底值'
				).toBe('1e1e1eff');
				expect(store.foreground?.hex).toBe('ffffffff');
			} finally {
				store.loadFromConfig({
					colors: { uiBackground: '00000000', uiForeground: '000000ff' }
				});
			}
		});

		it('loadFromConfig 对畸形/缺失/6 位颜色归一化（不产生 NaN alpha）', () => {
			const store = getUIStore();
			store.loadFromConfig({ colors: { uiBackground: 'not-a-color' } });
			expect(store.background?.hex, '非 hex 应回退').toBe('00000000');
			store.loadFromConfig({ colors: {} });
			expect(store.background?.hex, '缺项应回退').toBe('00000000');
			store.loadFromConfig({ colors: { uiBackground: '1e1e1e' } });
			expect(store.background?.hex, '6 位应补成不透明').toBe('1e1e1eff');
			expect(
				Number.isNaN(store.background!.alpha),
				`alpha 不能是 NaN（6 位 hex 曾导致 slice(6,8) 解析失败），实得 ${store.background!.alpha}`
			).toBe(false);
			expect(store.background!.alpha, '6 位应视为完全不透明').toBe(1);
			store.loadFromConfig({
				colors: { uiBackground: '00000000', uiForeground: '000000ff' }
			});
		});
	});
});
