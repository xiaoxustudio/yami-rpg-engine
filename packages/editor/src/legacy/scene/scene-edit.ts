import { Scene } from './scene-window.ts';
import { SceneEditEngine } from '@app/engine/scene/scene-edit-engine.ts';

Scene.edit = SceneEditEngine.edit;
Scene.editInPencilMode = SceneEditEngine.editInPencilMode;
Scene.editInRectMode = SceneEditEngine.editInRectMode;
Scene.editInOvalMode = SceneEditEngine.editInOvalMode;
Scene.editInFillMode = SceneEditEngine.editInFillMode;
Scene.setTile = SceneEditEngine.setTile;
Scene.setTileFrame = SceneEditEngine.setTileFrame;
Scene.setTerrain = SceneEditEngine.setTerrain;
Scene.createTiles = SceneEditEngine.createTiles;
Scene.cloneTiles = SceneEditEngine.cloneTiles;
Scene.createTerrains = SceneEditEngine.createTerrains;
Scene.getNewTilesetIndex = SceneEditEngine.getNewTilesetIndex;
