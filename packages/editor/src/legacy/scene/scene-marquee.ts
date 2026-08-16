import { Scene } from './scene-window.ts';
import { SceneMarqueeEngine } from '@app/engine/scene/scene-marquee-engine.ts';

Scene.marquee.save = SceneMarqueeEngine.save;
Scene.marquee.switch = SceneMarqueeEngine.switch;
Scene.marquee.resize = SceneMarqueeEngine.resize;
Scene.marquee.clear = SceneMarqueeEngine.clear;
Scene.marquee.select = SceneMarqueeEngine.select;
Scene.marquee.selectInPencilMode = SceneMarqueeEngine.selectInPencilMode;
Scene.marquee.selectInRectMode = SceneMarqueeEngine.selectInRectMode;
Scene.marquee.selectInCopyMode = SceneMarqueeEngine.selectInCopyMode;
Scene.marquee.selectInObjectMode = SceneMarqueeEngine.selectInObjectMode;
Scene.marquee.getTiles = SceneMarqueeEngine.getTiles;
