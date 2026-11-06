/**
 * inspector 页的 `sync` 桥总表（按页一份，模块级强类型）。
 *
 * 这些页原来用 `attachElementApi(<x>-vue-mount, { sync })` 把 `sync` 挂到页面根元素上，
 * 单例再按 id 取元素调用 —— 那是「元素 API」入口。现在页面挂载时交出、单例按页取。
 *
 * 由 `scripts/oneoff/migrate-page-sync-codemod.mjs` 生成后手工维护。
 */
import { createFormBridge } from './form-bridge';

export interface PageSyncApi {
	/** 让页面按最新数据重渲染。 */
	sync(): void;
	/** 图片页专用：重新取一次图片尺寸/预览（少量单例要）。 */
	updateImage?(): void;

	/** 页面表单真源（少数单例要读它做分支判断）。 */
	form?: Record<string, unknown>;
}

const make = (name: string) => createFormBridge<PageSyncApi>(name);

export const inspectorPageSync = {
	fileVideo: make('fileVideoPage'),
	fileTrigger: make('fileTriggerPage'),
	uiButton: make('uiButtonPage'),
	fileImage: make('fileImagePage'),
	fileAudio: make('fileAudioPage'),
	fileScript: make('fileScriptPage'),
	fileTileset: make('fileTilesetPage'),
	particleLayer: make('particleLayerPage'),
	animJointFrame: make('animJointFramePage'),
	animMotion: make('animMotionPage'),
	animParticleFrame: make('animParticleFramePage'),
	animParticleLayer: make('animParticleLayerPage'),
	animSoundFrame: make('animSoundFramePage'),
	animSoundLayer: make('animSoundLayerPage'),
	animSpriteFrame: make('animSpriteFramePage'),
	animSpriteLayer: make('animSpriteLayerPage'),
	fileEquipment: make('fileEquipmentPage'),
	fileItem: make('fileItemPage'),
	fileSkill: make('fileSkillPage'),
	fileState: make('fileStatePage'),
	fileUI: make('fileUIPage'),
	sceneActor: make('sceneActorPage'),
	sceneAnimation: make('sceneAnimationPage'),
	sceneLight: make('sceneLightPage'),
	sceneParallax: make('sceneParallaxPage'),
	sceneParticle: make('sceneParticlePage'),
	sceneRegion: make('sceneRegionPage'),
	sceneTilemap: make('sceneTilemapPage'),
	uiAnimation: make('uiAnimationPage'),
	uiImage: make('uiImagePage'),
	uiReference: make('uiReferencePage'),
	uiTextBox: make('uiTextBoxPage'),
	uiVideo: make('uiVideoPage'),
	uiWindow: make('uiWindowPage')
};

/** 键名 → id（排查用）。 */
export const inspectorPageSyncIds = {
	fileTrigger: 'fileTriggerPage',
	uiButton: 'uiButtonPage',
	fileImage: 'fileImagePage',
	fileAudio: 'fileAudioPage',
	fileScript: 'fileScriptPage',
	fileTileset: 'fileTilesetPage',
	particleLayer: 'particleLayerPage',
	animJointFrame: 'animJointFrame',
	animMotion: 'animMotion',
	animParticleFrame: 'animParticleFrame',
	animParticleLayer: 'animParticleLayer',
	animSoundFrame: 'animSoundFrame',
	animSoundLayer: 'animSoundLayer',
	animSpriteFrame: 'animSpriteFrame',
	animSpriteLayer: 'animSpriteLayer',
	fileEquipment: 'fileEquipment',
	fileItem: 'fileItem',
	fileSkill: 'fileSkill',
	fileState: 'fileState',
	fileUI: 'fileUI',
	sceneActor: 'sceneActor',
	sceneAnimation: 'sceneAnimation',
	sceneLight: 'sceneLight',
	sceneParallax: 'sceneParallax',
	sceneParticle: 'sceneParticle',
	sceneRegion: 'sceneRegion',
	sceneTilemap: 'sceneTilemap',
	uiAnimation: 'uiAnimation',
	uiImage: 'uiImage',
	uiReference: 'uiReference',
	uiTextBox: 'uiTextBox',
	uiVideo: 'uiVideo',
	uiWindow: 'uiWindow'
};
