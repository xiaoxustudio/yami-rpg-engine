<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScene-general-grid.label') || 'Scene' }}</DetailSummary>
		<div class="detail-grid" id="fileScene-general-grid">
			<div class="text">{{ t('components.fileScene-width.label') || 'Width' }}</div>
			<NumberBox
				:label="t('components.fileScene-width.label') || 'Width'"
				id="fileScene-width"
				v-tip="t('components.fileScene-width.tip')"
				v-model="form.width"
				min="0"
				max="512"
				unit="tile"
				@change="onParamInput"
			/>
			<div class="text">{{ t('components.fileScene-height.label') || 'Height' }}</div>
			<NumberBox
				:label="t('components.fileScene-height.label') || 'Height'"
				id="fileScene-height"
				v-tip="t('components.fileScene-height.tip')"
				v-model="form.height"
				min="0"
				max="512"
				unit="tile"
				@change="onParamInput"
			/>
			<div class="text">{{ t('components.fileScene-tileWidth.label') || 'Tile Width' }}</div>
			<NumberBox
				:label="t('components.fileScene-tileWidth.label') || 'Tile Width'"
				id="fileScene-tileWidth"
				ref="elTileWidth"
				v-tip="t('components.fileScene-tileWidth.tip')"
				v-model="form.tileWidth"
				@input="onParamInput"
				min="16"
				max="256"
				unit="px"
			/>
			<div class="text">
				{{ t('components.fileScene-tileHeight.label') || 'Tile Height' }}
			</div>
			<NumberBox
				:label="t('components.fileScene-tileHeight.label') || 'Tile Height'"
				id="fileScene-tileHeight"
				ref="elTileHeight"
				v-tip="t('components.fileScene-tileHeight.tip')"
				v-model="form.tileHeight"
				@input="onParamInput"
				min="16"
				max="256"
				unit="px"
			/>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileScene-ambient-grid.label') || 'Ambient Light'
		}}</DetailSummary>
		<div class="detail-grid" id="fileScene-ambient-grid">
			<div class="text">{{ t('components.fileScene-ambient-red-box.label') || 'Red' }}</div>
			<div
				class="flex-box"
				id="fileScene-ambient-red-box"
				v-tip="t('components.fileScene-ambient-red-box.tip')"
			>
				<SliderBox
					id="fileScene-ambient-red-slider"
					ref="elAmbientRedSlider"
					v-model="form.ambientRed"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					:label="t('components.fileScene-ambient-red-box.label') || 'Red'"
					id="fileScene-ambient-red"
					ref="elAmbientRed"
					v-model="form.ambientRed"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				/>
			</div>
			<div class="text">
				{{ t('components.fileScene-ambient-green-box.label') || 'Green' }}
			</div>
			<div
				class="flex-box"
				id="fileScene-ambient-green-box"
				v-tip="t('components.fileScene-ambient-green-box.tip')"
			>
				<SliderBox
					id="fileScene-ambient-green-slider"
					ref="elAmbientGreenSlider"
					v-model="form.ambientGreen"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					:label="t('components.fileScene-ambient-green-box.label') || 'Green'"
					id="fileScene-ambient-green"
					ref="elAmbientGreen"
					v-model="form.ambientGreen"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				/>
			</div>
			<div class="text">{{ t('components.fileScene-ambient-blue-box.label') || 'Blue' }}</div>
			<div
				class="flex-box"
				id="fileScene-ambient-blue-box"
				v-tip="t('components.fileScene-ambient-blue-box.tip')"
			>
				<SliderBox
					id="fileScene-ambient-blue-slider"
					ref="elAmbientBlueSlider"
					v-model="form.ambientBlue"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					:label="t('components.fileScene-ambient-blue-box.label') || 'Blue'"
					id="fileScene-ambient-blue"
					ref="elAmbientBlue"
					v-model="form.ambientBlue"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				/>
			</div>
			<div class="text">
				{{ t('components.fileScene-ambient-direct-box.label') || 'Direct Light Ratio' }}
			</div>
			<div
				class="flex-box"
				id="fileScene-ambient-direct-box"
				v-tip="t('components.fileScene-ambient-direct-box.tip')"
			>
				<SliderBox
					id="fileScene-ambient-direct-slider"
					ref="elAmbientDirectSlider"
					v-model="form.ambientDirect"
					min="0"
					max="1"
					step="0.05"
				/>
				<NumberBox
					:label="
						t('components.fileScene-ambient-direct-box.label') || 'Direct Light Ratio'
					"
					id="fileScene-ambient-direct"
					ref="elAmbientDirect"
					v-model="form.ambientDirect"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				/>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	FILE_SCENE_CONTROLS_KEY,
	type FileSceneControls
} from '@app/composables/file-scene-page-bridge';
import { toControl } from '@app/composables/control-refs';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { fileSceneContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(fileSceneContextKey)!;
/** 页面建的控件表：本 section 把自己那一半填进去。 */
const controls = inject<FileSceneControls>(FILE_SCENE_CONTROLS_KEY, {});

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elTileWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elTileHeight = ref<InstanceType<typeof NumberBox> | null>(null);
const elAmbientRedSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAmbientRed = ref<InstanceType<typeof NumberBox> | null>(null);
const elAmbientGreenSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAmbientGreen = ref<InstanceType<typeof NumberBox> | null>(null);
const elAmbientBlueSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAmbientBlue = ref<InstanceType<typeof NumberBox> | null>(null);
const elAmbientDirectSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAmbientDirect = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	controls['fileScene-tileWidth'] = toControl(elTileWidth.value);
	controls['fileScene-tileHeight'] = toControl(elTileHeight.value);
	controls['fileScene-ambient-red'] = toControl(elAmbientRed.value);
	controls['fileScene-ambient-green'] = toControl(elAmbientGreen.value);
	controls['fileScene-ambient-blue'] = toControl(elAmbientBlue.value);
	controls['fileScene-ambient-direct'] = toControl(elAmbientDirect.value);
	controls['fileScene-ambient-red-slider'] = toControl(elAmbientRedSlider.value);
	controls['fileScene-ambient-green-slider'] = toControl(elAmbientGreenSlider.value);
	controls['fileScene-ambient-blue-slider'] = toControl(elAmbientBlueSlider.value);
	controls['fileScene-ambient-direct-slider'] = toControl(elAmbientDirectSlider.value);
	controls['fileScene-tileWidth'] = toControl(elTileWidth.value);
	elAmbientRedSlider.value?.synchronize(elAmbientRed.value?.root as SyncTarget);
	elAmbientGreenSlider.value?.synchronize(elAmbientGreen.value?.root as SyncTarget);
	elAmbientBlueSlider.value?.synchronize(elAmbientBlue.value?.root as SyncTarget);
	elAmbientDirectSlider.value?.synchronize(elAmbientDirect.value?.root as SyncTarget);
});
</script>
