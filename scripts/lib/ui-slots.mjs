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
import { ROOT, SCAN_DIRS, collectFiles, readSource, codeOnly } from './scan.mjs';

/** 阶段 1c 之前的路径；优先用它（快且稳），找不到再动态搜索 */
const LEGACY_WINDOW_REL = 'packages/editor/src/ui/ui-window.ts';

/**
 * UI 单例对象字面量所在文件 —— **动态定位，不能写死路径**。
 *
 * ⚠️ 为什么必须动态（2026-09-20，本文件记的第二次同类事故）：
 * 阶段 1c 的第 ② 步会把 `src/ui/` 下的 8 个域模块**原样搬到** `engine/ui/`。
 * 写死路径的话，搬运当轮 `declaredSlots()` 就会**静默返回空数组**：`declared` 从 134
 * 掉到 0，`ui-slot-coverage` 报「改善」——而遗留代码一行没少。这正是本文件头部
 * 已经为「技法 5 改写声明行」记过一次的那种失败：**仪器瞎了，却表现为指标变好。**
 *
 * 定位方式：先试旧路径；否则在扫描面里找含 `export const UI … = {` 声明的那个文件。
 * 声明行怎么写都不影响（类型标注可选），与 `declaredSlots()` 的定位逻辑同源。
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
 * 「UI 单例家族」所在的目录 —— 用来界定「`this.x = …` 只在单例家族内部才算槽位赋值」。
 *
 * 同样**不能写死** `^packages/editor/src/ui/`：1c 搬运之后，域模块里的
 * `this.controlPointTexture = …` 会不再被计入 `assigned`，于是 `storeRefsUnassigned`
 * **凭空变非空**、`ui-slot-coverage` 报上升 —— 搬运会被一条假回归挡住。
 * 按「UI 窗口所在目录」界定则搬运前后一致。
 *
 * 取舍：同目录里若混进非家族文件，它们的 `this.x = ` 也会被算进来 ⇒ `assigned` 偏大 ⇒
 * 告警**偏少**（保守方向，与文件头部对 `uiElClasses` 的取舍一致）。
 *
 * **导出**：`self-test.mjs` / `audit-ui-slots.mjs` 都用它，别在各自文件里再抄一份写死的
 * `^packages/editor/src/ui/` —— 2026-09-20 的 P5-B 纯移动把 `src/ui/` 搬成
 * `src/engine/ui/legacy/` 时，抄了副本的地方**当场全瞎**（见 PHASE-1C 第 66 轮）。
 */
export function uiDirRe() {
	const rel = uiWindowRel();
	// 「永不匹配」用 `(?!)`（一个恒假的零宽断言），而不是往正则里塞控制字符当哨兵：
	// 后者会被 `eslint/no-control-regex` 判为坏味道，语义上也并不需要。
	if (rel === null) return /(?!)x/;
	return new RegExp(`^${dirname(rel).replace(/\\/g, '/')}/`);
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
	if (rel === null) return [];
	const src = readSource(join(ROOT, rel));
	const code = codeOnly(src);
	const m = /export const UI\s*(?::[^=]*)?=\s*\{/.exec(code);
	if (!m) return [];
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
	return [];
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

/** 赋值：全仓库对 UI 单例槽位的写入 */
export function assignedSlots(files) {
	const all = files ?? collectFiles({ dirs: SCAN_DIRS });
	const assigned = new Set();
	const dirRe = uiDirRe();
	const inEngineUiRe = /(^|\/)engine\/ui\//;
	// 家族判据 = 单例所在目录 ∪（`engine/ui/` 下、且**自己直接挂槽位**的域模块）。
	// 见 `UI_DOMAIN_MODULE_RE` / `UI_DIRECT_SLOT_RE` 的说明：不能用纯目录判据（域模块会被
	// 1c ③ 逐个搬出去，一搬就少算 `this.x =`），也不能只看「文件里出现过 `UI.…=`」。
	const inFamily = (rel, src) =>
		dirRe.test(rel) || (inEngineUiRe.test(rel) && UI_DIRECT_SLOT_RE.test(src));
	for (const { full, rel } of all) {
		const src = readSource(full);
		for (const re of SLOT_ASSIGN_RES) {
			for (const m of src.matchAll(re)) assigned.add(m[1]);
		}
		if (inFamily(rel, src)) {
			for (const m of src.matchAll(/\bthis\.([A-Za-z_$][\w$]*)\s*=/g)) assigned.add(m[1]);
		}
	}
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

	/** 遗留目录**之外**的赋值点 —— 每个槽位只要出现在这里，就说明它有「新家」。 */
	const outsideLegacy = new Set();
	for (const { full, rel } of files) {
		if (uiDir.test(rel)) continue;
		const src = readSource(full);
		for (const re of SLOT_ASSIGN_RES) {
			for (const m of src.matchAll(re)) outsideLegacy.add(m[1]);
		}
	}

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
