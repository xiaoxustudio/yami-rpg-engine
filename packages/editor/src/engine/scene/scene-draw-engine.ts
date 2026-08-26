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

// oxlint-disable-next-line no-explicit-any
export const SceneDrawEngine: Record<string, any> = {};
SceneDrawEngine.drawScene = drawScene;
SceneDrawEngine.drawBackgrounds = drawBackgrounds;
SceneDrawEngine.drawForegrounds = drawForegrounds;
SceneDrawEngine.updateAnimations = updateAnimations;
SceneDrawEngine.updateParticles = updateParticles;
SceneDrawEngine.drawTilemap = drawTilemap;
SceneDrawEngine.drawTilePreview = drawTilePreview;
SceneDrawEngine.drawTileLayer = drawTileLayer;
SceneDrawEngine.drawGridLayer = drawGridLayer;
SceneDrawEngine.drawRegionLayer = drawRegionLayer;
SceneDrawEngine.drawRegionBorders = drawRegionBorders;
SceneDrawEngine.drawObjectLayer = drawObjectLayer;
SceneDrawEngine.drawDirectLightLayer = drawDirectLightLayer;
SceneDrawEngine.drawNameLayer = drawNameLayer;
SceneDrawEngine.drawTerrainLayer = drawTerrainLayer;
SceneDrawEngine.drawLightTextures = drawLightTextures;
SceneDrawEngine.drawTileMarquee = drawTileMarquee;
SceneDrawEngine.drawTerrainMarquee = drawTerrainMarquee;
SceneDrawEngine.drawTilemapWireframe = drawTilemapWireframe;
SceneDrawEngine.drawAnimationWireframe = drawAnimationWireframe;
SceneDrawEngine.drawAnimationAnchor = drawAnimationAnchor;
SceneDrawEngine.drawLightWireframe = drawLightWireframe;
SceneDrawEngine.drawRegionWireframe = drawRegionWireframe;
SceneDrawEngine.drawParticleEmitterWireframe = drawParticleEmitterWireframe;
SceneDrawEngine.drawParallaxWireframe = drawParallaxWireframe;
SceneDrawEngine.createStartPositionTexture = createStartPositionTexture;
SceneDrawEngine.drawStartPosition = drawStartPosition;
