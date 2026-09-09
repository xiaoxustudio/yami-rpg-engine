<template>
	<div class="box" id="palette-head" @pointerdown="onHeadPointerdown">
		<div class="box" id="palette-head-start" @pointerdown="onToolbarPointerdown">
			<div
				id="palette-scroll"
				class="item toolbar-item"
				value="scroll"
				:class="{ selected: palette.scrollable }"
			></div>
			<div
				id="palette-priority"
				class="item toolbar-item"
				value="priority"
				:class="{ selected: palette.mode === 'priority' }"
			></div>
			<div
				id="palette-tag"
				class="item toolbar-item"
				value="tag"
				:class="{ selected: palette.mode === 'tag' }"
			></div>
			<div
				id="palette-terrain"
				class="item toolbar-item"
				value="terrain"
				:class="{ selected: palette.mode === 'terrain' }"
			></div>
			<div
				id="palette-edit"
				class="item toolbar-item"
				value="edit"
				:class="{ selected: palette.mode === 'edit' }"
			></div>
			<div id="palette-flip" class="item toolbar-item" value="flip" hotkey="F"></div>
		</div>
		<SliderBox
			id="palette-zoom"
			name="zoom"
			min="0"
			max="4"
			hotkey="-/+"
			@input="onZoomInput"
			@focus="onZoomFocus"
		/>
	</div>
	<div class="box" id="palette-body">
		<div class="box" id="palette-frame">
			<canvas id="palette-canvas" width="0" height="0"></canvas>
			<div
				class="box"
				id="palette-screen"
				tabindex="-1"
				@keydown="onScreenKeydown"
				@wheel="onScreenWheel"
			>
				<MarqueeArea
					id="palette-marquee"
					@pointerdown="onMarqueePointerdown"
					@doubleclick="onMarqueeDoubleclick"
				></MarqueeArea>
			</div>
		</div>
		<div class="text" id="palette-info">{{ paletteInfo }}</div>
	</div>
	<DetailBox id="fileTileset-general-detail" open>
		<DetailSummary>{{
			t('components.fileTileset-general-grid.label') || 'Tileset'
		}}</DetailSummary>
		<div class="detail-grid" id="fileTileset-general-grid">
			<div class="text">{{ t('components.fileTileset-image.label') || 'Image' }}</div>
			<CustomBox
				id="fileTileset-image"
				v-model="form.image"
				type="file"
				filter="image"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTileset-width.label') || 'Width' }}</div>
			<NumberBox
				id="fileTileset-width"
				v-model="form.width"
				min="1"
				max="256"
				unit="tile"
				@change="onParamInput"
			/>
			<div class="text">{{ t('components.fileTileset-height.label') || 'Height' }}</div>
			<NumberBox
				id="fileTileset-height"
				v-model="form.height"
				min="1"
				max="256"
				unit="tile"
				@change="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTileset-tileWidth.label') || 'Tile Width' }}
			</div>
			<NumberBox
				id="fileTileset-tileWidth"
				v-model="form.tileWidth"
				min="16"
				max="256"
				unit="px"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTileset-tileHeight.label') || 'Tile Height' }}
			</div>
			<NumberBox
				id="fileTileset-tileHeight"
				v-model="form.tileHeight"
				min="16"
				max="256"
				unit="px"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTileset-globalOffsetX.label') || 'Tile Offset X' }}
			</div>
			<NumberBox
				id="fileTileset-globalOffsetX"
				v-model="form.globalOffsetX"
				min="-256"
				max="256"
				unit="px"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTileset-globalOffsetY.label') || 'Tile Offset Y' }}
			</div>
			<NumberBox
				id="fileTileset-globalOffsetY"
				v-model="form.globalOffsetY"
				min="-256"
				max="256"
				unit="px"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileTileset-globalPriority.label') || 'Tile Priority' }}
			</div>
			<NumberBox
				id="fileTileset-globalPriority"
				v-model="form.globalPriority"
				min="-10"
				max="10"
				decimals="4"
				@input="onParamInput"
			/>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import '@app/inspector/file-tileset-page.ts';
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { focus } from '@app/utils/element-utils';
import { Palette } from '@app/palette/palette.ts';
import { useFileTilesetPage } from '@app/composables/useFileTilesetPage';
import { usePaletteStore } from '@app/stores/palette';
import { attachElementApi } from '@app/utils/attach-element-api';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const { t } = useI18n();
const palette = usePaletteStore();

	const { form, sync, onParamInput: onParamInputEvent } = useFileTilesetPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

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

	const el = document.getElementById('fileTileset');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>

<style>
/* 样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#palette-head {
	display: flex;
	position: absolute;
	justify-content: space-between;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#palette-head-start {
	display: flex;
	flex: 0 0 auto;
	/* background-color: green; */
}

#palette-zoom {
	flex: 0 0 auto;
	margin: 2px 4px;
	width: 80px;
	/* background-color: green; */
}

#palette-body {
	flex-grow: 1;
	display: block;
	position: relative;
	width: 100%;
	overflow: hidden;
}

#palette-canvas {
	position: absolute;
	background-image: var(--grid-background);
	background-size: var(--16dpx);
	outline: var(--window-outline);
}

#palette-screen {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

#palette-info {
	position: absolute;
	left: 0;
	top: 0;
	padding: 0 4px;
	line-height: 20px;
	color: white;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	text-shadow: var(--stage-info-text-shadow);
	pointer-events: none;
}
</style>

