<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScene-general-grid.label') || 'Scene' }}</DetailSummary>
		<div class="detail-grid" id="fileScene-general-grid">
			<div class="text">{{ t('components.fileScene-width.label') || 'Width' }}</div
			><NumberBox id="fileScene-width" v-model="form.width" min="0" max="512" unit="tile" @change="onParamInput" />
			<div class="text">{{ t('components.fileScene-height.label') || 'Height' }}</div
			><NumberBox id="fileScene-height" v-model="form.height" min="0" max="512" unit="tile" @change="onParamInput" />
			<div class="text">{{ t('components.fileScene-tileWidth.label') || 'Tile Width' }}</div
			><NumberBox
				id="fileScene-tileWidth" v-model="form.tileWidth" @input="onParamInput"
				min="16"
				max="256"
				unit="px"
			/>
			<div class="text">{{ t('components.fileScene-tileHeight.label') || 'Tile Height' }}</div
			><NumberBox
				id="fileScene-tileHeight" v-model="form.tileHeight" @input="onParamInput"
				min="16"
				max="256"
				unit="px"
			/>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScene-ambient-grid.label') || 'Ambient Light' }}</DetailSummary>
		<div class="detail-grid" id="fileScene-ambient-grid">
			<div class="text">{{ t('components.fileScene-ambient-red-box.label') || 'Red' }}</div>
			<div class="flex-box" id="fileScene-ambient-red-box">
				<SliderBox
					id="fileScene-ambient-red-slider"
					v-model="form.ambientRed"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					id="fileScene-ambient-red" v-model="form.ambientRed" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				/>
			</div>
			<div class="text">{{ t('components.fileScene-ambient-green-box.label') || 'Green' }}</div>
			<div class="flex-box" id="fileScene-ambient-green-box">
				<SliderBox
					id="fileScene-ambient-green-slider"
					v-model="form.ambientGreen"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					id="fileScene-ambient-green" v-model="form.ambientGreen" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				/>
			</div>
			<div class="text">{{ t('components.fileScene-ambient-blue-box.label') || 'Blue' }}</div>
			<div class="flex-box" id="fileScene-ambient-blue-box">
				<SliderBox
					id="fileScene-ambient-blue-slider"
					v-model="form.ambientBlue"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					id="fileScene-ambient-blue" v-model="form.ambientBlue" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				/>
			</div>
			<div class="text">{{ t('components.fileScene-ambient-direct-box.label') || 'Direct Light Ratio' }}</div>
			<div class="flex-box" id="fileScene-ambient-direct-box">
				<SliderBox
					id="fileScene-ambient-direct-slider"
					v-model="form.ambientDirect"
					min="0"
					max="1"
					step="0.05"
				/>
				<NumberBox
					id="fileScene-ambient-direct" v-model="form.ambientDirect" @input="onParamInput"
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
			class="inspector-list"
			filter="scene"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScene-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileScene-scripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileScene-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { EventListInterface } from '@app/legacy/tools/event-list.ts';
import { ScriptListInterface } from '@app/legacy/tools/script-list.ts';
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

onMounted(() => {
	const editor = Inspector.fileScene;
	if (!editor) return;

	const el = document.getElementById('fileScene-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	document.getElementById('fileScene-ambient-red-slider')?.synchronize?.(document.getElementById('fileScene-ambient-red'));
	document.getElementById('fileScene-ambient-green-slider')?.synchronize?.(document.getElementById('fileScene-ambient-green'));
	document.getElementById('fileScene-ambient-blue-slider')?.synchronize?.(document.getElementById('fileScene-ambient-blue'));
	document.getElementById('fileScene-ambient-direct-slider')?.synchronize?.(document.getElementById('fileScene-ambient-direct'));

	const owner = editor.owner;
	document.getElementById('fileScene-events')?.bind?.(new EventListInterface(editor, owner));
	document.getElementById('fileScene-scripts')?.bind?.(new ScriptListInterface(editor, owner));
	document.getElementById('fileScene-parameter-pane')?.bind?.(document.getElementById('fileScene-scripts'));

	const elements = document.querySelectorAll(
		'#fileScene-tileWidth, #fileScene-tileHeight, #fileScene-ambient-red, #fileScene-ambient-green, #fileScene-ambient-blue, #fileScene-ambient-direct'
	);
	const sliders = document.querySelectorAll(
		'#fileScene-ambient-red-slider, #fileScene-ambient-green-slider, #fileScene-ambient-blue-slider, #fileScene-ambient-direct-slider'
	);
	bindInput(elements, editor, owner);
	bindSliders(sliders);
	document.querySelectorAll('#fileScene-events, #fileScene-scripts')
		.forEach((el) => el.addEventListener('change', Scene.listChange));

	sync();
});
</script>
