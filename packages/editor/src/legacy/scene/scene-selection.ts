import { Scene } from './scene-window.ts';
import { SceneSelectionEngine } from '@app/engine/scene/scene-selection-engine.ts';

Scene.selectObject = SceneSelectionEngine.selectObject;
Scene.selectRegion = SceneSelectionEngine.selectRegion;
Scene.selectLight = SceneSelectionEngine.selectLight;
Scene.selectParticleEmitter = SceneSelectionEngine.selectParticleEmitter;
Scene.selectSortedLayer = SceneSelectionEngine.selectSortedLayer;
Scene.drawOvalWireframe = SceneSelectionEngine.drawOvalWireframe;
Scene.drawTargetAnchor = SceneSelectionEngine.drawTargetAnchor;
Scene.drawRectWireframe = SceneSelectionEngine.drawRectWireframe;
Scene.drawRectWireframeOnTilemap = SceneSelectionEngine.drawRectWireframeOnTilemap;
Scene.setRectWireframeVertices = SceneSelectionEngine.setRectWireframeVertices;
