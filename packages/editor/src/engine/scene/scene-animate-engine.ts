import { css } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Scene } from '@app/scene/scene-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

// oxlint-disable-next-line no-explicit-any
export const SceneAnimateEngine: Record<string, any> = {};
SceneAnimateEngine.requestAnimation = function (this: typeof Scene) {
	if (this.state === 'open' && this.showAnimation) {
		Timer.appendUpdater!('stageAnimation', this.updateAnimation);
	}
};

/**
 * 绘制缓冲是否可渲染：页面隐藏 / 窗口最小化 / 布局重建瞬间画布会退化为 0×0，
 * 此时继续 `gl.clear` 会持续刷 `GL_INVALID_FRAMEBUFFER_OPERATION: Attachment has zero size`。
 * 渲染循环据此跳过绘制（尺寸恢复后自动继续，无需重挂 updater）。
 */
const hasRenderableCanvas = (): boolean => {
	const screen = Scene.screen as unknown as HTMLCanvasElement | null | undefined;
	return screen !== null && screen !== undefined && screen.width !== 0 && screen.height !== 0;
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
	if (Timer.updaters.stageRendering !== Scene.renderingFunction && hasRenderableCanvas()) {
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
	if (!hasRenderableCanvas()) return;
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
