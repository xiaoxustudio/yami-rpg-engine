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
