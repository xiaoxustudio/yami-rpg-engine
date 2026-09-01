<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScene-general-grid.label') || 'Scene' }}</DetailSummary>
		<div class="detail-grid" id="fileScene-general-grid">
			<div class="text">{{ t('components.fileScene-width.label') || 'Width' }}</div>
			<NumberBox
				id="fileScene-width"
				v-model="form.width"
				min="0"
				max="512"
				unit="tile"
				@change="onParamInput"
			/>
			<div class="text">{{ t('components.fileScene-height.label') || 'Height' }}</div>
			<NumberBox
				id="fileScene-height"
				v-model="form.height"
				min="0"
				max="512"
				unit="tile"
				@change="onParamInput"
			/>
			<div class="text">{{ t('components.fileScene-tileWidth.label') || 'Tile Width' }}</div>
			<NumberBox
				id="fileScene-tileWidth"
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
				id="fileScene-tileHeight"
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
			<div class="flex-box" id="fileScene-ambient-red-box">
				<SliderBox
					id="fileScene-ambient-red-slider"
					ref="elAmbientRedSlider"
					v-model="form.ambientRed"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
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
			<div class="flex-box" id="fileScene-ambient-green-box">
				<SliderBox
					id="fileScene-ambient-green-slider"
					ref="elAmbientGreenSlider"
					v-model="form.ambientGreen"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
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
			<div class="flex-box" id="fileScene-ambient-blue-box">
				<SliderBox
					id="fileScene-ambient-blue-slider"
					ref="elAmbientBlueSlider"
					v-model="form.ambientBlue"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
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
			<div class="flex-box" id="fileScene-ambient-direct-box">
				<SliderBox
					id="fileScene-ambient-direct-slider"
					ref="elAmbientDirectSlider"
					v-model="form.ambientDirect"
					min="0"
					max="1"
					step="0.05"
				/>
				<NumberBox
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
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScene-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileScene-events"
			ref="elEvents"
			class="inspector-list"
			filter="scene"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScene-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileScene-scripts"
			ref="elScripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileScene-parameter-pane" ref="elParameterPane" />
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useFileScenePage } from '@app/composables/useFileScenePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { useSceneStore } from '@app/stores/scene';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const scene = useSceneStore();
const { t } = useI18n();

const { form, sync, onParamInput } = useFileScenePage();

const { bindInput, bindSliders } = useInspectorInput();

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elAmbientRedSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAmbientRed = ref<InstanceType<typeof NumberBox> | null>(null);
const elAmbientGreenSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAmbientGreen = ref<InstanceType<typeof NumberBox> | null>(null);
const elAmbientBlueSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAmbientBlue = ref<InstanceType<typeof NumberBox> | null>(null);
const elAmbientDirectSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAmbientDirect = ref<InstanceType<typeof NumberBox> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	const editor = Inspector.fileScene;
	if (!editor) return;

	const el = document.getElementById('fileScene-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	elAmbientRedSlider.value?.synchronize(elAmbientRed.value?.root as SyncTarget);
	elAmbientGreenSlider.value?.synchronize(elAmbientGreen.value?.root as SyncTarget);
	elAmbientBlueSlider.value?.synchronize(elAmbientBlue.value?.root as SyncTarget);
	elAmbientDirectSlider.value?.synchronize(elAmbientDirect.value?.root as SyncTarget);

	const owner = editor.owner;
	elEvents.value?.bind(new EventListInterface(editor, owner));
	elScripts.value?.bind(new ScriptListInterface(editor, owner));
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);

	const elements = document.querySelectorAll(
		'#fileScene-tileWidth, #fileScene-tileHeight, #fileScene-ambient-red, #fileScene-ambient-green, #fileScene-ambient-blue, #fileScene-ambient-direct'
	);
	const sliders = document.querySelectorAll(
		'#fileScene-ambient-red-slider, #fileScene-ambient-green-slider, #fileScene-ambient-blue-slider, #fileScene-ambient-direct-slider'
	);
	bindInput(elements, editor, owner);
	bindSliders(sliders);
	document
		.querySelectorAll('#fileScene-events, #fileScene-scripts')
		.forEach((el) => el.addEventListener('change', Scene.listChange));

	sync();
});
</script>
