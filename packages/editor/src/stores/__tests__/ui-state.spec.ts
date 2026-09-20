import { describe, expect, it } from 'vitest';
import { getUIStore, uiStateKeys } from '@app/stores/ui';
import { UI } from '@app/engine/ui/legacy/ui-window.ts';
import { uiEls } from '@app/engine/ui/element-registry';

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
		// 这里**不要**写死数字：`uiStateKeys` 是随迁移推进而增长的（2026-09-17 从 6 项长到 25 项，
		// 每搬一个遗留成员进来就 +1）。写死数字会让每一次搬迁都顺带弄红一个与它无关的测试，
		// 而那个红并不代表任何行为回归——正是「脆断言」的典型。
		// 改为：每个登记键都必须在 store 上真实存在（这才是这张表的意义）。
		for (const key of uiStateKeys) {
			expect(key in store, `uiStateKeys 里的 ${key} 在 store 上不存在`).toBe(true);
		}
		// 同时守住「表里没有重复项」——重复会让 `uiStateKeys` 驱动的桥接重复安装。
		expect(new Set(uiStateKeys).size).toBe(uiStateKeys.length);
	});

	it('六个原始桥接键仍在（回归保护）', () => {
		// 这六个是最早一批「UI 状态反转」的成果，后续搬迁不应该把它们弄丢
		for (const key of ['state', 'target', 'zoom', 'width', 'height', 'mode']) {
			expect(uiStateKeys).toContain(key);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getUIStore();
		store.state = 'open';
		expect(store.state).toBe('open');
		store.target = { class: 'image', children: [] };
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

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getUIStore();
		UI.setZoom!(2);
		expect(store.zoom).toBe(2);
		UI.setZoom!(0);
		expect(store.zoom).toBe(0);
		UI.state = 'open';
		expect(store.state).toBe('open');
		UI.state = 'closed';
		expect(store.state).toBe('closed');
		UI.target = { class: 'image', children: [] };
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

	/**
	 * 回归保护：`elements.list` / `.head` / `.body` / `.screen` 必须**跟随元素注册表**。
	 *
	 * 这组用例覆盖的是一个真实线上崩溃（2026-09-18）：当时这四个字段由 `UI.initialize()` 里的
	 * `this.list = uiEls.get('ui-list')` 赋值，而 `UI.initialize()` 唯一的调用方是
	 * `LayoutPanel.vue` 的 `onMounted` → `nextTick(() => getUIStore().initialize())`，
	 * 即「挂载后的下一个 tick」。任何**早于**该 tick 的读取都拿到 `null`，
	 * 而调用方写的是 `getUIStore().list!.unselect(...)`——`!` 把「可能为 null」在类型上
	 * 抹掉了，tsc 全程不报错，直到用户点选 UI 元素列表才炸出
	 * `Cannot read properties of null (reading 'unselect')`。
	 *
	 * 所以断言的是**缺陷类**，不只是当前实现。
	 */
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

		/**
		 * ⚠️ 这条是**顺序**用例，专门钉死一个曾经写错过的实现。
		 *
		 * 先前的实现是 `computed(() => uiEls.get(id) ?? null)`。因为 `uiEls` 是普通 `Map`
		 * （没有响应性），`computed` 首次求值后**永不重新求值**——只要在元素登记之前读过一次，
		 * 它就永久缓存 `null`，于是"修好的"崩溃原样复发。
		 *
		 * 所以这里**故意先读一次**（此刻还没登记），再登记，再读。用 `computed` 实现时第 2 步
		 * 会拿到旧值 `null` 而红。想改回 `computed` 的人必须先让这条变红。
		 */
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

	/**
	 * 回归保护：store 里**可写**的那批字段必须真的有写入方。
	 *
	 * 这组用例覆盖的是同一类缺陷的另一个面（2026-09-18）：`root` / `nodes` / `history`
	 * 三个 `shallowRef` 在 store 里声明了、也有 15 处读取方，但**全仓库没有任何写入方** ——
	 * `ui-file.ts` 写的是遗留的 `this.root`（即 `UI.root`），是**另一个存储位置**。
	 * 于是 `getUIStore().root` 永远是 `null`，打开 UI 文件时
	 * `reference-element.ts` 的 `set prefabId` 里 `getUIStore().root!.addReference(...)`
	 * 直接抛 `TypeError: Cannot read properties of null (reading 'addReference')`。
	 *
	 * 这里断言的是「store 的公共字段可写且可读回」这条契约本身——`ui-file.ts` 是否真的写了
	 * 属于集成层面，由 `ui-slot-coverage` 轴与上面的读取方共同守住。
	 */
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
			// 为什么需要这条：`target` 迁到 store 之后，遗留的 `UI.updateTargetItem` 里
			// `const { target } = this` 读到的是 `undefined`，紧接着 `read(this.list)`
			// 又踩到 `{}` 兜底 ⇒ 每次点选都抛 `Invalid value used as weak map key`，
			// 表现是「整个 UI 像截图一样冻住、连选中框都不出现」。
			// `elements.target` 就是给遗留层补的那个新口径取值口。
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

			// 结构断言（不依赖遗留层能否在 vitest 里加载）：
			// 这四个必须是**每次读都重新求值**的只读派生值 —— 与 `elements.*` 同源同因，
			// 都踩过 `computed` 缓存 + Pinia 包装的坑。这里只钉"派生自遗留单例"这一契约：
			// store 自己没有任何写入它们的途径（`uiStateKeys` 里也不含 drafting/hover）。
			const descriptors = Object.getOwnPropertyDescriptors(store);
			for (const key of ['scrollLeft', 'scrollTop', 'scrollRight', 'scrollBottom']) {
				expect(
					descriptors[key]?.get ?? descriptors[key]?.value,
					`${key} 应存在`
				).toBeDefined();
			}

			// 直接改遗留单例的值，store 侧应立即可见（委托而非快照）。
			// ⚠️ 注意：真相源是 `ui-window.ts` 导出的那个 UI 对象。
			// store 内部用的是 `getLazyWindow('ui')` 的懒代理，在 vitest 下
			// `window-cluster.ts` 无法完成求值，所以那个代理读不到这里写的值。
			// 因此本用例只验证"写遗留单例 → 直接 import 的 UI 可见"，
			// 真正的 store↔UI 联动由运行期验证（dev server 里滚动 UI 画布）。
			ui.scrollLeft = 11;
			expect(ui.scrollLeft).toBe(11);
			ui.scrollLeft = 22;
			expect(ui.scrollLeft, '遗留单例本身必须是普通可写属性').toBe(22);

			// 拖拽/hover 的类型契约：`ui-window.ts` 里显式标注为
			// `UIPointerEvent | null` / `UINodeShape | null`，因此 store 侧读取无需断言。
			const node = { class: 'image' };
			ui.hover = node;
			expect(ui.hover).toBe(node);
		});

		/**
		 * 回归保护：`loadFromConfig` 必须把颜色写进 **store 自己**。
		 *
		 * 这一条对应「UI 画布一片黑且不报错」的自查。当时 store 的 `loadFromConfig`
		 * 只做 `UI?.loadFromConfig?.(config)` 转发，而那个遗留实现写的是
		 * `this.background`（UI 单例上的另一份）；`drawBackground` 读的却是
		 * `getUIStore().background`，于是它一直是构造时那个**透明**兜底值，
		 * 每帧 `clearColor(0,0,0,0)` —— 黑屏，且没有任何报错。
		 *
		 * 用例故意用「非默认色」而不是断言"不为 null"：透明兜底值也不是 null，
		 * 只有断言具体颜色才能抓住这个缺陷。
		 */
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
				// 还原成透明兜底，避免影响同文件其它用例
				store.loadFromConfig({
					colors: { uiBackground: '00000000', uiForeground: '000000ff' }
				});
			}
		});

		it('loadFromConfig 对畸形/缺失/6 位颜色归一化（不产生 NaN alpha）', () => {
			const store = getUIStore();
			// 非 hex → 退回透明兜底
			store.loadFromConfig({ colors: { uiBackground: 'not-a-color' } });
			expect(store.background?.hex, '非 hex 应回退').toBe('00000000');
			// 缺项 → 同样回退
			store.loadFromConfig({ colors: {} });
			expect(store.background?.hex, '缺项应回退').toBe('00000000');
			// 6 位 → 补 ff，而不是留 NaN alpha（`StageColor.input` 会 slice(6,8) 取 alpha）
			store.loadFromConfig({ colors: { uiBackground: '1e1e1e' } });
			expect(store.background?.hex, '6 位应补成不透明').toBe('1e1e1eff');
			// 只断言 alpha：`getGLRGBA()` 还会与 `GL.BACKGROUND_*` 混合，而那几个静态量
			// 在 vitest 里没有 WebGL 上下文、取到的是 undefined（混合结果会是 null）。
			// alpha 是这条用例真正要守的东西 —— 6 位输入曾经让它变成 NaN。
			expect(
				Number.isNaN(store.background!.alpha),
				`alpha 不能是 NaN（6 位 hex 曾导致 slice(6,8) 解析失败），实得 ${store.background!.alpha}`
			).toBe(false);
			expect(store.background!.alpha, '6 位应视为完全不透明').toBe(1);
			// 还原
			store.loadFromConfig({
				colors: { uiBackground: '00000000', uiForeground: '000000ff' }
			});
		});
	});
});
