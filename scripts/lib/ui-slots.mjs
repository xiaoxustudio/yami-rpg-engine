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
	if (rel === null) return /^\u0000never$/;
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

/** 赋值：全仓库对 UI 单例槽位的写入 */
export function assignedSlots(files) {
	const all = files ?? collectFiles({ dirs: SCAN_DIRS });
	const assigned = new Set();
	const uiDir = uiDirRe();
	for (const { full, rel } of all) {
		const src = readSource(full);
		for (const m of src.matchAll(/\bUI\.([A-Za-z_$][\w$]*)\s*=/g)) assigned.add(m[1]);
		for (const m of src.matchAll(/\buiElClasses\.([A-Za-z_$][\w$]*)\s*=/g)) assigned.add(m[1]);
		if (uiDir.test(rel)) {
			for (const m of src.matchAll(/\bthis\.([A-Za-z_$][\w$]*)\s*=/g)) assigned.add(m[1]);
		}
		for (const m of src.matchAll(/\bUI\.([A-Za-z_$][\w$]*)\.[A-Za-z_$][\w$]*\s*=/g))
			assigned.add(m[1]);
		for (const m of src.matchAll(/\(\s*UI\.([A-Za-z_$][\w$]*)\s*\)\.[A-Za-z_$][\w$]*\s*=/g))
			assigned.add(m[1]);
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
 * 覆盖度报告。
 *
 * ## 指标语义（重要，改过一次）
 *
 * - **`storeRefsUnassigned` —— 本轴唯一有行动价值的数字。**
 *   「store 引用了、但全仓库没有任何模块赋值」的槽位。非 0 就意味着有动作会静默读到
 *   `undefined`（`UI?.x?.()` 不报错）。终态 0。
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

	const storeRefsUnassigned = [...refs]
		.filter((s) => !assigned.has(s))
		.sort((a, b) => a.localeCompare(b));
	const engineBacked = [];
	for (const s of refs) {
		// 「UIEngine 自身实现」= 该槽位的**赋值**也在 ui-engine.ts 里（`UIEngine.x = …`）
		if (new RegExp(`^UIEngine\\.${s}\\s*=`, 'm').test(engineSrc)) engineBacked.push(s);
	}

	return {
		declared: declared.length,
		assigned: assigned.size,
		storeRefs: refs.size,
		storeRefsUnassigned,
		engineBacked: engineBacked.sort((a, b) => a.localeCompare(b))
	};
}
