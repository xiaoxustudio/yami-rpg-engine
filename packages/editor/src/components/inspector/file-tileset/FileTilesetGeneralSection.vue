<template>
	<DetailBox
		id="fileTileset-general-detail"
		:ref="registryRef(paletteEls, 'fileTileset-general-detail')"
		open
	>
		<DetailSummary>{{
			t('components.fileTileset-general-grid.label') || 'Tileset'
		}}</DetailSummary>
		<div class="detail-grid" id="fileTileset-general-grid">
			<div class="text">{{ t('components.fileTileset-image.label') || 'Image' }}</div>
			<CustomBox
				id="fileTileset-image"
				v-tip="t('components.fileTileset-image.tip')"
				:ref="registryRef(inspectorEls, 'fileTileset-image')"
				v-model="form.image"
				type="file"
				filter="image"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTileset-width.label') || 'Width' }}</div>
			<NumberBox
				id="fileTileset-width"
				v-tip="t('components.fileTileset-width.tip')"
				v-model="form.width"
				min="1"
				max="256"
				unit="tile"
				@change="onParamInput"
			/>
			<div class="text">{{ t('components.fileTileset-height.label') || 'Height' }}</div>
			<NumberBox
				id="fileTileset-height"
				v-tip="t('components.fileTileset-height.tip')"
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
				v-tip="t('components.fileTileset-tileWidth.tip')"
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
				v-tip="t('components.fileTileset-tileHeight.tip')"
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
				v-tip="t('components.fileTileset-globalOffsetX.tip')"
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
				v-tip="t('components.fileTileset-globalOffsetY.tip')"
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
				v-tip="t('components.fileTileset-globalPriority.tip')"
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
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { paletteEls } from '@app/palette/element-registry';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import { fileTilesetContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(fileTilesetContextKey)!;
</script>
