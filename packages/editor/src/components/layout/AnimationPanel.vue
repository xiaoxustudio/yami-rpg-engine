<template>
	<div
		class="page-frame"
		id="animation"
		:ref="registryRef(animationEls, 'animation')"
		value="animation"
	>
		<div
			class="box"
			id="animation-head"
			:ref="registryRef(animationEls, 'animation-head')"
			@pointerdown="onAnimationHeadPointerdown"
		>
			<div class="box" id="animation-head-start" @pointerdown="onAnimationSwitchPointerdown">
				<div
					class="item toolbar-item"
					id="animation-switch-mark"
					v-tip="t('components.animation-switch-mark.tip')"
					value="mark"
					:class="{ selected: animation.showMark }"
				></div>
				<div
					class="item toolbar-item"
					id="animation-switch-onionskin"
					v-tip="t('components.animation-switch-onionskin.tip')"
					value="onionskin"
					hotkey="O"
					:class="{ selected: animation.showOnionskin }"
				></div>
				<div
					class="item toolbar-item"
					id="animation-switch-mirror"
					v-tip="t('components.animation-switch-mirror.tip')"
					value="mirror"
					hotkey="M"
					:class="{ selected: animation.mirror }"
				></div>
				<div
					class="item toolbar-item"
					id="animation-switch-settings"
					v-tip="t('components.animation-switch-settings.tip')"
					:ref="registryRef(inspectorEls, 'animation-switch-settings')"
					value="settings"
				></div>
			</div>
			<div class="box" id="animation-head-center">
				<NumberBox
					id="animation-speed"
					v-tip="t('components.animation-speed.tip')"
					min="0"
					max="4"
					step="0.05"
					decimals="2"
					v-model="speedModel"
					><div class="text label">speed:</div></NumberBox
				>
			</div>
			<div class="box" id="animation-head-end">
				<SliderBox
					id="animation-zoom"
					name="zoom-0-6"
					min="0"
					max="6"
					hotkey="-/+"
					active-wheel
					v-model="zoomModel"
					@focus="onAnimationZoomFocus"
				></SliderBox>
			</div>
		</div>
		<div class="box" id="animation-body" :ref="registryRef(animationEls, 'animation-body')">
			<div
				class="box"
				id="animation-screen"
				:ref="registryRef(animationEls, 'animation-screen')"
				tabindex="-1"
				@keydown="onAnimationScreenKeydown"
				@wheel="onAnimationScreenWheel"
			>
				<MarqueeArea
					id="animation-marquee"
					:ref="registryRef(animationEls, 'animation-marquee')"
					@pointerdown="onAnimationMarqueePointerdown"
					@doubleclick="onAnimationMarqueeDoubleclick"
				></MarqueeArea>
			</div>
			<div ref="dirListEl" class="box" id="animation-dirList" v-show="dirs.length > 1">
				<div
					class="anim-dir"
					v-for="(dir, index) in dirs"
					:key="index"
					:class="{ selected: index === direction }"
					@pointerdown="onDirPointerdown(index)"
				>
					{{ dir }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref } from 'vue';
import { animationEls } from '@app/animation/element-registry';
import { inspectorEls } from '@app/inspector/element-registry';
import { registerElement, registryRef } from '@app/utils/element-registry';
import { attachElementApi } from '@app/utils/attach-element-api';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import { getLazyWindow } from '@app/tools/window-registry';
import { getAnimationStore } from '@app/stores/animation';

const { t } = useI18n();

const loadCluster = () => import('@app/tools/window-cluster');
const Animation = getLazyWindow('animation', () => loadCluster().then((m) => m.Animation));
const Inspector = getLazyWindow('inspector', () => loadCluster().then((m) => m.Inspector));

const dirs = ref<string[]>([]);
const direction = ref(-1);
const dirListEl = ref<HTMLElement | null>(null);

const animation = getAnimationStore();

const speedModel = computed<number>({
	get: () => animation.speed ?? 0,
	set: (value: number) => {
		animation.setSpeed(value);
	}
});

const zoomModel = computed<number>({
	get: () => animation.zoom ?? 0,
	set: (value: number) => {
		animation.setZoom(value);
	}
});

const setDirItems = (items: string[], selected: number): void => {
	dirs.value = items;
	direction.value = selected;
};

const setDirDirection = (selected: number): void => {
	direction.value = selected;
};

const onDirPointerdown = (index: number): void => {
	if (index === direction.value) return;
	Animation?.setDirection?.(index);
	Inspector?.close?.();
};

onMounted(() => {
	registerElement(animationEls, 'animation-dirList', dirListEl.value);
	const el = dirListEl.value;
	if (!el) return;
	attachElementApi(el, { setDirItems, setDirDirection });
});

const onAnimationHeadPointerdown = (event: PointerEvent) => {
	Animation?.headPointerdown?.(event);
};
const onAnimationSwitchPointerdown = (event: PointerEvent) => {
	Animation?.switchPointerdown?.(event);
};
const onAnimationZoomFocus = () => {
	Animation?.zoomFocus?.();
};
const onAnimationScreenKeydown = (event: KeyboardEvent) => {
	Animation?.screenKeydown?.(event);
};
const onAnimationScreenWheel = (event: WheelEvent) => {
	Animation?.screenWheel?.(event);
};
const onAnimationMarqueePointerdown = (event: PointerEvent) => {
	Animation?.marqueePointerdown?.(event);
};
const onAnimationMarqueeDoubleclick = (event: PointerEvent) => {
	Animation?.marqueeDoubleclick?.(event);
};
</script>
