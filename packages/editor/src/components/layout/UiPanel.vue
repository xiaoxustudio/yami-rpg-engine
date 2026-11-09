<template>
	<div class="page-frame" id="ui" :ref="bind('page')" value="ui">
		<div class="box" id="ui-head" ref="headEl" @pointerdown="onUiHeadPointerdown">
			<div class="box" id="ui-head-start" @pointerdown="onUiSwitchPointerdown">
				<div
					class="item toolbar-item"
					id="ui-switch-settings"
					v-tip="t('components.ui-switch-settings.tip')"
					:ref="bind('switchSettings')"
					value="settings"
				></div>
			</div>
			<div class="box" id="ui-head-center" @pointerdown="onUiShortcutPointerdown">
				<div
					class="item toolbar-item"
					id="ui-element-image"
					v-tip="t('components.ui-element-image.tip')"
					value="image"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-text"
					v-tip="t('components.ui-element-text.tip')"
					value="text"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-textbox"
					v-tip="t('components.ui-element-textbox.tip')"
					value="textbox"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-dialogbox"
					v-tip="t('components.ui-element-dialogbox.tip')"
					value="dialogbox"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-progressbar"
					v-tip="t('components.ui-element-progressbar.tip')"
					value="progressbar"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-button"
					v-tip="t('components.ui-element-button.tip')"
					value="button"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-animation"
					v-tip="t('components.ui-element-animation.tip')"
					value="animation"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-video"
					v-tip="t('components.ui-element-video.tip')"
					value="video"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-window"
					v-tip="t('components.ui-element-window.tip')"
					value="window"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-container"
					v-tip="t('components.ui-element-container.tip')"
					value="container"
				></div>
				<div
					class="item toolbar-item"
					id="ui-element-reference"
					v-tip="t('components.ui-element-reference.tip')"
					value="reference"
				></div>
			</div>
			<div class="box" id="ui-head-end">
				<SliderBox
					id="ui-zoom"
					:ref="bind('zoom')"
					name="zoom"
					min="0"
					max="4"
					hotkey="-/+"
					active-wheel
					@input="onUiZoomInput"
					@focus="onUiZoomFocus"
				></SliderBox>
			</div>
		</div>
		<div class="box" id="ui-body" ref="bodyEl">
			<div
				class="box"
				id="ui-screen"
				:ref="bind('screen')"
				tabindex="-1"
				@keydown="onUiScreenKeydown"
				@wheel="onUiScreenWheel"
			>
				<MarqueeArea
					id="ui-marquee"
					:ref="bind('marquee')"
					@pointerdown="onUiMarqueePointerdown"
					@doubleclick="onUiMarqueeDoubleclick"
				></MarqueeArea>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { uiNodes } from '@app/composables/ui-nodes';
import { clearUiNode, setUiNode } from '@app/composables/ui-nodes';
import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import SliderBox from '@app/components/common/SliderBox.vue';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import { getLazyWindow } from '@app/tools/window-registry';

const { t } = useI18n();

const UI = getLazyWindow('ui', () => import('@app/engine/ui/ui-singleton.ts').then((m) => m.UI));

const onUiHeadPointerdown = (event: PointerEvent) => {
	UI?.headPointerdown?.(event);
};
const onUiSwitchPointerdown = (event: PointerEvent) => {
	UI?.switchPointerdown?.(event);
};
const onUiShortcutPointerdown = (event: PointerEvent) => {
	UI?.shortcutPointerdown?.(event);
};
const onUiZoomInput = (value: number) => {
	UIEngine.setZoom!.call(UI, value);
};
const onUiZoomFocus = () => {
	UI?.zoomFocus?.();
};
const onUiScreenKeydown = (event: KeyboardEvent) => {
	UI?.screenKeydown?.(event);
};
const onUiScreenWheel = (event: WheelEvent) => {
	UI?.screenWheel?.(event);
};
const onUiMarqueePointerdown = (event: PointerEvent) => {
	UI?.marqueePointerdown?.(event);
};
const onUiMarqueeDoubleclick = (event: PointerEvent) => {
	UI?.marqueeDoubleclick?.(event);
};
const { bind, dispose } = uiNodes.scoped();
const headEl = ref<HTMLElement | null>(null);
const bodyEl = ref<HTMLElement | null>(null);

onMounted(() => {
	setUiNode('head', headEl.value);
	setUiNode('body', bodyEl.value);
	onUnmounted(() => {
		dispose();
		clearUiNode('head', headEl.value);
		clearUiNode('body', bodyEl.value);
	});
});
</script>
