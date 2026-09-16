/**
 * 元素数据（P4b 的存储层）：数据挂进 WeakMap，不污染 DOM 元素自身。
 *
 * **为什么在 ui-kit**：ui-kit 的巨石元素工厂（`YMCommandList/command-api.ts`、`YMTreeList/tree-api.ts`）
 * 也大量读写这些字段（`this.start` 等，两个文件合计 164 处），而 ui-kit **不能依赖 editor**——
 * 于是把这份"存储 + 原型访问器"放到 ui-kit，editor 侧保留同路径的**再导出**（`@app/utils/element-data`
 * 继续可用，`main.ts` 的副作用导入仍然生效）。
 *
 * 行为与迁移前完全一致：仍是 DATA_FIELDS 所列字段的 get/set + `getElementData(el)`
 * （字段数随 P4b 各刀递减，见 docs/remaining-work.md 的 P4b 小节）。
 */
const elementDataMap = new WeakMap<HTMLElement, Record<string, unknown>>();

function getElementDataStore(el: HTMLElement): Record<string, unknown> {
	let data = elementDataMap.get(el);
	if (!data) {
		data = {};
		elementDataMap.set(el, data);
	}
	return data;
}

const DATA_FIELDS = [
	'dataValue',
	'dragging',
	'start',
	'number',
	'selection',
	'filter',
	'dataItems',
	'parameters',
	'key',
	'target',
	'count',
	'direction',
	'end',
	'selections',
	'origin',
	'active',
	'anchor',
	'inserting',
	'focusing',
	'expanded',
	'changed',
	'group',
	'item',
	'indent',
	'visible',
	'mode'
] as const;

/**
 * P4b 迁移探针（**临时脚手架**，退役前删除）。
 *
 * 为什么需要它：静态扫描只能按「接收者类型」猜——`any` 接收者与「元素自己装了同名 own 访问器」
 * 都会被误判成元素数据，而真正残留的站点又可能藏在解构 / 强制转换写法里。启用后，**每一次经由原型
 * 访问器的读写**都会记录「字段 + 调用栈里的源码位置」，于是"还有谁在用访问器"变成可实测的事实。
 *
 * 启用方式（默认关闭、零开销）：环境变量 `P4B_PROBE=1`；命中以 `P4B_PROBE<TAB>字段<TAB>栈帧`
 * 打印到测试输出（不写文件，避免在浏览器包里引入 node 内置模块）。
 */
const P4B_PROBE_ENABLED = typeof process !== 'undefined' && process.env?.P4B_PROBE === '1';
/** P4b 退役验收模式：任何**真实**的访问器使用都直接抛错（见 probeAccess 的说明）。 */
const P4B_STRICT_ENABLED = typeof process !== 'undefined' && process.env?.P4B_STRICT === '1';
const probe = P4B_PROBE_ENABLED ? { reported: new Set<string>(), counts: new Map<string, number>() } : null;

function probeAccess(field: string): void {
	// P4B_STRICT=1：退役验收用。除"库内部读 `mode`"（jsdom 的选择器引擎会 destructure
	// `{ host, mode, nodeType, parentNode }`）之外，任何访问器使用都抛错——于是"还有谁在用"
	// 从"探针可能采样漏掉"变成"跑一次套件就知道"，而且失败点就是待迁移的站点。
	if (P4B_STRICT_ENABLED) {
		let immediate = '';
		const stack = new Error().stack ?? '';
		for (const line of stack.split('\n')) {
			if (!/^\s*at\s/.test(line)) continue;
			if (/utils[\\/]element-data\.ts/.test(line)) continue;
			immediate = line.trim();
			break;
		}
		const externalModeRead = field === 'mode' && !/packages[\\/](editor|ui-kit)[\\/](src|main)[\\/]/.test(immediate);
		if (!externalModeRead) {
			throw new Error(
				`P4b: element data field "${field}" is still read/written through the prototype accessor.\n${stack}`
			);
		}
	}
	if (probe === null) return;
	// 探针绝不允许影响被测代码：任何异常都被吞掉（历史上它曾在 jsdom 选择器路径里抛错，
	// 连带弄红 17 个无关用例）。
	try {
		const seen = (probe.counts.get(field) ?? 0) + 1;
		probe.counts.set(field, seen);
		// 采样取栈：每 25 次命中记一次调用点。站点在用例里通常会被执行多次，采样足以覆盖，
		// 而取栈本身有成本——不采样会让探针把整个套件拖慢一个数量级。
		if (seen % 25 !== 0) return;
		let immediate = '';
		let ours = '';
		const stack = new Error().stack ?? '';
		for (const line of stack.split('\n')) {
			if (!/^\s*at\s/.test(line)) continue;
			if (/utils[\\/]element-data\.ts/.test(line)) continue; // 探针自身/访问器实现不算调用方
			const trimmed = line.trim();
			if (immediate === '') immediate = trimmed;
			if (!/packages[\\/](editor|ui-kit)[\\/](src|main)[\\/]/.test(line)) continue;
			ours = trimmed;
			break;
		}
		const key = `${field}\t${ours === '' ? '(no-own-frame)' : ours}\t${immediate}`;
		if (probe.reported.has(key)) return;
		probe.reported.add(key);
		console.log(`P4B_PROBE\t${key}`);
	} catch {
		/* 探针失败一律忽略 */
	}
}

function defineDataAccessors(): void {
	for (const field of DATA_FIELDS) {
		Object.defineProperty(HTMLElement.prototype, field, {
			configurable: true,
			get(this: HTMLElement) {
				probeAccess(field);
				return getElementDataStore(this)[field];
			},
			set(this: HTMLElement, value: unknown) {
				probeAccess(field);
				getElementDataStore(this)[field] = value;
			}
		});
	}
}

defineDataAccessors();

export function getElementData(el: HTMLElement): Record<string, unknown> {
	return getElementDataStore(el);
}

/**
 * P4b 的迁移助手：把元素数据**当成给定形状**读（`getElementData` 返回 `Record<string, unknown>`，
 * 直接取字段会拿到 `unknown` 而无法参与运算——P4b 第五刀的负结果就是这么来的）。
 * 传进来的类型必须是"该元素上真实存在的字段形状"（例如 `NodeElement`、`FolderElement`），
 * 迁移时逐个字段把 `el.x` 换成 `elementDataOf<Shape>(el).x`。
 */
export function elementDataOf<T>(el: unknown): T {
	return getElementData(el as HTMLElement) as unknown as T;
}

/**
 * P4b：元素 API 工厂的"只装配一次"守卫。
 *
 * 20 个 `*-api.ts` 原先都写成 `if (box._initialized) return box;` … `box._initialized = true;`，
 * 靠 `HTMLElement.prototype` 上的 `_initialized` 访问器落到 WeakMap。现在改走这两个 helper，
 * `_initialized` 也从 `DATA_FIELDS` 摘掉——调用点仍然是一行，语义完全相同。
 */
export function isApiAttached(el: unknown): boolean {
	return elementDataOf<{ _initialized?: boolean }>(el)._initialized === true;
}

export function markApiAttached(el: unknown): void {
	elementDataOf<{ _initialized?: boolean }>(el)._initialized = true;
}
