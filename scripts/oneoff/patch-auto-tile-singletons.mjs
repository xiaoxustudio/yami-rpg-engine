import { readFileSync, writeFileSync } from 'node:fs';

/** auto-tile.ts：ensureDomBound / registerWindowEvents 改读句柄表。 */
const autoTileFile = 'packages/editor/src/palette/auto-tile.ts';
let text = readFileSync(autoTileFile, 'utf8');

text = text.replace(
	"import { paletteEls } from '@app/palette/element-registry';",
	"import { getAutoTileHandles } from '@app/composables/auto-tile-handles';"
);

text = text.replace(
	/const canvas = registryElement<HTMLCanvasElement>\(paletteEls, 'autoTile-canvas'\);\n\tconst templateList = registryElement<AutoTileListElement>\(paletteEls, 'autoTile-templates'\);\n\tif \(!templateList \|\| !canvas\) return false;/,
	[
		'\tconst handles = getAutoTileHandles();',
		'\tif (!handles) return false;',
		'\tconst canvas = handles.canvas;',
		'\tconst templateList = handles.templates as unknown as AutoTileListElement;',
		'\tif (!templateList || !canvas) return false;'
	].join('\n')
);
text = text.replace(
	"\tAutoTile.nodeList = paletteEls.get('autoTile-nodes') ?? null;\n\tAutoTile.frameList = paletteEls.get('autoTile-frames') ?? null;",
	'\tAutoTile.nodeList = handles.nodes;\n\tAutoTile.frameList = handles.frames;'
);
text = text.replace(
	"\tconst frame = paletteEls.get('autoTile') as YamiElement;\n\tif (!frame || !AutoTile.templateList || !AutoTile.nodeList || !AutoTile.frameList) return;",
	'\tconst frame = getAutoTileHandles()?.root ?? null;\n\tif (!frame || !AutoTile.templateList || !AutoTile.nodeList || !AutoTile.frameList) return;'
);
writeFileSync(autoTileFile, text);
console.log(/paletteEls/.test(text) ? '! auto-tile 仍有 paletteEls' : '✓ auto-tile 已改');

/** useTileNodeWindow.ts：三个 getter 改读句柄表。 */
const tileNodeFile = 'packages/editor/src/composables/useTileNodeWindow.ts';
let tile = readFileSync(tileNodeFile, 'utf8');
tile = tile.replace(
	"import { registryElement } from '@app/utils/element-registry';",
	"import { getTileNodeHandles } from '@app/composables/auto-tile-handles';"
);
tile = tile.replace(
	/const getCanvas = \(\): HTMLCanvasElement =>\n\tregistryElement<HTMLCanvasElement>\(composableEls, 'autoTile-selectNode-canvas'\)!;/,
	'const getCanvas = (): HTMLCanvasElement | null => getTileNodeHandles()?.canvas ?? null;'
);
tile = tile.replace(
	/const getScreen = \(\): HTMLElement => composableEls\.get\('autoTile-selectNode-screen'\) as HTMLElement;/,
	'const getScreen = (): HTMLElement | null => getTileNodeHandles()?.screen ?? null;'
);
tile = tile.replace(
	/const getMarquee = \(\): TileNodeMarquee =>\n\tregistryElement<TileNodeMarquee>\(composableEls, 'autoTile-selectNode-marquee'\)!;/,
	'const getMarquee = (): TileNodeMarquee | null =>\n\t(getTileNodeHandles()?.marquee as unknown as TileNodeMarquee) ?? null;'
);
writeFileSync(tileNodeFile, tile);
console.log(
	/composableEls/.test(tile)
		? '! useTileNodeWindow 仍有 composableEls'
		: '✓ useTileNodeWindow 已改'
);
