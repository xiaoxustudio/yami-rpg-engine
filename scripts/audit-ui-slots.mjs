/**
 * 审计：UI 单例的每个槽位「声明 / 赋值 / 消费」三态核对。
 *
 * ## 目的
 *
 * 单例对象字面量（`UI.x: null` 先占位、由别的模块在运行时赋值）最容易出的问题是
 * **某个槽位从未被任何模块赋值，却有消费方在读它** —— 读到的永远是 null，
 * 而 `UIShape` 的 `[k: string]: any` 也不会报错。这类缺陷在运行时表现为「某个功能静默不工作」，
 * 类型检查与 lint 都抓不到。阶段 1b 把 store 侧的消费面接了过来，本审计的结论直接决定：
 * 删除遗留层时哪些槽位必须找到「新家」、哪些可以随遗留层一起消失。
 *
 * ## 已知局限（写清楚，免得被当成权威结论）
 *
 * - **`uiElClasses.x =` 这一条会匹配到 `WebGLClass.foo =` 这类无关赋值**（因为
 *   `/i` 让 `uiElClasses` 也匹配别的词尾）。所以「有赋值」这一列偏宽松 —— 它只会让
 *   「从未被赋值」的告警**变少**（偏保守），不会凭空制造告警。
 * - 「有赋值但无消费」这一列噪音很大（98 项）：很多槽位是**由外部 UI 注册机制读取**的
 *   （挂到 `UI` 上只是为了让别的模块能按名字取到），静态文本扫描看不到那种读取。
 *   因此这一列只作参考，**不要**据此判定「赋值方白做」。
 * - 真正有行动价值的只有前两列。
 */
import { SCAN_DIRS, collectFiles, readSource } from './lib/scan.mjs';
import { declaredSlots, uiDirRe } from './lib/ui-slots.mjs';

const files = collectFiles({ dirs: SCAN_DIRS });

// 1) ui-window.ts 里声明为 null 的槽位
//
// 复用 lib 里的实现，不再本地复制一份：这里的副本曾经写死 `'export const UI: UIShape = {'`
// 与 `'\n};'`，技法 5 改写声明形态后它会**静默读到 0 个槽位**，于是后面的
// 「三态核对」全表变成空表 —— 一个看起来「干净」的假结论。仪器只维护一份。
//
// ⚠️ 同一个教训 2026-09-20 又应验一次（P5-B 纯移动把 `src/ui/` 搬到 `src/engine/ui/legacy/`）：
// 这里原本还留着一行写死的 `const windowRel = 'packages/editor/src/ui/ui-window.ts'`，
// 搬完之后那个文件不存在了 —— 而它**根本没被用到**（下面只用 `declaredSlots()`），
// 于是纯粹变成一句 `readFileSync` 的 ENOENT 地雷。写死路径的副本一律删掉，改用
// `uiWindowRel()` / `uiDirRe()`。
const declared = declaredSlots();

// 2) 全仓库对各槽位的赋值。
//
// ⚠️ 检测面必须**恰好**覆盖「谁真的在给 UI 单例写值」，宽一点窄一点都会得出错误结论：
//   - 只认 `UI.x =`（第一版）⇒ 把 `UI.Button` 等 10 个元素类假报成「永远读到 null」，
//     它们其实由 `uiElClasses.Button = class …` 赋值（阶段 1b 后的新落点），再由
//     `ui-window.ts` 镜像回 `UI`。
//   - 把 `this.x =` 全仓库收进来（第二版）⇒ 把**每个类的每个字段**都算成 UI 槽位，
//     「有赋值无消费」从 71 涨到 715，全是噪音。
//
// 真相是：`this` 只有在 **UI 单例家族自己的方法里**才等于 UI 单例（那些方法都以
// `this: UIShape` 声明、由 `UI.open()` / `u.initialize()` 这类以 UI 为接收者的调用触发）。
// 所以 `this.x =` 只在家族目录内统计 —— 目录由 `uiDirRe()` 动态解析（不写死）。
const assigned = new Set();
const UI_DIR = uiDirRe();
for (const { full, rel } of files) {
	const src = readSource(full);
	// ① `UI.x = …`（任何模块）
	for (const m of src.matchAll(/\bUI\.([A-Za-z_$][\w$]*)\s*=/g)) assigned.add(m[1]);
	// ③ `uiElClasses.x = …`（阶段 1b 起的元素类落点）
	for (const m of src.matchAll(/\buiElClasses\.([A-Za-z_$][\w$]*)\s*=/g)) assigned.add(m[1]);
	// ② `this.x = …` —— **仅** src/ui/ 内部（`this` 即 UI 单例）
	if (UI_DIR.test(rel)) {
		for (const m of src.matchAll(/\bthis\.([A-Za-z_$][\w$]*)\s*=/g)) assigned.add(m[1]);
	}
	// ⑤ store 侧的写入：store 是阶段 1b 之后这些槽位的**新家**，与 UI 槽位同名（如 scrollLeft/hover）\n	for (const m of src.matchAll(/getUIStore\(\)\.([A-Za-z_$][\w$]*)\s*=/g)) assigned.add(m[1]);\n	// ④ 对槽位**对象**的成员赋值：`UI.list.paste = …`、`elementDataOf<…>(UI.list).head = …`
	for (const m of src.matchAll(/\bUI\.([A-Za-z_$][\w$]*)\.[A-Za-z_$][\w$]*\s*=/g))
		assigned.add(m[1]);
	for (const m of src.matchAll(/\(\s*UI\.([A-Za-z_$][\w$]*)\s*\)\.[A-Za-z_$][\w$]*\s*=/g))
		assigned.add(m[1]);
}

// 3) 全仓库对 UI.<slot> 的消费（读，排除赋值行）
const consumed = new Map();
for (const { full, rel } of files) {
	const src = readSource(full);
	for (const line of src.split('\n')) {
		for (const m of line.matchAll(/\bUI\.([A-Za-z_$][\w$]*)/g)) {
			if (/^\s*UI\.[A-Za-z_$][\w$]*\s*=/.test(line)) continue; // 赋值行跳过
			if (!consumed.has(m[1])) consumed.set(m[1], new Set());
			consumed.get(m[1]).add(rel.replace('packages/editor/src/', ''));
		}
	}
}

console.log(`ui-window.ts 声明槽位：${declared.length} 个`);
console.log(`全仓库有赋值的位置：${assigned.size} 个槽位`);
console.log(`全仓库有消费的槽位：${consumed.size} 个`);

console.log('\n=== ⚠️ 有消费、但**从未被赋值**（永远读到 null）===');
const neverAssigned = [...consumed.keys()]
	.filter((k) => !assigned.has(k))
	.sort((a, b) => a.localeCompare(b));
if (neverAssigned.length === 0) console.log('  （无）');
for (const k of neverAssigned) {
	const where = [...consumed.get(k)].slice(0, 4).join(', ');
	console.log(`  UI.${k.padEnd(28)} ← ${where}`);
}

console.log('\n=== 已声明、但既无赋值也无消费（可随遗留层一起删）===');
const dead = declared
	.filter((k) => !assigned.has(k) && !consumed.has(k))
	.sort((a, b) => a.localeCompare(b));
console.log(`  共 ${dead.length} 个：${dead.join(', ')}`);

console.log('\n=== 有赋值但无消费（赋值方白做，通常是漏接）===');
const unused = [...assigned].filter((k) => !consumed.has(k)).sort((a, b) => a.localeCompare(b));
console.log(`  共 ${unused.length} 个：${unused.join(', ')}`);
