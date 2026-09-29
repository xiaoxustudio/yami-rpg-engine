<template>
	<div class="page-frame" id="scene" :ref="registryRef(sceneEls, 'scene')" value="scene">
		<div
			class="box"
			id="scene-head"
			:ref="registryRef(sceneEls, 'scene-head')"
			@pointerdown="onSceneHeadPointerdown"
		>
			<div class="box" id="scene-head-start" @pointerdown="onSceneSwitchPointerdown">
				<div
					class="item toolbar-item"
					id="scene-switch-grid"
					v-tip="t('components.scene-switch-grid.tip')"
					:ref="registryRef(sceneEls, 'scene-switch-grid')"
					value="grid"
				></div>
				<div
					class="item toolbar-item"
					id="scene-switch-light"
					v-tip="t('components.scene-switch-light.tip')"
					:ref="registryRef(sceneEls, 'scene-switch-light')"
					value="light"
				></div>
				<div
					class="item toolbar-item"
					id="scene-switch-animation"
					v-tip="t('components.scene-switch-animation.tip')"
					:ref="registryRef(sceneEls, 'scene-switch-animation')"
					value="animation"
				></div>
				<div
					class="item toolbar-item"
					id="scene-switch-settings"
					v-tip="t('components.scene-switch-settings.tip')"
					:ref="registryRef(inspectorEls, 'scene-switch-settings')"
					value="settings"
					hotkey="Alt+S"
				></div>
			</div>
			<div class="box" id="scene-head-center">
				<div
					class="box"
					id="scene-layer"
					:ref="registryRef(sceneEls, 'scene-layer')"
					@pointerdown="onSceneLayerPointerdown"
				>
					<div
						class="item toolbar-item"
						id="scene-layer-object"
						v-tip="t('components.scene-layer-object.tip')"
						value="object"
						hotkey="`"
					></div>
					<div
						class="item toolbar-item hidden"
						id="scene-layer-tilemap-1"
						:ref="registryRef(sceneEls, 'scene-layer-tilemap-1')"
						value="1"
						hotkey="1"
					></div>
					<div
						class="item toolbar-item hidden"
						id="scene-layer-tilemap-2"
						:ref="registryRef(sceneEls, 'scene-layer-tilemap-2')"
						value="2"
						hotkey="2"
					></div>
					<div
						class="item toolbar-item hidden"
						id="scene-layer-tilemap-3"
						:ref="registryRef(sceneEls, 'scene-layer-tilemap-3')"
						value="3"
						hotkey="3"
					></div>
					<div
						class="item toolbar-item hidden"
						id="scene-layer-tilemap-4"
						:ref="registryRef(sceneEls, 'scene-layer-tilemap-4')"
						value="4"
						hotkey="4"
					></div>
					<div
						class="item toolbar-item hidden"
						id="scene-layer-tilemap-5"
						:ref="registryRef(sceneEls, 'scene-layer-tilemap-5')"
						value="5"
						hotkey="5"
					></div>
					<div
						class="item toolbar-item hidden"
						id="scene-layer-tilemap-6"
						:ref="registryRef(sceneEls, 'scene-layer-tilemap-6')"
						value="6"
						hotkey="6"
					></div>
					<div
						class="item toolbar-item"
						id="scene-layer-terrain"
						v-tip="t('components.scene-layer-terrain.tip')"
						value="terrain"
						hotkey="`"
					></div>
				</div>
				<div
					class="box"
					id="scene-brush"
					:ref="registryRef(sceneEls, 'scene-brush')"
					@pointerdown="onSceneBrushPointerdown"
				>
					<div
						class="item toolbar-item"
						id="scene-brush-eraser"
						v-tip="t('components.scene-brush-eraser.tip')"
						value="eraser"
						hotkey="Q"
					></div>
					<div
						class="item toolbar-item"
						id="scene-brush-pencil"
						v-tip="t('components.scene-brush-pencil.tip')"
						value="pencil"
						hotkey="E"
					></div>
					<div
						class="item toolbar-item"
						id="scene-brush-rect"
						v-tip="t('components.scene-brush-rect.tip')"
						value="rect"
						hotkey="R"
					></div>
					<div
						class="item toolbar-item"
						id="scene-brush-oval"
						v-tip="t('components.scene-brush-oval.tip')"
						value="oval"
						hotkey="T"
					></div>
					<div
						class="item toolbar-item"
						id="scene-brush-fill"
						v-tip="t('components.scene-brush-fill.tip')"
						value="fill"
						hotkey="Y"
					></div>
				</div>
			</div>
			<div class="box" id="scene-head-end">
				<SliderBox
					id="scene-zoom"
					:ref="registryRef(sceneEls, 'scene-zoom')"
					name="zoom"
					min="0"
					max="4"
					hotkey="-/+"
					active-wheel
					@input="onSceneZoomInput"
					@focus="onSceneZoomFocus"
				></SliderBox>
			</div>
		</div>
		<div class="box" id="scene-body" :ref="registryRef(sceneEls, 'scene-body')">
			<div
				class="box"
				id="scene-screen"
				:ref="registryRef(sceneEls, 'scene-screen')"
				tabindex="-1"
				@keydown="onSceneScreenKeydown"
				@wheel="onSceneScreenWheel"
			>
				<MarqueeArea
					id="scene-marquee"
					:ref="registryRef(sceneEls, 'scene-marquee')"
					@pointerdown="onSceneMarqueePointerdown"
					@doubleclick="onSceneMarqueeDoubleclick"
				></MarqueeArea>
			</div>
			<div class="text" id="scene-info" :ref="registryRef(sceneEls, 'scene-info')"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { sceneEls } from '@app/scene/element-registry';
import { inspectorEls } from '@app/inspector/element-registry';
import { registryRef } from '@app/utils/element-registry';
import SliderBox from '@app/components/common/SliderBox.vue';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import { getLazyWindow } from '@app/tools/window-registry';

const { t } = useI18n();

const loadCluster = () => import('@app/tools/window-cluster');
const Scene = getLazyWindow('scene', () => loadCluster().then((m) => m.Scene));

const onSceneHeadPointerdown = (event: PointerEvent) => {
	Scene?.headPointerdown?.(event);
};
const onSceneSwitchPointerdown = (event: PointerEvent) => {
	Scene?.switchPointerdown?.(event);
};
const onSceneLayerPointerdown = (event: PointerEvent) => {
	Scene?.layerPointerdown?.(event);
};
const onSceneBrushPointerdown = (event: PointerEvent) => {
	Scene?.brushPointerdown?.(event);
};
const onSceneZoomInput = (value: number) => {
	Scene?.setZoom?.(value);
};
const onSceneZoomFocus = () => {
	Scene?.zoomFocus?.();
};
const onSceneScreenKeydown = (event: KeyboardEvent) => {
	Scene?.screenKeydown?.(event);
};
const onSceneScreenWheel = (event: WheelEvent) => {
	Scene?.screenWheel?.(event);
};
const onSceneMarqueePointerdown = (event: PointerEvent) => {
	Scene?.marqueePointerdown?.(event);
};
const onSceneMarqueeDoubleclick = (event: PointerEvent) => {
	Scene?.marqueeDoubleclick?.(event);
};
</script>
