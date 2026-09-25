/**
 * `UI` 单例与 store 的**槽位覆盖度**核对——可被台账当作一条轴调用。
 *
 * ## 它守的是什么
 *
 * store 的动作层是 `UI?.x?.()` 形式：**槽位不存在时静默返回 undefined，不报错**。
 * 于是「某个槽位从没被任何模块赋值」这类问题在运行时表现为「某个功能静默不工作」，
 * `tsc`（`UIShape` 有 `[k: string]: any`）与 `oxlint` 都抓不到。
 *
 * 这条轴把三件事摆在一起，让缺口变成**可测量的数字**：
 *   1. 遗留层声明了多少槽位（`ui-window.ts` 的对象字面量）
 *   2. 全仓库实际给多少槽位赋过值（四种写法，见下）
 *   3. store 的动作层引用了哪些槽位、其中哪些**从未被赋值**（= 永远读到 undefined）
 *
 * ## 赋值写法的检测面（宽窄都会得出错误结论，这里逐条说明取舍）
 *
 * - `UI.x = …`（任何模块）—— 主要形式
 * - `uiElClasses.x = …` —— 阶段 1b 起的元素类落点，随后由 `ui-window.ts` 镜像回 `UI`
 * - `this.x = …` —— **仅** `src/ui/**` 内统计：只有在 `src/ui/` 自己的方法里
 *   （那些方法以 `this: UIShape` 声明、由 `UI.open()` 这类以 UI 为接收者的调用触发）
 *   `this` 才等于 UI 单例。全仓库收进来会把每个类的每个字段都算成槽位（实测 152 → 769，全是噪音）。
 * - `UI.x.y = …` / `(UI.x).y = …` —— 对槽位**对象**的成员赋值，算作该槽位被赋值
 *
 * ## 已知局限
 *
 * `uiElClasses` 那条的正则带 `/i`，会顺带匹配到 `WebGLClass.foo =` 之类无关赋值 ⇒
 * 「有赋值」一列偏宽松。它只会让告警**变少**（偏保守），不会凭空制造告警。
 */
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import {
	ROOT,
	SCAN_DIRS,
	collectFiles,
	readSource,
	codeOnly,
	stripComments,
	collectImports
} from './scan.mjs';

/** 阶段 1c 之前的路径；优先用它（快且稳），找不到再动态搜索 */
const LEGACY_WINDOW_REL = 'packages/editor/src/ui/ui-window.ts';

/**
 * **遗留层目录** —— 阶段 1c 的拆除对象。
 *
 * ⚠️ **第 212 轮起它是常量**，不再由「单例文件在哪」推导（`.kilo` 之前那版是
 * `dirname(uiWindowRel())`）。理由：④-4 把单例从 `legacy/` 搬出去之后，那个推导会指向
 * **整个 `engine/ui/`** —— `legacy-ui-lines` 会从 210 行暴涨到全目录的行数（假回归），
 * 而 `legacyOnlyStoreSlots()` 会把每个域模块都当成"遗留层"（`1c-store-slot-gaps` 假回归）。
 * ⇒ 这条轴问的是「**那层遗留还在不在**」，所以目录必须写死成遗留层自己的名字。
 * 历史沿革：P5-B 把 `src/ui/` 挪到 `src/engine/ui/legacy/`（第 66 轮），④-4 把这个目录整个删掉。
 */
export const LEGACY_UI_DIR = 'packages/editor/src/engine/ui/legacy';

/**
 * UI 单例对象字面量所在文件 —— **动态定位，不能写死路径**。
 *
 * ⚠️ 为什么必须动态（2026-09-20，本文件记的第二次同类事故）：
 * 阶段 1c 的第 ② 步会把 `src/ui/` 下的 8 个域模块**原样搬到** `engine/ui/`。
 * 写死路径的话，搬运当轮 `declaredSlots()` 就会**静默返回空数组**：`declared` 从 134
 * 掉到 0，`ui-slot-coverage` 报「改善」——而遗留代码一行没少。这正是本文件头部
 * 已经为「技法 5 改写声明行」记过一次的那种失败：**仪器瞎了，却表现为指标变好。**
 *
 * 定位方式：先试历史路径；否则在扫描面里找含 `export const UI … = {` 声明的那个文件。
 * 声明行怎么写都不影响（类型标注可选），与 `declaredSlots()` 的定位逻辑同源。
 *
 * ⚠️ 找到的**文件位置**对槽位口径**不再有任何影响**：家族目录判据已改用常量
 * `LEGACY_UI_DIR`，`assignedSlots()` 另有「域模块」判据（见 `inFamily`）。本函数只负责回答
 * 「单例字面量在哪」。
 * @returns {string|null} 相对 ROOT 的路径
 */
export function uiWindowRel() {
	if (existsSync(join(ROOT, LEGACY_WINDOW_REL))) return LEGACY_WINDOW_REL;
	for (const { full, rel } of collectFiles({ dirs: SCAN_DIRS })) {
		if (/export const UI\s*(?::[^=]*)?=\s*\{/.test(codeOnly(readSource(full)))) return rel;
	}
	return null;
}

/**
 * 「遗留层」的路径前缀正则 —— 由**常量** `LEGACY_UI_DIR` 构造（理由见该常量）。
 *
 * 用途：`legacyOnlyStoreSlots()`（哪些槽位的实现只在遗留层）与 `assignedSlots()` 的家族判据之一。
 * @returns {RegExp}
 */
export function uiDirRe() {
	return new RegExp(`^${LEGACY_UI_DIR.replace(/\\/g, '/')}/`);
}

/**
 * 声明：`ui-window.ts` 对象字面量里的槽位名。
 *
 * **定位字面量必须对写法免疫。** 第一版写死 `indexOf('export const UI: UIShape = {')`
 * 与 `indexOf('\n};')`，结果技法 5（把 `export const UI: UIShape = { … };` 改写成
 * `export const UI = { … } satisfies Partial<UIShape> as UIShape;`）一落地，
 * 这里就静默返回空数组：`declared` 从 156 掉到 0，看起来像「指标改善」，实际是**仪器瞎了**。
 * 现在改成「先匹配声明（类型标注可有可无），再用花括号配平找闭合」，
 * 声明行怎么写都不影响读数。`codeOnly` 长度保持，所以括号计数不会被字符串/注释里的花括号干扰。
 *
 * 同理，**文件位置也必须对搬运免疫**（见 `uiWindowRel()`）。
 */
export function declaredSlots() {
	const rel = uiWindowRel();
	if (rel === null) {
		// ⚠️ **不能返回 `[]`**（2026-09-22 第 186 轮）：那会让 `declared` 从 134 掉到 0、报表写
		// 「✓ 已完成」—— 而**这恰恰是 ④-4 删掉字面量那一轮必然发生的事**。
		// 「真的删干净了」与「仪器瞎了」必须可区分 ⇒ 缺锚就炸，逼出换锚（见 PHASE-1C 第 185 轮）。
		throw new Error(
			'declaredSlots()：全仓找不到 `export const UI … = {` 字面量。' +
				'这不是「已归零」，而是**仪器失锚**：字面量若已被 ④-4 删除，' +
				'必须先把本轴的锚换成「提供者并集」再重跑棘轮。'
		);
	}
	return declaredSlotsFrom(readSource(join(ROOT, rel)));
}

/**
 * `declaredSlots()` 的**纯函数内核**：只吃源码文本，不看文件在哪。
 *
 * 抽出来是为了让「缺锚」这件事**可自证**（`self-test.mjs`）：纯函数能喂合成样本，
 * 不必去动真实仓库。两条判据 —— 缺字面量 / 花括号不配平 —— **都必须抛错**，不能返回 `[]`：
 * 一个静默的空数组正是这条轴历史上翻过两次车的原因（「仪器瞎了，却表现为指标变好」）。
 * @param {string} src
 * @returns {string[]}
 */
export function declaredSlotsFrom(src) {
	const code = codeOnly(src);
	const m = /export const UI\s*(?::[^=]*)?=\s*\{/.exec(code);
	if (!m) throw new Error('declaredSlotsFrom()：源码里没有 `export const UI … = {` 字面量');
	const open = code.indexOf('{', m.index);
	let depth = 0;
	for (let k = open; k < code.length; k++) {
		if (code[k] === '{') depth++;
		else if (code[k] === '}') {
			depth--;
			if (depth === 0) {
				const literal = src.slice(open, k + 1);
				return [...literal.matchAll(/^\t([A-Za-z_$][\w$]*)\s*:/gm)].map((x) => x[1]);
			}
		}
	}
	throw new Error('declaredSlotsFrom()：字面量的花括号没有配平（源码可能被截断）');
}

/**
 * 单例字面量里的**占位槽位** —— 第 212 轮新增的口径，④-4 的验收线。
 *
 * ## 定义（判据是「谁实现它」，不是「值是不是 null」）
 *
 * > 占位 = 出现在单例字面量里、而**实现由别处提供**的键
 * > （装配入口 `ui-members.ts` 汇总的域成员对象 ∪ `UIEngine.x = …`）。
 *
 * 这正是历史上那 123 行 `initialize: null` / `open: null` / … 的性质：**先在这里声明、后由域模块填充**。
 * 第 ④-3 步改成「域模块只提供成员对象、由 `uiWindowReady` 装配」之后，这张表**没有任何写入方需要用**了。
 *
 * ## 为什么不用「值 == null」当判据（第一版就是这么写的，被实测否掉）
 *
 * 那样会把 `dragging: null as UIPointerEvent | null` 也算成占位（实测 4 条：
 * `dragging` / `hover` / `translationTimer` / `zoomTimer`）—— 可它们是单例**自己真的持有**的状态字段，
 * 初值 `null` 有语义（`UI.dragging === null` 就是 ui-events 的判断，改成 `undefined` 会**改变行为**）。
 * ⇒ 「值是不是 null」与「实现是不是在别处」是两件事，本轴要回答的是后者。
 *
 * ## 为什么把「声明数」拆出「占位数」
 *
 * 旧读数只有一个 `declared`（全部键数，起始 134）。要退役的从来不是"字面量一条不剩" ——
 * 单例真持有的字段（7 个 DOM 引用 + `dragging`/`hover` + 两个定时器 + `translationKey`）必须留着，
 * 所以 `declared` 到不了 0；而「占位表退役」这件事在旧读数里**看不出来**（134 → 12，既不是 0，
 * 也没人知道剩下那 12 条为什么合法）。把占位数单列之后：
 * **`placeholders == 0` 是 ④-4 该段的验收线**，`declared` 继续回答「字面量里还剩几条」。
 *
 * @param {string} src 字面量所在文件全文
 * @param {Set<string>|Iterable<string>} provided 「实现由别处提供」的名字集合
 * @returns {string[]} 占位键，按字面量声明顺序
 */
export function placeholdersAmong(src, provided) {
	const has = (s) =>
		typeof provided.has === 'function' ? provided.has(s) : [...provided].includes(s);
	return declaredSlotsFrom(src).filter(has);
}

/**
 * `placeholdersAmong()` 的定位版本（与 `declaredSlots()` 同一把锚：`uiWindowRel()`）。
 *
 * ⚠️ **两个来源都必须非空**：装配成员清单读到空（例如 `resolveMemberKeys()` 换了写法就不认），
 * 会让这条判据**恒报 0** —— 那正是「仪器瞎了却表现为指标达标」。故这里做硬断言。
 * @returns {string[]}
 */
export function singletonPlaceholders() {
	const rel = uiWindowRel();
	if (rel === null) {
		throw new Error(
			'singletonPlaceholders()：全仓找不到 `export const UI … = {` 字面量。' +
				'这不是「占位数已归零」，而是**仪器失锚**（同 `declaredSlots()`）。'
		);
	}
	const assembly = assemblyProvidedSlots();
	const engine = engineImplementedSlots();
	if (assembly.size === 0 || engine.size === 0) {
		throw new Error(
			`singletonPlaceholders()：提供者清单读到空（assembly=${assembly.size} engine=${engine.size}）` +
				' ⇒ 本判据会恒报 0，先修仪器再读数字。'
		);
	}
	return placeholdersAmong(readSource(join(ROOT, rel)), new Set([...assembly, ...engine]));
}

/**
 * ④-4 的**前置判据**：今天若删掉字面量，哪些槽位会失去唯一的「家」。
 *
 * 口径 = 「**除字面量本身以外**，还有谁提供它」：
 *   ① `assignedSlots()` —— 域成员对象（经装配点解析）/ 家族文件里的 `this.x =` /
 *      嵌套挂载 `UI.a.b =` / store 桥；
 *   ② `UIEngine.<name> =` —— 引擎实现（④-2c 退役镜像的落地点）。
 *
 * 用途：`declaredSlots() − providedSlots()` 就是 ④-4 动手前**必须先安排住处**的清单。
 *
 * ⚠️ **这不是新的轴锚**。④-4 删掉字面量后 `declaredSlots()` 会抛错（第 186 轮加的守卫），
 * 新锚应当指向**新的契约文件** —— 它同样是一个 `export const … = {` 字面量，
 * `declaredSlotsFrom()` 能直接读。本函数只回答「删之前，有没有漏掉谁」。
 *
 * ⚠️ 第 ② 条把 `UIEngine` 的**全部**赋值都算进来，包括不属 UI 槽位的方法 ⇒ 本函数是
 * 「有家」的**上界**（偏保守：只会少报缺口）。要收紧得先给 `UIEngine` 一份槽位清单，
 * 而那正是 ④-4 要产出的契约。
 * @returns {Set<string>}
 */
export function providedSlots() {
	const provided = new Set(assignedSlots());
	// 引擎实现（含引擎内以 `this` 为接收者写的那些）—— 判据收在 `engineImplementedSlots()` 一处。
	for (const name of engineImplementedSlots()) provided.add(name);
	return provided;
}

/**
 * `declaredSlots()` 里 `providedSlots()` **覆盖不到**的那些 —— ④-4 的待安排清单。
 * @returns {string[]} 按字面量声明顺序
 */
export function declaredWithoutProvider() {
	const provided = providedSlots();
	return declaredSlots().filter((s) => !provided.has(s));
}

/**
 * 「对 UI 单例槽位赋值」的四种写法（正则字面量与 2026-09-17 起的口径**逐字一致**）。
 *
 * 抽成数组是为了让 `assignedSlots()`（全仓）与 `legacyOnlyStoreSlots()`（排除遗留目录）
 * 用同一批口径 —— 后者要回答的是「这个槽位的**实现**是否只在遗留层里」，两份正则一旦分叉，
 * 两条轴会得出互相矛盾的结论。
 *
 * ⚠️ **不要**在这里给赋值正则补 `(?!=)`：`scan.mjs` 的 `UI_SINGLETON_RE`（**计数**轴）需要它，
 * 因为 `UI.dragging === null` 会被数成一次赋值。但本文件这几个是**取名字的集合**，
 * 多认一个名字只会让「从未被赋值」的告警变少（保守方向），而改口径会让 `ui-slot-coverage`
 * 的既有读数无声变化。口径与轴的历史值必须一起改，不能顺手。
 */
const SLOT_ASSIGN_RES = [
	/\bUI\.([A-Za-z_$][\w$]*)\s*=/g,
	/\buiElClasses\.([A-Za-z_$][\w$]*)\s*=/g,
	/\bUI\.([A-Za-z_$][\w$]*)\.[A-Za-z_$][\w$]*\s*=/g,
	/\(\s*UI\.([A-Za-z_$][\w$]*)\s*\)\.[A-Za-z_$][\w$]*\s*=/g
];

/**
 * 「直接给单例挂一个具名槽位」：`UI.<name> = …`。
 *
 * 用它来界定「单例**域模块**」（即 `this.x = …` 该不该算成槽位赋值的那些文件）：
 *
 * - 域模块写的正是 `UI.setSize = …` 这种 ⇒ **匹配**；
 * - 元素类文件（`text-element.ts` 等）只通过 `UI.a.b = …` 写单例的**子对象** ⇒ 不匹配
 *   （实测：若改用「文件里出现过任意 `UI.…=`」当判据，会把 8 个元素类文件的 `this.x = …`
 *   —— 那是它们自己的坐标 —— 也数进来，`assigned` 虚高到 **303**）；
 * - `ui-engine.ts` 写的是 `UIEngine.<name> = …`（`\bUI\.` 要求 `UI` 后紧跟 `.`）⇒ 不匹配
 *   （若改用 `engine/ui/ui-*.ts` 文件名约定，它会被扫进来，`assigned` 变成 **159**）。
 *
 * ⚠️ 为什么非要这个判据、不能只按目录：阶段 1c 第 ③ 步会把域模块**逐个**搬出 `legacy/`。
 * 第 96 轮实测，搬走 `ui-transform.ts` 后 `assigned` 从 153 掉到 144（少算的正是它那 9 处
 * `this.x =`）。少算本身只是读数失真，真正的危险是：当某个 **store 引用到的**槽位只靠
 * `this.x =` 赋值时，`storeRefsUnassigned` 会凭空变非空 —— **一条假回归会把正确的搬运挡住**。
 */
const UI_DIRECT_SLOT_RE = /\bUI\.[A-Za-z_$][\w$]*\s*=/;

/**
 * 从一个 `{`（下标 `open`）取出**顶层键**：`{ a: 1, b() {}, c: (function(){…})(), }` → `['a','b','c']`。
 *
 * 为什么需要它（2026-09-22 第 167 轮，④-3 的第一个域暴露的**仪器盲区**）：
 * `assignedSlots()` 原来只认四种**文本赋值**（`UI.x =` / `uiElClasses.x =` / `UI.x.y =` /
 * `(UI.x).y =`）。而 ④-3 的 facade 装配写成 `Object.assign(UI, uiSlotsMembers)` ——
 * 一种都不匹配 ⇒ `ui-slot-coverage.assigned` 会**假降**（实测 132 → 127），
 * `1c-store-slot-gaps` 会**假升**（0 → 5），也就是「仪器瞎了，却表现为回归」。
 * 这正是本仓反复记的那类失败，所以在这里把口径补上。
 *
 * 用 `codeOnly()` 先吃掉注释与字符串，避免把注释里的 `a: 1` 数成键。
 * 顶层判据用**括号配对**：IIFE 成员（`c: (function(){…})()`）内部的逗号不算分隔。
 */
export function keysOfObjectAt(code, open) {
	const parts = objectPartsAt(code, open);
	return parts.keys;
}

/**
 * 一个 `{`（下标 `open`）处的**顶层内容**：具名键 + `...spread` 引用的名字。
 *
 * 第 168 轮加 spread 这一支：④-3 的通用装配入口是「目录外的 `ui-members.ts` 把各域成员对象
 * 汇总成一个对象」，写法必然是 `{ ...uiSlotsMembers, ...uiInitializeMembers }`。
 * 只数具名键的话，汇总对象会解析成**空**⇒ 仪器第 5 次失明（前四次：正则字面量、模板字面量、
 * 点号路径、注释里的键）。判据要认**名字的来路**，spread 也是一种来路。
 */
export function objectPartsAt(code, open) {
	// 自己先吃一遍 `codeOnly`（长度保持不变 ⇒ 下标仍然有效）：调用方传原文或已处理过的都行。
	code = codeOnly(code);
	let depth = 0;
	let end = -1;
	for (let i = open; i < code.length; i++) {
		const ch = code[i];
		if (ch === '{') depth++;
		else if (ch === '}') {
			depth--;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}
	if (end === -1) return { keys: [], spreads: [] };
	const body = code.slice(open + 1, end);

	const keys = [];
	const spreads = [];
	let d = 0;
	let chunkStart = 0;
	const flush = (chunk) => {
		const text = chunk.trim();
		const spread = /^\.\.\.\s*(?:[A-Za-z_$][\w$]*\s*\.\s*)*([A-Za-z_$][\w$]*)/.exec(text);
		if (spread) {
			spreads.push(spread[1]);
			return;
		}
		// 简写 `{ initialize }`：同样是合法写法（`{ initialize: initialize }` 可能被压成它），
		// 漏掉就是**第 6 类失明** —— 判据要认名字，不能认它写成哪种形态。
		if (/^[A-Za-z_$][\w$]*$/.test(text)) {
			keys.push(text);
			return;
		}
		const m = /^(?:'([^']+)'|"([^"]+)"|([A-Za-z_$][\w$]*))\s*[:(=]/.exec(text);
		if (m) keys.push(m[1] ?? m[2] ?? m[3]);
	};
	for (let i = 0; i < body.length; i++) {
		const ch = body[i];
		if (ch === '{' || ch === '(' || ch === '[') d++;
		else if (ch === '}' || ch === ')' || ch === ']') d--;
		else if (ch === ',' && d === 0) {
			flush(body.slice(chunkStart, i));
			chunkStart = i + 1;
		}
	}
	flush(body.slice(chunkStart));
	return { keys, spreads };
}

/**
 * 把「成员对象名」解析成它们**提供的槽位键** —— 含 `{ ...other }` 的**传递展开**。
 *
 * 传递是必需的：④-3 的汇总入口会写 `{ ...uiSlotsMembers, ...uiInitializeMembers }`，
 * 而各域成员对象又各自声明在别的文件里（跨文件解析）。用 worklist 迭代到收敛，
 * 并用 `seen` 防止自引用/环。
 */
export function resolveMemberKeys(files, names) {
	const keys = new Set();
	let frontier = [...names];
	const seen = new Set();
	while (frontier.length > 0) {
		const batch = frontier.filter((n) => !seen.has(n));
		if (batch.length === 0) break;
		for (const n of batch) seen.add(n);
		frontier = [];
		for (const { full } of files) {
			const src = readSource(full);
			for (const name of batch) {
				const m = new RegExp(`(?:export\\s+)?const\\s+${name}\\b[^=]*=\\s*\\{`).exec(
					codeOnly(src)
				);
				if (!m) continue;
				const parts = objectPartsAt(src, m.index + m[0].length - 1);
				for (const k of parts.keys) keys.add(k);
				frontier.push(...parts.spreads);
			}
		}
	}
	return keys;
}

/**
 * 具名成员对象的顶层键：把 `(?:export )?const NAME … = { … }` 声明找出来再取键。
 * 供「`Object.assign(UI, NAME)` 的 NAME 到底提供了哪些槽位」使用（跨文件解析，见 `assignedSlots`）。
 */
export function objectLiteralKeys(src, name) {
	const code = codeOnly(src);
	const m = new RegExp(`(?:export\\s+)?const\\s+${name}\\b[^=]*=\\s*\\{`).exec(code);
	return m ? keysOfObjectAt(code, m.index + m[0].length - 1) : [];
}

/**
 * `Object.assign(UI, X)` 的站点。`X` 可以是
 *   - 裸标识符 `uiSlotsMembers`
 *   - **点号路径** `m.uiSlotsMembers`（动态 import 后最自然的写法）
 *   - 内联字面量 `{ … }`（返回 `open`，由调用方取键）
 *
 * ⚠️ 点号路径这一段是**实测补的**（第 167 轮收尾）：装配行从
 * `.then(({ uiSlotsMembers }) => Object.assign(UI, uiSlotsMembers))` 改成
 * `.then((m) => Object.assign(UI, m.uiSlotsMembers))`（为了不撑破 format 的 printWidth、
 * 以免给 `legacy-ui-lines` 多算行）之后，原来的「只认裸标识符」当场失明 —— 三条轴又假报回归。
 * ⇒ 判据要认**名字的来路**，不能认它写成了几种形式里的哪一种。
 */
export function facadeAssemblySites(src) {
	const code = codeOnly(src);
	const out = [];
	for (const m of code.matchAll(/\bObject\.assign\(\s*UI\s*,/g)) {
		// `Object.assign(` 的配对 `)` 之内就是实参表；按**顶层逗号**切成一个个源。
		const openParen = code.lastIndexOf('(', m.index + m[0].length - 1);
		let depth = 0;
		let end = -1;
		for (let i = openParen; i < code.length; i++) {
			if (code[i] === '(') depth++;
			else if (code[i] === ')') {
				depth--;
				if (depth === 0) {
					end = i;
					break;
				}
			}
		}
		if (end === -1) continue;
		const argsStart = m.index + m[0].length;
		const argText = code.slice(argsStart, end);
		let d = 0;
		let start = 0;
		const pieces = [];
		for (let i = 0; i < argText.length; i++) {
			const ch = argText[i];
			if (ch === '{' || ch === '(' || ch === '[') d++;
			else if (ch === '}' || ch === ')' || ch === ']') d--;
			else if (ch === ',' && d === 0) {
				pieces.push([start, i]);
				start = i + 1;
			}
		}
		pieces.push([start, argText.length]);
		for (const [a, b] of pieces) {
			const text = argText.slice(a, b);
			const at = argsStart + a;
			if (/^\s*\{/.test(text)) out.push({ open: at + text.indexOf('{') });
			else {
				const id = /^\s*(?:[A-Za-z_$][\w$]*\s*\.\s*)*([A-Za-z_$][\w$]*)/.exec(text);
				if (id) out.push({ name: id[1] });
			}
		}
	}
	return out;
}

/** 装配入口所在文件（相对 ROOT）—— ④-3 的域模块清单由它 import 进来 */
const UI_MEMBERS_REL = 'packages/editor/src/engine/ui/ui-members.ts';

/**
 * ④-3 的**域模块清单**：装配入口 `ui-members.ts` 静态 import 进来的那些模块。
 *
 * 它们就是「只提供成员对象」的域模块 —— 改法之后不再写 `UI.x =`，所以必须**换一条判据**
 * 才能把它们认成家族成员（否则它们体内的 `this.x =` 会被漏算，见 `inFamily` 处的实测说明）。
 * @returns {Set<string>} 相对 ROOT、`/` 分隔的路径
 */
function domainModuleRels() {
	const out = new Set();
	const abs = join(ROOT, UI_MEMBERS_REL);
	if (!existsSync(abs)) return out;
	// ⚠️ 这里**不能**用 `codeOnly`：它连字符串字面量一起吃掉，而模块路径正是字符串
	// ⇒ 一条都匹配不到（本轮实测：错用之后 `assigned` 仍是 119）。只去注释，保留字符串。
	for (const m of stripComments(readSource(abs)).matchAll(/from\s+'(\.[^']+)'/g)) {
		out.add(join(dirname(UI_MEMBERS_REL), m[1]).replace(/\\/g, '/'));
	}
	return out;
}

/** facade 装配引用的**具名成员对象**（全仓 `Object.assign(UI, NAME)` 里的 NAME） */
function facadeMemberNames(files) {
	const names = new Set();
	for (const { full } of files) {
		for (const site of facadeAssemblySites(readSource(full))) {
			if (site.name) names.add(site.name);
		}
	}
	return names;
}

/**
 * **装配入口注入的成员名**：`ui-members.ts` 汇总的域成员对象（可能多源、用 `{ ...a, ...b }` 传递展开，
 * 故用 `resolveMemberKeys()` 解析）∪ 装配点上内联对象字面量的键。
 *
 * 抽出来是为了让「占位槽位」有**唯一**的判据来源（`singletonPlaceholders()`），
 * 而不是在别处再写一遍装配语法解析 —— 那台仪器已经因为写法变化失明过五次（见 `ui-members.ts` 文件头）。
 * @param {Array<{full: string, rel: string}>} [files]
 * @returns {Set<string>}
 */
export function assemblyProvidedSlots(files) {
	const all = files ?? collectFiles({ dirs: SCAN_DIRS });
	const ids = new Set();
	const inlineKeys = [];
	for (const { full } of all) {
		const src = readSource(full);
		for (const site of facadeAssemblySites(src)) {
			if (site.name) ids.add(site.name);
			else inlineKeys.push(...keysOfObjectAt(src, site.open));
		}
	}
	const out = resolveMemberKeys(all, ids);
	for (const k of inlineKeys) out.add(k);
	return out;
}

/**
 * **实现就在引擎里**的槽位：`UIEngine.<name> = …`，以及引擎内**以 `this` 为接收者**写的那些。
 *
 * ⚠️ 后半条不能省：实测 `controlPointActive` 写在 `ui-engine.ts:258-259` 的
 * `this.controlPointActive = point` —— 只认 `^UIEngine\.` 会把它漏掉，
 * 于是「缺口」会报出一个**并不存在**的待办（第 187 轮实测：虚假缺口 1 个）。
 * @returns {Set<string>}
 */
export function engineImplementedSlots() {
	const engineSrc = codeOnly(
		readSource(join(ROOT, 'packages/editor/src/engine/ui/ui-engine.ts'))
	);
	const out = new Set();
	for (const m of engineSrc.matchAll(/^UIEngine\.([A-Za-z_$][\w$]*)\s*=/gm)) out.add(m[1]);
	for (const m of engineSrc.matchAll(/^\s*this\.([A-Za-z_$][\w$]*)\s*=/gm)) out.add(m[1]);
	return out;
}

/** 赋值：全仓库对 UI 单例槽位的写入 */
export function assignedSlots(files) {
	const all = files ?? collectFiles({ dirs: SCAN_DIRS });
	const assigned = new Set();
	const dirRe = uiDirRe();
	const inEngineUiRe = /(^|\/)engine\/ui\//;
	// 家族判据 = 单例所在目录 ∪（`engine/ui/` 下、且**自己直接挂槽位**的域模块）。
	// 见 `UI_DOMAIN_MODULE_RE` / `UI_DIRECT_SLOT_RE` 的说明：不能用纯目录判据（域模块会被
	// 1c ③ 逐个搬出去，一搬就少算 `this.x =`），也不能只看「文件里出现过 `UI.…=`」。
	//
	// ⚠️ **④-3 起还要认「装配入口 import 进来的模块」**（2026-09-22 第 170 轮实测）：
	// 域模块改法后**不再写 `UI.x =`**（改为导出成员对象、由 `ui-members.ts` 汇总装配），
	// 于是「文件里出现过 `UI.x =`」这条判据当场把它们踢出家族 ⇒ `ui-initialize.ts` 里
	// 13 处 `this.x =` 不再被算成槽位赋值（`assigned` 132 → 119）。**第 7 类失明。**
	// ⇒ 判据补上「装配入口的 import 清单」：那些模块就是域模块，它们的 `this.x =` 依旧算。
	const domainRels = domainModuleRels();
	const inFamily = (rel, src) =>
		dirRe.test(rel) ||
		(inEngineUiRe.test(rel) && (UI_DIRECT_SLOT_RE.test(src) || domainRels.has(rel)));

	// 第一遍：facade 装配点（`Object.assign(UI, …)`，**可多源**）。源既可能是具名成员对象
	// （跨文件、且可能再 `{ ...other }` 汇总 ⇒ 用 `resolveMemberKeys` 传递解析），
	// 也可能是内联字面量（直接取键）。两者的解析收在 `assemblyProvidedSlots()` 一处。
	const facadeKeys = assemblyProvidedSlots(all);

	for (const { full, rel } of all) {
		const src = readSource(full);
		for (const re of SLOT_ASSIGN_RES) {
			for (const m of src.matchAll(re)) assigned.add(m[1]);
		}
		if (inFamily(rel, src)) {
			for (const m of src.matchAll(/\bthis\.([A-Za-z_$][\w$]*)\s*=/g)) assigned.add(m[1]);
		}
	}
	for (const k of facadeKeys) assigned.add(k);
	return assigned;
}

/**
 * store 动作层引用的槽位。
 *
 * 检测两种写法：
 *   - `UI?.slot?.(…)`——旧的手写包装
 *   - `makeForwarder('slot', …)`——搬迁中的批量转发（`stores/ui.ts`）
 * 后者是**重构中间态**：转发器仍然以 `UI` 为接收者（因为那些实现内部读 `this.planToSave`
 * 等 UI 侧成员），但走的是同一套延迟求值机制。
 */
export function storeReferencedSlots() {
	const src = readSource(join(ROOT, 'packages/editor/src/stores/ui.ts'));
	const out = new Set();
	for (const m of src.matchAll(/\bUI\?\.([A-Za-z_$][\w$]*)\?\./g)) out.add(m[1]);
	for (const m of src.matchAll(/makeForwarder\(\s*'([A-Za-z_$][\w$]*)'/g)) out.add(m[1]);
	return out;
}

/**
 * `ui-slot-coverage` 的**候选集**：store 引用了、却没有任何模块给它赋值的槽位。
 *
 * ## 为什么把这条判据单独抽出来（2026-09-22 第 114 轮）
 *
 * 它原来是 `uiSlotCoverage()` 里的一行 `.filter()`。抽出来是为了让 `self-test.mjs`
 * 能用**样本**直接自证 —— 否则这条判据只在「镜像已经删掉」之后才咬人，
 * 在那之前它是**不可自证**的（真实仓库里那 7 个正因为有镜像赋值，读数才是 0）。
 *
 * ## `engineBacked` 为什么必须排除
 *
 * 阶段 1c 第 ④-2a 步之后，store 的 7 个引擎转发（`makeEngineForwarder`）**不再从 UI 槽位取函数**，
 * 而是从引擎在模块加载末尾**注册进来的** `UIEngine` 取（`ui-engine.ts` 末尾 `registerUIEngine`）。
 * 那 7 个槽位因此**不再是 UI 槽位依赖**。
 *
 * 但 `assignedSlots()` 把遗留目录里的 `UI.x = …`（即 `ui-window.ts` 的镜像）**也算赋值**
 * ⇒ ④-2c 删掉那 21 行镜像时，这 7 个名字会立刻变成「引用了但没人赋值」：
 * **实测 `storeRefsUnassigned` 会 0 → 7，一次正确的删除被棘轮挡下。**
 * 另一条轴 `legacyOnlyStoreSlots()` 早就把 `engineBacked` 排除在外，只有本轴没跟上。
 *
 * ⚠️ 这正是「**改接线的时候要问一句：哪条轴的判据建立在旧接线上**」的实例
 * （`xr.md` 第 113 轮）。口径与轴的历史值必须一起改：本次改口径**没有**改变终态读数（都是 0）。
 *
 * @param {Set<string>|Iterable<string>} refs store 引用到的槽位
 * @param {Set<string>|Iterable<string>} assigned 全仓有任何赋值来源的槽位
 * @param {Iterable<string>} engineBacked 实现就在 `ui-engine.ts` 里的槽位
 * @returns {string[]} 排序后的未赋值槽位
 */
export function unassignedStoreSlots(refs, assigned, engineBacked) {
	const has = (coll, s) => (typeof coll.has === 'function' ? coll.has(s) : [...coll].includes(s));
	const backed = new Set(engineBacked);
	return [...refs]
		.filter((s) => !has(assigned, s) && !backed.has(s))
		.sort((a, b) => a.localeCompare(b));
}

/**
 * 覆盖度报告。
 *
 * ## 指标语义（重要，改过两次）
 *
 * - **`storeRefsUnassigned` —— 本轴唯一有行动价值的数字。**
 *   「store 引用了、但全仓库没有任何模块赋值」的槽位。非 0 就意味着有动作会静默读到
 *   `undefined`（`UI?.x?.()` 不报错）。终态 0。
 *   ⚠️ **2026-09-22 第 114 轮**：候选集改由 `unassignedStoreSlots()` 计算，并把
 *   `engineBacked` 排除掉 —— 理由见该函数的文档（④-2a 之后 store 已不再从 UI 槽位取那 7 个函数），
 *   **本次改口径不改变终态读数（改前改后都是 0）**。
 *
 * - `storeRefs` —— store 动作层引用到的槽位总数。**删掉 `src/ui/` 时，这一批会全部失效**
 *   （惰加载 `ui-window` 挂了 → `UI` 永远是 undefined），所以它才是「1c 还需处理多少」的口径。
 *
 * - `engineBacked` —— 其中「实现就在 `ui-engine.ts` 里」的个数（`UIEngine.x = …`）。
 *   这些搬运成本最低（`UIEngine.x.apply(UI, args)` 即可）。**它上升是好事。**
 *
 * ⚠️ 早先这里还有个 `legacyOnly`（= `storeRefs` − `engineBacked`），并把它当成棘轮指标。
 * 那是错的：它把「我为了搬迁把转发器抽成工厂函数」这种纯重构也算成「依赖变重」
 * （实测 41 → 42，纯属词法引用变多）。**度量必须只对真实状态敏感，不对写法敏感。**
 * 现在改为只报 `engineBacked`（越大越好），`legacyOnly` 不再出现。
 *
 * ## 已知局限
 *
 * `storeReferencedSlots()` 靠正则读 `stores/ui.ts` 的写法。若将来转发改成别的形式，
 * **这条轴会静默漏掉那些槽位**（数字变小、看起来像进步）。修改 store 的转发写法时，
 * 必须同步更新该函数——`storeRefs` 明显下降就是信号。
 *
 * @returns {{
 *   declared: number, assigned: number,
 *   storeRefs: number, storeRefsUnassigned: string[], engineBacked: string[]
 * }}
 */
export function uiSlotCoverage() {
	const files = collectFiles({ dirs: SCAN_DIRS });
	const declared = declaredSlots();
	const assigned = assignedSlots(files);
	const refs = storeReferencedSlots();
	const engineSrc = readSource(join(ROOT, 'packages/editor/src/engine/ui/ui-engine.ts'));

	const engineBacked = [];
	for (const s of refs) {
		// 「UIEngine 自身实现」= 该槽位的**赋值**也在 ui-engine.ts 里（`UIEngine.x = …`）
		if (new RegExp(`^UIEngine\\.${s}\\s*=`, 'm').test(engineSrc)) engineBacked.push(s);
	}
	const storeRefsUnassigned = unassignedStoreSlots(refs, assigned, engineBacked);

	return {
		declared: declared.length,
		assigned: assigned.size,
		storeRefs: refs.size,
		storeRefsUnassigned,
		engineBacked: engineBacked.sort((a, b) => a.localeCompare(b))
	};
}

/**
 * **1c 第 ③ 步的工作单口径**：store 引用了、但「实现」只存在于遗留目录里的槽位。
 *
 * ## 它补的是哪个缺口（2026-09-21 实测）
 *
 * `uiSlotCoverage().storeRefsUnassigned` 恒为 0 —— 因为 `assignedSlots()` 把**遗留目录里**的
 * `UI.x = …` / `this.x = …` 也算成「已赋值」。于是「删掉遗留层会让多少动作静默失效」这件事
 * 在台账上**完全不可见**：`ui-singleton-members` 只说「还有 103 处挂载」，
 * 而 PHASE-1C 附录三手工数出来的是「store 尚缺 ~41 个槽位」——那个数字没有任何轴守着。
 *
 * 本函数把它变成可测量的：对每个 store 引用的槽位，只要满足下面**全部**条件就计入
 *   - 它的赋值不在 `ui-engine.ts` 里（不是 `engineBacked`——那批只需换接线，零新逻辑）；
 *   - 它的赋值**不在遗留目录里**的任何一个文件里（即：外部/新家已有实现）。
 *
 * ## 为什么"排除遗留目录"而不是"只数遗留目录"
 *
 * 遗留目录里的 `UI.x = function () {}` 是**实现**，不是"已迁移"。真正的进度是
 * 「有多少槽位的实现已经搬出遗留目录」。所以计数方向必须反过来：
 * 数**没有**外部实现的那些。搬走一个，这个数字就降 1 —— 纯移动不会让它下降，
 * 但**把实现搬出遗留目录一定会**，这正是第 ③ 步的定义。
 *
 * ## 与另两条轴的关系（三者必须一起看）
 *
 * | 轴 | 回答的问题 |
 * |---|---|
 * | `ui-singleton-members` | 遗留层还剩多少 `UI.x = ` 挂载点（含镜像） |
 * | `ui-slot-coverage.storeRefsUnassigned` | 有没有槽位**全仓都没人赋值**（会静默读到 undefined） |
 * | **本函数** | 有多少槽位的实现**只在遗留层**（搬走它们才是 ③ 的进度） |
 *
 * @returns {string[]} 按名字排序的槽位名
 */
export function legacyOnlyStoreSlots() {
	const files = collectFiles({ dirs: SCAN_DIRS });
	const uiDir = uiDirRe();
	const refs = storeReferencedSlots();
	const engineSrc = readSource(join(ROOT, 'packages/editor/src/engine/ui/ui-engine.ts'));
	const facadeNames = facadeMemberNames(files);
	// ④-3：**实现在域模块里**（目录外），装配点在遗留层。只从「目录外」的文件解析成员对象 ⇒
	// 这些槽位和 `UI.x = …` 一样算「有新家」，否则本轴会把「实现已搬走、只是装配点还在原处」
	// 误报成 ③ 没做完（第 167 轮实测 0 → 5）。跨文件 + 传递展开见 `resolveMemberKeys`。
	const facadeKeys = resolveMemberKeys(
		files.filter(({ rel }) => !uiDir.test(rel)),
		facadeNames
	);

	/** 遗留目录**之外**的赋值点 —— 每个槽位只要出现在这里，就说明它有「新家」。 */
	const outsideLegacy = new Set();
	for (const { full, rel } of files) {
		if (uiDir.test(rel)) continue;
		const src = readSource(full);
		for (const re of SLOT_ASSIGN_RES) {
			for (const m of src.matchAll(re)) outsideLegacy.add(m[1]);
		}
	}
	for (const k of facadeKeys) outsideLegacy.add(k);

	const legacyOnly = [];
	for (const slot of refs) {
		if (new RegExp(`^UIEngine\\.${slot}\\s*=`, 'm').test(engineSrc)) continue;
		if (outsideLegacy.has(slot)) continue;
		legacyOnly.push(slot);
	}
	return legacyOnly.sort((a, b) => a.localeCompare(b));
}

/**
 * 阶段 1c 第 ④ 步的工作单：**引擎读的 UI 成员里，尚无「显式归属」的那些**。
 *
 * ## 为什么需要这条口径
 *
 * `ui-engine.ts` 以 `this` 为接收者读一批 UI 成员（这正是 `ui-window.ts` 里
 * `UI.x = UIEngine.x` 那 21 行镜像的用途 —— 把 UI 侧状态喂给引擎）。这些成员今天能编译，
 * **不是因为有类型契约**，而是因为对象字面量末尾写着
 * `} satisfies Partial<UIShape> as Partial<UIShape> as UIShape;`，而 `UIShape` 带
 * `[k: string]: any` 索引签名 —— **任何成员读写都通过编译，包括拼错的**。
 *
 * 所以 ④ 的目标可以量成一个数：把「引擎读到的成员」逐个**显式归属**（进 store 的
 * `uiStateKeys`，或进 facade 契约 `engine/ui/ui-facade.ts`），最后让那个 `any` 索引签名退役。
 *
 * ## 口径
 *
 * - 读点：`ui-engine.ts` 的 `this.<name>`（代码区，去注释）。
 * - 「有家」= 在 `stores/ui.ts` 的 `uiStateKeys` 里，**或**在 `ui-facade.ts` 里声明了同名字段，
 *   **或**它本来就由引擎自己定义（`ui-engine.ts` 里有 `UIEngine.<name> = …`）——
 *   最后这条与 `legacyOnlyStoreSlots` 豁免「engineBacked」槽位是同一个道理：
 *   那些成员的家就是引擎，不是缺口。（`renderingFunction` / `requestRendering` /
 *   `updateControlPoints` 属于这一类。）
 * - 返回的 `missing` 就是缺口清单；`engineReads` 是分母（供自证用例断言扫描面没瞎）。
 *
 * @returns {{ engineReads: number, missing: string[] }}
 */
export function uiFacadeGaps() {
	const engineSrc = codeOnly(
		readSource(join(ROOT, 'packages', 'editor', 'src', 'engine', 'ui', 'ui-engine.ts'))
	);
	const reads = new Set([...engineSrc.matchAll(/\bthis\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]));

	const storeSrc = readSource(join(ROOT, 'packages', 'editor', 'src', 'stores', 'ui.ts'));
	const keysBlock = storeSrc.match(/export const uiStateKeys = \[([\s\S]*?)\]\s*as const;/);
	const keys = new Set(
		keysBlock ? [...keysBlock[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : []
	);

	// facade 契约还不存在时（④-1 之前）全部算缺口 —— 这正是「0 → N」该有的读数。
	const facadeRel = join(ROOT, 'packages', 'editor', 'src', 'engine', 'ui', 'ui-facade.ts');
	const facadeSrc = existsSync(facadeRel) ? codeOnly(readSource(facadeRel)) : '';

	const hasHome = (name) =>
		keys.has(name) ||
		new RegExp(`\\b${name}\\??\\s*:`).test(facadeSrc) ||
		new RegExp(`^UIEngine\\.${name}\\s*=`, 'm').test(engineSrc);

	return {
		engineReads: reads.size,
		missing: [...reads].filter((name) => !hasHome(name)).sort((a, b) => a.localeCompare(b))
	};
}

// ---------------------------------------------------------------------------
// ④-3 的伴随判据：域模块是否还**依赖**遗留单例本身
// ---------------------------------------------------------------------------

/** 具名 import 子句里的名字（`{ UI }` / `{ type T, UI }` → `['T','UI']`） */
export function importedNames(text) {
	const m = text.match(/\{([\s\S]*?)\}/);
	if (!m) return [];
	return m[1]
		.split(',')
		.map((s) => s.trim().replace(/^type\s+/, ''))
		.filter((s) => s !== '');
}

/**
 * 一条 import 是否就是「域模块静态 `import { UI }` 去改单例」的那条。
 *
 * **纯函数**（只吃 `collectImports()` 的输出），所以自证不需要碰仓库 —— 见 `self-test.mjs`：
 * 那里用「`Object.assign(UI, …)` 写法」的样本同时断言本判据命中、而 `ui-singleton-members` 读 0。
 */
export function isLegacySingletonUiImport(imp) {
	return (
		!imp.typeOnly &&
		/legacy\/ui-window(?:\.ts)?$/.test(imp.specifier) &&
		importedNames(imp.text).includes('UI')
	);
}

/**
 * 还有哪些**域模块**在静态 `import { UI }` 去改遗留单例（④-3 的伴随判据，2026-09-22 第 166 轮加）。
 *
 * ## 为什么必须有它
 *
 * `ui-singleton-members` 数的是 `UI.<name> =` **文本**。实测三种等价写法
 * —— `Object.assign(UI, { x() {} })` · `for (…) UI[k] = v` · `Object.defineProperty(UI, 'x', …)`
 * —— 在那条轴上**命中都是 0**。于是把 82 行挂载改写成「成员对象 + 一次 `Object.assign`」，
 * 那条轴就归零，而**所有权一点没变**（还是同一个遗留对象在装配、域模块还是 import 单例去改它）。
 * 这正好违反台账自己那条规矩：「**度量只应对真实状态敏感，不该对写法敏感**」。
 *
 * ## 它数什么
 *
 * 只看「域模块是否还**依赖单例本身**」：真正的 facade 装配里，域模块只**提供**成员对象，
 * 不该 `import { UI }`。所以起点 **8**（实测 8/8 个域模块都还 import）、终态 **0**，
 * 且**改写法拿不到它** —— 与 `ui-singleton-members` **同生共死**，两条同时归零才算 ④-3 收口。
 *
 * 计的是**文件数**（一个域模块算一处）：域模块整齐地只剩 1 条 import。
 * `legacy/` 目录本身不算「域模块」（那是单例本体的家）。
 *
 * @returns {{ total: number, perFile: { rel: string, count: number }[] }}
 */
export function domainSingletonImporters() {
	const dir = join('packages', 'editor', 'src', 'engine', 'ui');
	const hits = [];
	for (const { full, rel } of collectFiles({ dirs: [dir] })) {
		if (rel.includes('/legacy/')) continue;
		const n = collectImports(readSource(full)).filter(isLegacySingletonUiImport).length;
		if (n > 0) hits.push({ rel, count: n });
	}
	hits.sort((a, b) => a.rel.localeCompare(b.rel));
	return { total: hits.length, perFile: hits };
}
