// GBK ↔ UTF-8 误解码（mojibake）的**判定与还原** —— 零依赖，只用 Node 内置的
// `TextDecoder`。被 `scripts/lib/text-integrity.mjs`（门禁规则）与
// `scripts/lib/self-test.mjs`（自证）共用。
//
// ## 守的是什么
//
// 第 124 轮在 `element-page.ts` 上撞见一行**语法合法**的坏文本：一句中文注释被
// `GBK ↔ UTF-8` 误解码成了乱码，`tsc` / `oxlint` / `oxfmt` / vitest / `text:check` 的
// 7 条规则**全都看不见**。随后实测发现这不是孤例：本仓当时还躺着若干行同样的乱码
// （第 125 轮修掉），全部通过了所有门禁。
//
// ## 为什么不用「稀有字符黑名单」
//
// 直觉做法是列一批「只可能出现在乱码里」的稀有汉字。实测可行但不牢靠：那样得到的
// 判据是**口味**（哪些字够稀有），而且黑名单本身是一串乱码字符，放进被扫面里会被自己
// 抓到。这里改用**语义**判据 —— 误解码是**可逆**的：
//
//   UTF-8 字节 --(当成 GBK 解码)--> 乱码 --(编回 GBK 字节)--> 原字节 --(严格 UTF-8 解码)--> 原文
//
// 中间那步「编回 GBK 字节」Node 没给（`TextDecoder` 只能解不能编），但可以**反过来枚举**：
// 把 `0x81..0xFE × 0x40..0xFE` 两万多组字节对喂给严格的 `gbk` 解码器，就得到
// 字符 → 字节对 的表（实测 24 ms）。于是判据变成一句可执行的话：
//
//   **这一行的字符编回 GBK 字节后，若能严格按 UTF-8 解出中文 ⇒ 这行就是误解码的产物。**
//
// 这个判据没有「稀有度」这种主观量，而且**顺带把原文还回来**（门禁可以直接打印还原结果）。
// 误报面也由构造决定：纯中文的一行要被误判，它的 GBK 字节就必须**正好是一段 UTF-8 编码的
// 中文** —— 那正是「这行是误解码产物」的定义本身，不是巧合。实测全仓 1586 文件零误报。
//
// ## 一个关键细节：丢字
//
// 事故里的解码器遇到解不出的字节对，有的写 U+FFFD，有的写**半角 `?`**（本仓那次是 `?`）——
// 所以现有 `replacement-char` 规则（只认 U+FFFD）放过了它。丢一个 `?` 就丢了 2 个字节，
// 后面的字节流对不齐 ⇒ 还原只能**分段**做：`?` 与 ASCII 都是天然的断点，断点之间各自还原。

/** `0x81..0xFE` × `0x40..0xFE` 反查出来的 `字符 → 字节对` 表。 */
function buildGbkBytes() {
	const map = new Map();
	const pair = new Uint8Array(2);
	const decoder = new TextDecoder('gbk', { fatal: true });
	for (let lead = 0x81; lead <= 0xfe; lead++) {
		for (let trail = 0x40; trail <= 0xfe; trail++) {
			pair[0] = lead;
			pair[1] = trail;
			let text;
			try {
				text = decoder.decode(pair);
			} catch {
				continue; // 这一组不是合法的 GBK 字节对
			}
			if (text.length === 1 && !map.has(text)) map.set(text, [lead, trail]);
		}
	}
	return map;
}

/** 惰性建表：只有真的要判 mojibake 时才付这 24 ms。 */
let GBK_BYTES = null;
function gbkBytes() {
	if (GBK_BYTES === null) GBK_BYTES = buildGbkBytes();
	return GBK_BYTES;
}

const CJK_RE = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
const UTF8_STRICT = new TextDecoder('utf-8', { fatal: true });
const UTF8_LOOSE = new TextDecoder('utf-8', { fatal: false });

/**
 * 「像文本」判定 —— 还原出来的东西里，中文要占**多数**。
 *
 * 为什么必须有这一条：宽松解码会把**错位**的字节也解出零碎字符（实测把阈值降到「1 个中文」
 * 时全仓能命中 1470 行，绝大多数是 `€` 之类的二进制渣）。真正被误解码的句子还原后通篇是文本，
 * 所以「中文占多数」能把巧合与事故分开。
 *
 * 为什么是**比例**而不是「通篇合法」：信息丢失（解码器把解不出的字节对写成 `?`）会让少数位置
 * 永远错位，还原结果里会留下 `€` 这样的残渣 —— 那是**事故的标志**，不是「不是事故」的理由。
 * 一刀切要求通篇合法，反而会漏掉丢字最严重的那几处（本仓实测漏 3 处）。
 *
 * @returns {number} 中文个数（不合格返回 0）
 */
function looksLikeText(piece, minChars) {
	let cjk = 0;
	let other = 0;
	for (const ch of piece) {
		const cp = ch.codePointAt(0);
		if (CJK_RE.test(ch)) {
			cjk++;
			continue;
		}
		if (cp >= 0x20 && cp <= 0x7e) continue; // ASCII 可打印
		if (cp >= 0x3000 && cp <= 0x303f) continue; // 全角标点
		if (cp >= 0xff00 && cp <= 0xffef) continue; // 全角形式
		other++;
	}
	if (cjk < minChars) return 0;
	if (other > piece.length * 0.25) return 0; // 残渣太多 ⇒ 只是字节错位的巧合
	return cjk;
}

/** 数中文个数 —— 用 for-of 逐码点，不用 `[...s]`（本仓 `no-misused-spread` 拦的就是这个）。 */
function countCjk(text) {
	let n = 0;
	for (const ch of text) if (CJK_RE.test(ch)) n++;
	return n;
}

/** 一段字节能不能按 UTF-8 解出**像文本的**中文？返回拼好的结果（没有就返回 `null`）。 */
function decodeRun(bytes, minChars) {
	// 先试严格解码：整段都是合法 UTF-8 ⇒ 这就是最干净的情形。
	try {
		const text = UTF8_STRICT.decode(bytes);
		const cjk = looksLikeText(text, minChars);
		if (cjk >= minChars) return text;
	} catch {
		/* 下面用宽松解码切段 */
	}
	// 严格解码失败大多是**尾部残缺**或**中段错位**（丢了 `?` 就等于丢了 2 个字节）。
	// 按 U+FFFD 切开，逐段取「像文本」的 —— 每一段自身都是合法的 UTF-8 前缀。
	const pieces = [];
	for (const piece of UTF8_LOOSE.decode(bytes).split('\uFFFD')) {
		if (looksLikeText(piece, minChars) >= minChars) pieces.push(piece);
	}
	return pieces.length > 0 ? pieces.join('') : null;
}

/**
 * 把一行的**误码段**还原成原文。
 *
 * 逐字符累积「编回 GBK 字节」的缓冲；遇到不在表里的字符（ASCII、`?`、表情等）就是断点，
 * 先试着把缓冲按 UTF-8 解 —— 解得出中文 ⇒ 那一段就是误码，用还原结果替换；
 * 否则原样保留。返回整行、还原出来的中文个数、以及各段还原结果。
 *
 * @param {string} line
 * @param {{ minChars?: number }} [options] 一段至少还原出这么多中文才算数（默认 2）
 * @returns {{ text: string, recoveredCjk: number, segments: string[] }}
 */
export function recoverMojibake(line, options = {}) {
	const minChars = options.minChars ?? 2;
	const map = gbkBytes();
	let out = '';
	let bytes = [];
	let pending = '';
	let recoveredCjk = 0;
	const segments = [];

	const flush = () => {
		if (bytes.length > 0) {
			const text = decodeRun(Uint8Array.from(bytes), minChars);
			if (text !== null) {
				out += text;
				recoveredCjk += countCjk(text);
				segments.push(text);
			} else {
				out += pending; // 不是误码 ⇒ 原样保留
			}
		}
		bytes = [];
		pending = '';
	};

	for (const ch of line) {
		const pair = map.get(ch);
		if (pair === undefined) {
			flush();
			out += ch;
			continue;
		}
		bytes.push(pair[0], pair[1]);
		pending += ch;
	}
	flush();
	return { text: out, recoveredCjk, segments };
}

/** 判据本体：一行是否（疑似）误解码产物。返回还原结果或 `null`。 */
export function detectMojibake(line, options = {}) {
	const { text, recoveredCjk, segments } = recoverMojibake(line, options);
	if (recoveredCjk <= 0) return null;
	return { text, recoveredCjk, segments };
}

/** 反复还原到不动点（用于「乱码上又乱了一次」的样本）。 */
export function recoverUntilStable(line, options = {}) {
	let current = line;
	const chain = [];
	for (let round = 0; round < 6; round++) {
		const hit = detectMojibake(current, options);
		if (hit === null) break;
		chain.push(hit.text);
		current = hit.text;
	}
	return { text: current, chain };
}
