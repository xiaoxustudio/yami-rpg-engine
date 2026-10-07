import { css } from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { Scene } from '@app/scene/scene-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

type SceneAnimateThis = {
	state: string;
	showAnimation: boolean;
	parallaxes: { hidden?: boolean; player: { update(deltaTime: number): void } }[];
	updateAnimation: (deltaTime: number) => void;
	renderingFunction: () => void;
};

type SceneAnimateEngineShape = {
	requestAnimation: (this: SceneAnimateThis) => void;
	updateAnimation: (this: SceneAnimateThis, deltaTime: number) => void;
	stopAnimation: (this: SceneAnimateThis) => void;
	requestRendering: (this: SceneAnimateThis) => void;
	renderingFunction: (this: SceneAnimateThis) => void;
	stopRendering: (this: SceneAnimateThis) => void;
	updateFont: (this: SceneAnimateThis) => void;
	updateParallaxes: (this: SceneAnimateThis, deltaTime: number) => void;
};

export const SceneAnimateEngine: Partial<SceneAnimateEngineShape> = {};
SceneAnimateEngine.requestAnimation = function (this: SceneAnimateThis) {
	if (this.state === 'open' && this.showAnimation) {
		Timer.appendUpdater!('stageAnimation', this.updateAnimation);
	}
};

/**
 * 绘制缓冲是否可渲染：页面隐藏 / 窗口最小化 / 布局重建瞬间画布会退化为 0×0，
 * 此时继续 `gl.clear` 会持续刷 `GL_INVALID_FRAMEBUFFER_OPERATION: Attachment has zero size`。
 * 渲染循环据此跳过绘制。`stageRendering` 是**一次性** updater（`timer.ts:195` 调用后即置 null），
 * 被跳过的这一帧不会自己回来 —— 但尺寸恢复必然走 `Scene.windowResize`，它 `resize()` 之后
 * 立刻 `requestRendering()`（`scene-events-window.ts:12`），上下文丢失恢复同理由 `webglRestored`
 * 重挂；动画播放期间另有持续性的 `stageAnimation` 逐帧 `drawScene`。
 *
 * 读的是 `GL.canvas` —— `webgl-init.ts` 里 `document.createElement('canvas')` 造的真画布
 * （初值 0×0，由 `GL.resize` 撑开），全仓 `GL.canvas` 取的就是它（`layout.ts` 还会把它插进 DOM）。
 *
 * `<div class="box" id="scene-screen">`（`components/layout/LayoutPanel.vue`），div 没有
 * `width`/`height` 属性（`undefined`），`undefined !== 0` 恒真 ⇒ 整条守卫从未生效，
 * 那个 `as unknown as HTMLCanvasElement | null | undefined` 只是把这次误读圆了过去。
 */
const hasRenderableCanvas = (): boolean => {
	const canvas = GL.canvas;
	return canvas.width !== 0 && canvas.height !== 0;
};

SceneAnimateEngine.updateAnimation = function (this: SceneAnimateThis, deltaTime: number) {
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

SceneAnimateEngine.stopAnimation = function (this: SceneAnimateThis) {
	Timer.removeUpdater!('stageAnimation', this.updateAnimation);
};

SceneAnimateEngine.requestRendering = function (this: SceneAnimateThis) {
	if (this.state === 'open') {
		Timer.appendUpdater!('stageRendering', this.renderingFunction);
	}
};

SceneAnimateEngine.renderingFunction = function (this: SceneAnimateThis) {
	if (!hasRenderableCanvas()) return;
	Scene.updateAnimations!(0);
	Scene.drawScene!();
};

SceneAnimateEngine.stopRendering = function (this: SceneAnimateThis) {
	Timer.removeUpdater!('stageRendering', this.renderingFunction);
};

SceneAnimateEngine.updateFont = function (this: SceneAnimateThis) {
	const context = GL.context2d;
	const size = window.devicePixelRatio * 12;
	if (context.size !== size) {
		context.size = size;
		context.font = `${size}px ${css(document.body).fontFamily}`;
	}
};

SceneAnimateEngine.updateParallaxes = function (this: SceneAnimateThis, deltaTime: number) {
	for (const parallax of this.parallaxes) {
		if (parallax.hidden) continue;
		parallax.player.update(deltaTime);
	}
};
