import { readFileSync, writeFileSync } from 'node:fs';

/**
 * `autoTile-generateFrames` 窗口的唯一登记用途是「`closed` 时通知单例」——能力窗口自己就有
 * （`WindowFrame` 的 emit）。按 CONTRIBUTING 的「单例只要根元素一个能力 → 根本不需要桥」处理。
 */
const windowFile = 'packages/editor/src/components/tools/AutoTileGenerateFrames.vue';
let text = readFileSync(windowFile, 'utf8');

text = text.replace(
	/\t<WindowFrame\n\t\tid="autoTile-generateFrames"\n\t\t:ref="registryRef\(paletteEls, 'autoTile-generateFrames'\)"\n\t\t@confirm="onConfirm"\n\t>/,
	'\t<WindowFrame\n\t\tid="autoTile-generateFrames"\n\t\t@confirm="onConfirm"\n\t\t@closed="onWindowClosed"\n\t>'
);
text = text.replace("import { paletteEls } from '@app/palette/element-registry';\n", '');
text = text.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
text = text.replace(
	"const onConfirm = () => {\n\tFrameGenerator?.confirm?.(new Event('click'));\n};",
	[
		'const onConfirm = () => {',
		"\tFrameGenerator?.confirm?.(new Event('click'));",
		'};',
		'',
		'/** 关闭时通知单例：窗口自己就有 `closed`，不必让单例按 id 去注册表摸根元素。 */',
		'const onWindowClosed = () => {',
		"\tFrameGenerator?.windowClosed?.(new Event('closed'));",
		'};'
	].join('\n')
);
writeFileSync(windowFile, text);
console.log(/registryRef|paletteEls/.test(text) ? '! 窗口仍有注册表引用' : '✓ 窗口已改');

const singletonFile = 'packages/editor/src/palette/tile-frame-generator.ts';
let s = readFileSync(singletonFile, 'utf8');
s = s.replace("import { paletteEls } from '@app/palette/element-registry';\n", '');
s = s.replace("import { on } from '@app/utils/element-utils.ts';\n", '');
s = s.replace(
	/\n\tconst frameWindow = paletteEls\.get\('autoTile-generateFrames'\) as YamiElement;\n\tif \(frameWindow\) on\(frameWindow, 'closed', this\.windowClosed!\);/,
	'\n\t// `closed` 通知由窗口自己发（见 AutoTileGenerateFrames.vue 的 onWindowClosed）。'
);
writeFileSync(singletonFile, s);
console.log(/paletteEls/.test(s) ? '! 单例仍有 paletteEls 引用' : '✓ 单例已改');
