import { css } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Scene } from '@app/scene/scene-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

export const SceneAnimateEngine: Record<string, any> = {};
SceneAnimateEngine.requestAnimation = function (this: typeof Scene) {
	if (this.state === 'open' && this.showAnimation) {
		Timer.appendUpdater!('stageAnimation', this.updateAnimation);
	}
};

SceneAnimateEngine.updateAnimation = function (this: typeof Scene, deltaTime: number) {
	const { animationInterval } = Scene;
	if (animationInterval > 0) {
		Scene.animationElapsed += deltaTime;
		if (Scene.animationElapsed >= animationInterval) {
			Scene.animationElapsed -= animationInterval;
			Scene.animationFrame += 1;
		}
	}
	Scene.updateParallaxes!(deltaTime);
	Scene.updateAnimations!(deltaTime);
	Scene.updateParticles!(deltaTime);
	if (Timer.updaters.stageRendering !== Scene.renderingFunction) {
		Scene.drawScene!();
	}
};

SceneAnimateEngine.stopAnimation = function (this: typeof Scene) {
	Timer.removeUpdater!('stageAnimation', this.updateAnimation);
};

SceneAnimateEngine.requestRendering = function (this: typeof Scene) {
	if (this.state === 'open') {
		Timer.appendUpdater!('stageRendering', this.renderingFunction);
	}
};

SceneAnimateEngine.renderingFunction = function (this: typeof Scene) {
	Scene.updateAnimations!(0);
	Scene.drawScene!();
};

SceneAnimateEngine.stopRendering = function (this: typeof Scene) {
	Timer.removeUpdater!('stageRendering', this.renderingFunction);
};

SceneAnimateEngine.updateFont = function (this: typeof Scene) {
	const context = GL.context2d;
	const size = window.devicePixelRatio * 12;
	if (context.size !== size) {
		context.size = size;
		context.font = `${size}px ${css(document.body).fontFamily}`;
	}
};

SceneAnimateEngine.updateParallaxes = function (this: typeof Scene, deltaTime: number) {
	for (const parallax of this.parallaxes) {
		if (parallax.hidden) continue;
		parallax.player.update(deltaTime);
	}
};
