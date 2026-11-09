/**
 * inspector 各页「绑定输入」用的控件表。
 *
 * 页面模块里 `bindInput(...)` / `bindSliders(...)` 只要元素（挂 focus / blur），以前按 id 从
 * `inspectorEls` 取；现在由页面/section 挂载时交出，页面 `pick` 读取（`pick` 带 id 兜底）。
 * 一个页面一张表，key 就是 id 去掉页面前缀后的驼峰形式。
 */
import { createSkeletonTable } from './skeleton-table';

/** UI 按钮页：48 个参与输入/滑块绑定的控件。 */
export type UiButtonNodeKey =
	| 'display'
	| 'normalImage'
	| 'normalClip'
	| 'hoverImage'
	| 'hoverClip'
	| 'activeImage'
	| 'activeClip'
	| 'flip'
	| 'border'
	| 'imagePadding'
	| 'imageOpacity'
	| 'imageEffect'
	| 'normalTint0'
	| 'normalTint1'
	| 'normalTint2'
	| 'normalTint3'
	| 'hoverTint0'
	| 'hoverTint1'
	| 'hoverTint2'
	| 'hoverTint3'
	| 'activeTint0'
	| 'activeTint1'
	| 'activeTint2'
	| 'activeTint3'
	| 'direction'
	| 'horizontalAlign'
	| 'verticalAlign'
	| 'content'
	| 'size'
	| 'letterSpacing'
	| 'textPadding'
	| 'font'
	| 'typeface'
	| 'textEffectType'
	| 'textEffectShadowOffsetX'
	| 'textEffectShadowOffsetY'
	| 'textEffectStrokeWidth'
	| 'textEffectColor'
	| 'normalColor'
	| 'hoverColor'
	| 'activeColor'
	| 'hoverSound'
	| 'clickSound'
	| 'imagePaddingSlider'
	| 'imageOpacitySlider'
	| 'sizeSlider'
	| 'letterSpacingSlider'
	| 'textPaddingSlider';

export const uiButtonNodes = createSkeletonTable<UiButtonNodeKey>({
	display: 'uiButton-display',
	normalImage: 'uiButton-normalImage',
	normalClip: 'uiButton-normalClip',
	hoverImage: 'uiButton-hoverImage',
	hoverClip: 'uiButton-hoverClip',
	activeImage: 'uiButton-activeImage',
	activeClip: 'uiButton-activeClip',
	flip: 'uiButton-flip',
	border: 'uiButton-border',
	imagePadding: 'uiButton-imagePadding',
	imageOpacity: 'uiButton-imageOpacity',
	imageEffect: 'uiButton-imageEffect',
	normalTint0: 'uiButton-normalTint-0',
	normalTint1: 'uiButton-normalTint-1',
	normalTint2: 'uiButton-normalTint-2',
	normalTint3: 'uiButton-normalTint-3',
	hoverTint0: 'uiButton-hoverTint-0',
	hoverTint1: 'uiButton-hoverTint-1',
	hoverTint2: 'uiButton-hoverTint-2',
	hoverTint3: 'uiButton-hoverTint-3',
	activeTint0: 'uiButton-activeTint-0',
	activeTint1: 'uiButton-activeTint-1',
	activeTint2: 'uiButton-activeTint-2',
	activeTint3: 'uiButton-activeTint-3',
	direction: 'uiButton-direction',
	horizontalAlign: 'uiButton-horizontalAlign',
	verticalAlign: 'uiButton-verticalAlign',
	content: 'uiButton-content',
	size: 'uiButton-size',
	letterSpacing: 'uiButton-letterSpacing',
	textPadding: 'uiButton-textPadding',
	font: 'uiButton-font',
	typeface: 'uiButton-typeface',
	textEffectType: 'uiButton-textEffect-type',
	textEffectShadowOffsetX: 'uiButton-textEffect-shadowOffsetX',
	textEffectShadowOffsetY: 'uiButton-textEffect-shadowOffsetY',
	textEffectStrokeWidth: 'uiButton-textEffect-strokeWidth',
	textEffectColor: 'uiButton-textEffect-color',
	normalColor: 'uiButton-normalColor',
	hoverColor: 'uiButton-hoverColor',
	activeColor: 'uiButton-activeColor',
	hoverSound: 'uiButton-hoverSound',
	clickSound: 'uiButton-clickSound',
	imagePaddingSlider: 'uiButton-imagePadding-slider',
	imageOpacitySlider: 'uiButton-imageOpacity-slider',
	sizeSlider: 'uiButton-size-slider',
	letterSpacingSlider: 'uiButton-letterSpacing-slider',
	textPaddingSlider: 'uiButton-textPadding-slider'
});

/** 场景角色页：8 个输入 + 2 个滑块。 */
export type SceneActorNodeKey =
	| 'name'
	| 'type'
	| 'actorId'
	| 'teamId'
	| 'x'
	| 'y'
	| 'angle'
	| 'scale'
	| 'angleSlider'
	| 'scaleSlider';

export const sceneActorNodes = createSkeletonTable<SceneActorNodeKey>({
	name: 'sceneActor-name',
	type: 'sceneActor-type',
	actorId: 'sceneActor-actorId',
	teamId: 'sceneActor-teamId',
	x: 'sceneActor-x',
	y: 'sceneActor-y',
	angle: 'sceneActor-angle',
	scale: 'sceneActor-scale',
	angleSlider: 'sceneActor-angle-slider',
	scaleSlider: 'sceneActor-scale-slider'
});

/** 场景灯光页：输入 + 滑块。 */
export type SceneLightNodeKey =
	| 'name'
	| 'type'
	| 'blend'
	| 'x'
	| 'y'
	| 'range'
	| 'intensity'
	| 'mask'
	| 'anchorX'
	| 'anchorY'
	| 'width'
	| 'height'
	| 'angle'
	| 'red'
	| 'green'
	| 'blue'
	| 'direct'
	| 'rangeSlider'
	| 'intensitySlider'
	| 'anchorXSlider'
	| 'anchorYSlider'
	| 'widthSlider'
	| 'heightSlider'
	| 'angleSlider'
	| 'redSlider'
	| 'greenSlider'
	| 'blueSlider'
	| 'directSlider';

export const sceneLightNodes = createSkeletonTable<SceneLightNodeKey>({
	name: 'sceneLight-name',
	type: 'sceneLight-type',
	blend: 'sceneLight-blend',
	x: 'sceneLight-x',
	y: 'sceneLight-y',
	range: 'sceneLight-range',
	intensity: 'sceneLight-intensity',
	mask: 'sceneLight-mask',
	anchorX: 'sceneLight-anchorX',
	anchorY: 'sceneLight-anchorY',
	width: 'sceneLight-width',
	height: 'sceneLight-height',
	angle: 'sceneLight-angle',
	red: 'sceneLight-red',
	green: 'sceneLight-green',
	blue: 'sceneLight-blue',
	direct: 'sceneLight-direct',
	rangeSlider: 'sceneLight-range-slider',
	intensitySlider: 'sceneLight-intensity-slider',
	anchorXSlider: 'sceneLight-anchorX-slider',
	anchorYSlider: 'sceneLight-anchorY-slider',
	widthSlider: 'sceneLight-width-slider',
	heightSlider: 'sceneLight-height-slider',
	angleSlider: 'sceneLight-angle-slider',
	redSlider: 'sceneLight-red-slider',
	greenSlider: 'sceneLight-green-slider',
	blueSlider: 'sceneLight-blue-slider',
	directSlider: 'sceneLight-direct-slider'
});

/** 场景动画页：输入 + 滑块（页面级，与 meta section 的表分开）。 */
export type SceneAnimationPageNodeKey =
	| 'name'
	| 'animationId'
	| 'motion'
	| 'rotatable'
	| 'x'
	| 'y'
	| 'angle'
	| 'scale'
	| 'speed'
	| 'opacity'
	| 'priority'
	| 'angleSlider'
	| 'scaleSlider'
	| 'speedSlider'
	| 'opacitySlider'
	| 'prioritySlider';

export const sceneAnimationPageNodes = createSkeletonTable<SceneAnimationPageNodeKey>({
	name: 'sceneAnimation-name',
	animationId: 'sceneAnimation-animationId',
	motion: 'sceneAnimation-motion',
	rotatable: 'sceneAnimation-rotatable',
	x: 'sceneAnimation-x',
	y: 'sceneAnimation-y',
	angle: 'sceneAnimation-angle',
	scale: 'sceneAnimation-scale',
	speed: 'sceneAnimation-speed',
	opacity: 'sceneAnimation-opacity',
	priority: 'sceneAnimation-priority',
	angleSlider: 'sceneAnimation-angle-slider',
	scaleSlider: 'sceneAnimation-scale-slider',
	speedSlider: 'sceneAnimation-speed-slider',
	opacitySlider: 'sceneAnimation-opacity-slider',
	prioritySlider: 'sceneAnimation-priority-slider'
});

/** 场景视差页：输入 + 滑块（页面级）。 */
export type SceneParallaxPageNodeKey =
	| 'name'
	| 'image'
	| 'layer'
	| 'order'
	| 'light'
	| 'blend'
	| 'opacity'
	| 'x'
	| 'y'
	| 'scaleX'
	| 'scaleY'
	| 'repeatX'
	| 'repeatY'
	| 'anchorX'
	| 'anchorY'
	| 'offsetX'
	| 'offsetY'
	| 'parallaxFactorX'
	| 'parallaxFactorY'
	| 'shiftSpeedX'
	| 'shiftSpeedY'
	| 'tint0'
	| 'tint1'
	| 'tint2'
	| 'tint3'
	| 'tint0Slider'
	| 'tint1Slider'
	| 'tint2Slider'
	| 'tint3Slider';

export const sceneParallaxPageNodes = createSkeletonTable<SceneParallaxPageNodeKey>({
	name: 'sceneParallax-name',
	image: 'sceneParallax-image',
	layer: 'sceneParallax-layer',
	order: 'sceneParallax-order',
	light: 'sceneParallax-light',
	blend: 'sceneParallax-blend',
	opacity: 'sceneParallax-opacity',
	x: 'sceneParallax-x',
	y: 'sceneParallax-y',
	scaleX: 'sceneParallax-scaleX',
	scaleY: 'sceneParallax-scaleY',
	repeatX: 'sceneParallax-repeatX',
	repeatY: 'sceneParallax-repeatY',
	anchorX: 'sceneParallax-anchorX',
	anchorY: 'sceneParallax-anchorY',
	offsetX: 'sceneParallax-offsetX',
	offsetY: 'sceneParallax-offsetY',
	parallaxFactorX: 'sceneParallax-parallaxFactorX',
	parallaxFactorY: 'sceneParallax-parallaxFactorY',
	shiftSpeedX: 'sceneParallax-shiftSpeedX',
	shiftSpeedY: 'sceneParallax-shiftSpeedY',
	tint0: 'sceneParallax-tint-0',
	tint1: 'sceneParallax-tint-1',
	tint2: 'sceneParallax-tint-2',
	tint3: 'sceneParallax-tint-3',
	tint0Slider: 'sceneParallax-tint-0-slider',
	tint1Slider: 'sceneParallax-tint-1-slider',
	tint2Slider: 'sceneParallax-tint-2-slider',
	tint3Slider: 'sceneParallax-tint-3-slider'
});

/** 场景粒子页：输入 + 滑块（页面级）。 */
export type SceneParticlePageNodeKey =
	| 'name'
	| 'particleId'
	| 'x'
	| 'y'
	| 'angle'
	| 'scale'
	| 'speed'
	| 'opacity'
	| 'priority'
	| 'angleSlider'
	| 'scaleSlider'
	| 'speedSlider'
	| 'opacitySlider'
	| 'prioritySlider';

export const sceneParticlePageNodes = createSkeletonTable<SceneParticlePageNodeKey>({
	name: 'sceneParticle-name',
	particleId: 'sceneParticle-particleId',
	x: 'sceneParticle-x',
	y: 'sceneParticle-y',
	angle: 'sceneParticle-angle',
	scale: 'sceneParticle-scale',
	speed: 'sceneParticle-speed',
	opacity: 'sceneParticle-opacity',
	priority: 'sceneParticle-priority',
	angleSlider: 'sceneParticle-angle-slider',
	scaleSlider: 'sceneParticle-scale-slider',
	speedSlider: 'sceneParticle-speed-slider',
	opacitySlider: 'sceneParticle-opacity-slider',
	prioritySlider: 'sceneParticle-priority-slider'
});

/** 场景瓦片层页：输入 + 滑块（页面级）。 */
export type SceneTilemapPageNodeKey =
	| 'name'
	| 'layer'
	| 'order'
	| 'light'
	| 'blend'
	| 'x'
	| 'y'
	| 'anchorX'
	| 'anchorY'
	| 'offsetX'
	| 'offsetY'
	| 'parallaxFactorX'
	| 'parallaxFactorY'
	| 'opacity';

export const sceneTilemapPageNodes = createSkeletonTable<SceneTilemapPageNodeKey>({
	name: 'sceneTilemap-name',
	layer: 'sceneTilemap-layer',
	order: 'sceneTilemap-order',
	light: 'sceneTilemap-light',
	blend: 'sceneTilemap-blend',
	x: 'sceneTilemap-x',
	y: 'sceneTilemap-y',
	anchorX: 'sceneTilemap-anchorX',
	anchorY: 'sceneTilemap-anchorY',
	offsetX: 'sceneTilemap-offsetX',
	offsetY: 'sceneTilemap-offsetY',
	parallaxFactorX: 'sceneTilemap-parallaxFactorX',
	parallaxFactorY: 'sceneTilemap-parallaxFactorY',
	opacity: 'sceneTilemap-opacity'
});
