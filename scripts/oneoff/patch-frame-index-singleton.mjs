import { readFileSync, writeFileSync } from 'node:fs';

/** `tile-frame-index.ts`：7 个 getter 从注册表改为读句柄表。 */
const file = 'packages/editor/src/palette/tile-frame-index.ts';
let text = readFileSync(file, 'utf8');

text = text.replace(
	"import { paletteEls } from '@app/palette/element-registry';",
	"import { getFrameIndexHandles } from '@app/composables/frame-index-handles';"
);

const getters = [
	['window', 'autoTile-frameIndex', 'win'],
	['screen', 'autoTile-frameIndex-screen', 'screen'],
	['clip', 'autoTile-frameIndex-image-clip', 'clip'],
	['mask', 'autoTile-frameIndex-mask', 'mask'],
	['image', 'autoTile-frameIndex-image', 'image'],
	['marquee', 'autoTile-frameIndex-marquee', 'marquee'],
	['info', 'autoTile-frameIndex-info', 'info']
];
for (const [name, id, key] of getters) {
	const re = new RegExp(
		`\\tget ${name}\\(\\) \\{\\n\\t\\treturn paletteEls\\.get\\('${id}'\\) as (\\w+);\\n\\t\\},`
	);
	text = text.replace(
		re,
		`\tget ${name}() {\n\t\treturn (getFrameIndexHandles()?.${key} ?? null) as $1;\n\t},`
	);
}

writeFileSync(file, text);
console.log(/paletteEls/.test(text) ? `! 仍有 paletteEls 引用` : '✓ tile-frame-index 已改');
