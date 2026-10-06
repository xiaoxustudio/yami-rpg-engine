<template>
	<div
		class="box"
		id="palette-head"
		:ref="registryRef(paletteEls, 'palette-head')"
		@pointerdown="onHeadPointerdown"
	>
		<div class="box" id="palette-head-start" @pointerdown="onToolbarPointerdown">
			<div
				id="palette-scroll"
				v-tip="t('components.palette-scroll.tip')"
				:ref="registryRef(paletteEls, 'palette-scroll')"
				class="item toolbar-item"
				value="scroll"
				:class="{ selected: palette.scrollable }"
			></div>
			<div
				id="palette-priority"
				v-tip="t('components.palette-priority.tip')"
				:ref="registryRef(paletteEls, 'palette-priority')"
				class="item toolbar-item"
				value="priority"
				:class="{ selected: palette.mode === 'priority' }"
			></div>
			<div
				id="palette-tag"
				v-tip="t('components.palette-tag.tip')"
				:ref="registryRef(paletteEls, 'palette-tag')"
				class="item toolbar-item"
				value="tag"
				:class="{ selected: palette.mode === 'tag' }"
			></div>
			<div
				id="palette-terrain"
				v-tip="t('components.palette-terrain.tip')"
				:ref="registryRef(paletteEls, 'palette-terrain')"
				class="item toolbar-item"
				value="terrain"
				:class="{ selected: palette.mode === 'terrain' }"
			></div>
			<div
				id="palette-edit"
				v-tip="t('components.palette-edit.tip')"
				:ref="registryRef(paletteEls, 'palette-edit')"
				class="item toolbar-item"
				value="edit"
				:class="{ selected: palette.mode === 'edit' }"
			></div>
			<div
				id="palette-flip"
				v-tip="t('components.palette-flip.tip')"
				class="item toolbar-item"
				value="flip"
				hotkey="F"
			></div>
		</div>
		<SliderBox
			id="palette-zoom"
			:ref="registryRef(paletteEls, 'palette-zoom')"
			name="zoom"
			min="0"
			max="4"
			hotkey="-/+"
			@input="onZoomInput"
			@focus="onZoomFocus"
		/>
	</div>
	<div class="box" id="palette-body" :ref="registryRef(paletteEls, 'palette-body')">
		<div class="box" id="palette-frame" :ref="registryRef(paletteEls, 'palette-frame')">
			<canvas
				id="palette-canvas"
				:ref="registryRef(paletteEls, 'palette-canvas')"
				width="0"
				height="0"
			></canvas>
			<div
				class="box"
				id="palette-screen"
				:ref="registryRef(paletteEls, 'palette-screen')"
				tabindex="-1"
				@keydown="onScreenKeydown"
				@wheel="onScreenWheel"
			>
				<MarqueeArea
					id="palette-marquee"
					:ref="registryRef(paletteEls, 'palette-marquee')"
					@pointerdown="onMarqueePointerdown"
					@doubleclick="onMarqueeDoubleclick"
				></MarqueeArea>
			</div>
		</div>
		<div class="text" id="palette-info">{{ paletteInfo }}</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { paletteEls } from '@app/palette/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { focus } from '@app/utils/element-utils';
import { Palette } from '@app/palette/palette.ts';
import { usePaletteStore } from '@app/stores/palette';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const { t } = useI18n();
const palette = getPaletteStore();

const onHeadPointerdown = (event: PointerEvent) => {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		const P = Palette;
		if (P?.screen && document.activeElement !== P.screen) {
			focus(P.screen);
		}
	}
};

const onToolbarPointerdown = (event: PointerEvent) => {
	if (event.button !== 0) return;
	const element = event.target as HTMLElement;
	const P = Palette;
	if (!P || !element.classList.contains('item')) return;
	switch (element.getAttribute('value')) {
		case 'scroll':
			return P.switchScroll();
		case 'priority':
			return P.switchPriority();
		case 'tag':
			return P.switchTag();
		case 'terrain':
			return P.switchTerrain();
		case 'edit':
			if (P.tileset?.type === 'auto') {
				return P.switchEdit();
			}
			return;
		case 'flip':
			return P.flipTiles();
	}
};

const onZoomInput = (value: number) => {
	Palette?.setZoom?.(value);
};

const onZoomFocus = () => {
	const P = Palette;
	if (P?.screen) focus(P.screen);
};

const onScreenKeydown = (event: KeyboardEvent) => {
	Palette?.screenKeydown?.(event);
};

const onScreenWheel = (event: WheelEvent) => {
	Palette?.screenWheel?.(event);
};

const onMarqueePointerdown = (event: PointerEvent) => {
	Palette?.marqueePointerdown?.(event);
};

const onMarqueeDoubleclick = (event: PointerEvent) => {
	Palette?.marqueeDoubleclick?.(event);
};

const paletteInfo = computed(() => {
	const tileset = palette.tileset;
	const index = palette.activeIndex;
	if (!tileset || index === null || index === undefined) return '';
	if (index < 0 || index >= tileset.tags.length) return '';
	const x = index % tileset.width;
	const y = (index / tileset.width) | 0;
	return `${x},${y} tag:${tileset.tags[index]}`;
});

onMounted(() => {
	palette.initialize();
});
</script>
