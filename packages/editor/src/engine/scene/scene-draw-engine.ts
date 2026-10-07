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
