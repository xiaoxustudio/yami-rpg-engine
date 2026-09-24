// 一次性探针（第 125 轮）：找一个**无丢字**的误解码样本。
//
// 为什么需要它：Node 的 `gbk` 解码器遇到无法映射的字节对写 U+FFFD，那 2 个字节就永久丢了，
// 还原只能还原「没丢字的部分」。判据「能把原文一字不差地还回来」这个说法，只有在
// **没有丢字**的样本上才成立 —— 所以要真找一个这样的样本来证明它，不能只在注释里声称。
//
// 运行：node scripts/oneoff/find-lossless-mojibake.mjs

import { readFileSync } from 'node:fs';
import { ROOT } from '../lib/scan.mjs';
import { collectTextFiles } from '../lib/text-integrity.mjs';
import { detectMojibake } from '../lib/gbk-mojibake.mjs';

const gbk = new TextDecoder('gbk');
const corrupt = (s) => gbk.decode(Buffer.from(s, 'utf8'));

// 用本仓真实的中文注释当语料：找「整行误解码后无丢字」且含 ≥4 个中文的样本
const files = collectTextFiles(ROOT);
const lossless = [];
for (const { full } of files) {
	for (const line of readFileSync(full, 'utf8').split('\n')) {
		const body = line.replace(/^\s*(?:\*|\/\/|\/\*|<!--)?\s?/, '').trim();
		let cjk = 0;
		for (const c of body) if (/[\u4E00-\u9FFF]/.test(c)) cjk++;
		if (cjk < 4 || body.length > 24) continue;
		const bad = corrupt(body);
		if (bad.includes('\uFFFD')) continue;
		const hit = detectMojibake(bad, { minChars: 2 });
		if (hit === null || hit.text !== body) continue;
		lossless.push(body);
	}
}

console.log(`\n=== 全仓里「无丢字且能一字不差还原」的短注释 ${lossless.length} 条 ===`);
for (const s of lossless.slice(0, 12)) {
	console.log(`  ${JSON.stringify(s)}  →  ${JSON.stringify(corrupt(s))}`);
}

// 再给一组**短词**（自证用例里要短小、可读）
console.log('\n=== 短词组合（2~3 个字）里无丢字的 ===');
const chars =
	'控件中文注释码记控制场景图块参数模板染窗口编辑量设置层元素属性节点事件精灵动画粒子脚本数据资源项目本地缓存音频图像文本颜色尺寸位置方向状态对象界面板单菜按对列字路径名称键值段数字符串'.split(
		''
	);
const pairs = [];
for (const a of chars) {
	for (const b of chars) {
		const s = a + b;
		if (corrupt(s).includes('\uFFFD')) continue;
		if (detectMojibake(corrupt(s), { minChars: 2 })?.text !== s) continue;
		pairs.push(s);
	}
}
console.log(`  无丢字的双字词 ${pairs.length} 个：${pairs.slice(0, 30).join(' ')}`);
if (pairs.length > 0) {
	const s = pairs[0];
	console.log(`  样例：${JSON.stringify(s)} → ${JSON.stringify(corrupt(s))}`);
	const withComment = `// ${s}`;
	console.log(
		`  带注释前缀：${JSON.stringify(withComment)} → ${JSON.stringify(corrupt(withComment))}`
	);
	console.log(
		`  还原：${JSON.stringify(detectMojibake(corrupt(withComment), { minChars: 2 })?.text)}`
	);
}
