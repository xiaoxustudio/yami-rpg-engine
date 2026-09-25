/**
 * 读取 `ui-domain-contract.ts` 成员表的**唯一实现**（2026-09-22 第 209 轮）。
 *
 * ## 为什么要有这个文件
 *
 * 「逐行正则读契约成员」这个手法此前在三个脚本里各写了一份，于是**各瞎了一次**：
 *
 * | 序 | 文件 | 症状 |
 * | --- | --- | --- |
 * | 1 | `gen-contract-members.mjs`（收尾清理） | 删掉被 oxfmt 折行的续行、留下半个条目 ⇒ 声明数漂移 77 → 76 → 75 |
 * | 2 | `wire-contract-members.mjs`（解析） | 折行条目被静默漏掉 |
 * | 3 | `classify-deferred-members.mjs`（解析） | 临时"全接线"漏接那条 ⇒ 归因表**少报**一条错误 |
 *
 * 根因是同一个：**oxfmt 会把长签名折行**，而 `^\t(name): (.+)` 只认单行。
 * ⇒ 一处能力只应有一处实现；这条对**仪器**比对产品代码更硬。
 *
 * ## 口径
 *
 * 逐行起步，**括号配平 + 以 `;` 收尾**才认为一条结束（跨行累积）。
 * 注意不能用「遇到第一个 `;` 就结束」：对象类型里也会有 `;`（`{ a: string; b: number }`）。
 *
 * @param {string} src 契约文件全文
 * @returns {Array<[string, string]>} `[成员名, 类型文本]`（类型文本已去掉结尾分号，且空白折叠为单空格）
 */
export function parseMembers(src) {
	const out = [];
	const lines = src.split('\n');
	const balance = (text, state) => {
		for (const ch of text) {
			if ('([{'.includes(ch)) state.depth++;
			else if (')]}'.includes(ch)) state.depth--;
		}
	};
	for (let i = 0; i < lines.length; i++) {
		const m = /^\t([A-Za-z_$][\w$]*): ?(.*)$/.exec(lines[i]);
		if (!m) continue;
		const state = { depth: 0 };
		let buf = m[2];
		balance(buf, state);
		let j = i;
		while ((state.depth > 0 || !buf.trimEnd().endsWith(';')) && j + 1 < lines.length) {
			j++;
			buf += ' ' + lines[j].trim();
			balance(lines[j], state);
		}
		out.push([m[1], buf.trim().replace(/;$/, '')]);
		i = j;
	}
	return out;
}

/** `parseMembers()` 的 `Map` 版本（成员名 → 类型文本）。 */
export function memberTypes(src) {
	return new Map(parseMembers(src));
}
