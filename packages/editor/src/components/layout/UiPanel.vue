<template>
	<div class="page-frame" id="ui" :ref="registryRef(uiEls, 'ui')" value="ui">
		<div
			class="box"
			id="ui-head"
			:ref="registryRef(uiEls, 'ui-head')"
			@pointerdown="onUiHeadPointerdown"
		>
			<div class="box" id="ui-head-start" @pointerdown="onUiSwitchPointerdown">
				<div
					class="item toolbar-item"
					id="ui-switch-settings"
					v-tip="t('components.ui-switch-settings.tip')"
					:ref="registryRef(inspectorEls, 'ui-switch-settings')"
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
					:ref="registryRef(engineEls, 'ui-zoom')"
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
		<div class="box" id="ui-body" :ref="registryRef(uiEls, 'ui-body')">
			<div
				class="box"
				id="ui-screen"
				:ref="registryRef(uiEls, 'ui-screen')"
				tabindex="-1"
				@keydown="onUiScreenKeydown"
				@wheel="onUiScreenWheel"
			>
				<MarqueeArea
					id="ui-marquee"
					:ref="registryRef(uiEls, 'ui-marquee')"
					@pointerdown="onUiMarqueePointerdown"
					@doubleclick="onUiMarqueeDoubleclick"
				></MarqueeArea>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { uiEls } from '@app/engine/ui/element-registry';
import { engineEls } from '@app/engine/element-registry';
import { inspectorEls } from '@app/inspector/element-registry';
import { registryRef } from '@app/utils/element-registry';
// `UI.requestRendering?.()` 改为直连引擎。原 `?.` 守的是「UI 窗口还没加载」，
// 而 `requestRendering` 内部第一行就是 `getUIStore().state === 'open'`，该状态只在 UI 窗口的
// 方法体里（`ui-file.ts:29`）被置为 open ⇒ 窗口没加载时 state 必不为 open，内部同样直接返回。
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
	// 第 234 轮：这里原先写 `UI?.setZoom?.(value)`，而 `UI.setZoom` **运行期不存在**
	// （`ui-window.ts` 的 21 行镜像在第 114 轮退役）⇒ 缩放框的输入其实是个**静默 no-op**。
	// 改成直连引擎（本文件 `:1624` 的 `UIEngine.requestRendering!.call(UI)` 就是同一写法，
	// `engine/ui/ui-events.ts:174` 的 `zoomInput` 也是这么调的），接收者仍是 `UI`。
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
</script>
