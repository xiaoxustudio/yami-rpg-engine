import {
	drawBackgrounds,
	drawForegrounds,
	drawScene,
	updateAnimations,
	updateParticles
} from './draw-core.ts';
import { drawTileLayer, drawTilePreview, drawTilemap } from './draw-tilemap.ts';
import { drawGridLayer, drawRegionBorders, drawRegionLayer } from './draw-grid-region.ts';
import { drawDirectLightLayer, drawNameLayer, drawObjectLayer } from './draw-object.ts';
import { drawTerrainLayer } from './draw-terrain.ts';
import { drawLightTextures, drawLightWireframe } from './draw-lights.ts';
import { drawTerrainMarquee, drawTileMarquee } from './draw-marquee.ts';
import {
	drawAnimationAnchor,
	drawAnimationWireframe,
	drawParallaxWireframe,
	drawParticleEmitterWireframe,
	drawRegionWireframe,
	drawTilemapWireframe
} from './draw-wireframes.ts';
import { createStartPositionTexture, drawStartPosition } from './draw-start-position.ts';

/**
 * 场景绘制的对外装配面。
 *
 * **口径收紧（2026-09-20，`any-hatches` 收口）**：此前是
 * `export const SceneDrawEngine: Record<string, any> = {}` 后面跟 27 行
 * `SceneDrawEngine.x = x;`。`any` 的代价是这个名字面上**任何**成员名都能编译通过，
 * 而唯一的消费方 `scene-draw.ts` 是**逐条镜像**到 `Scene` 上（`Scene.drawScene = …`），
 * 一旦某条拼错，镜像就静默挂了个 `undefined`，直到运行时才发现。
 *
 * 这里改成对象字面量：27 个成员的类型**全部由 `./draw-*.ts` 的导出推断**，零手写签名。
 * 位置不动（24 行处），因为这 27 个函数全部是**上方 import 进来的**，不存在「先建空对象、
 * 等下面声明完再挂」的时序依赖 —— 与 `ParticleEngine` 那种「引用文件下方的 class」
 * 的情形不同（那一处已试过并回退，见 PHASE-1C 第 63 轮）。
 */
export const SceneDrawEngine = {
	drawScene,
	drawBackgrounds,
	drawForegrounds,
	updateAnimations,
	updateParticles,
	drawTilemap,
	drawTilePreview,
	drawTileLayer,
	drawGridLayer,
	drawRegionLayer,
	drawRegionBorders,
	drawObjectLayer,
	drawDirectLightLayer,
	drawNameLayer,
	drawTerrainLayer,
	drawLightTextures,
	drawTileMarquee,
	drawTerrainMarquee,
	drawTilemapWireframe,
	drawAnimationWireframe,
	drawAnimationAnchor,
	drawLightWireframe,
	drawRegionWireframe,
	drawParticleEmitterWireframe,
	drawParallaxWireframe,
	createStartPositionTexture,
	drawStartPosition
};
