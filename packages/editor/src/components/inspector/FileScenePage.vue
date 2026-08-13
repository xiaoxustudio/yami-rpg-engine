<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScene-general-grid') || 'Scene' }}</DetailSummary>
		<div class="detail-grid" id="fileScene-general-grid">
			<div class="text">{{ local.getLabel('fileScene-width') || 'Width' }}</div
			><NumberBox id="fileScene-width" min="0" max="512" unit="tile" @change="onParamChange" />
			<div class="text">{{ local.getLabel('fileScene-height') || 'Height' }}</div
			><NumberBox id="fileScene-height" min="0" max="512" unit="tile" @change="onParamChange" />
			<div class="text">{{ local.getLabel('fileScene-tileWidth') || 'Tile Width' }}</div
			><NumberBox
				id="fileScene-tileWidth" @input="onParamInput"
				min="16"
				max="256"
				unit="px"
			/>
			<div class="text">{{ local.getLabel('fileScene-tileHeight') || 'Tile Height' }}</div
			><NumberBox
				id="fileScene-tileHeight" @input="onParamInput"
				min="16"
				max="256"
				unit="px"
			/>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScene-ambient-grid') || 'Ambient Light' }}</DetailSummary>
		<div class="detail-grid" id="fileScene-ambient-grid">
			<div class="text">{{ local.getLabel('fileScene-ambient-red-box') || 'Red' }}</div>
			<div class="flex-box" id="fileScene-ambient-red-box">
				<SliderBox
					id="fileScene-ambient-red-slider"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					id="fileScene-ambient-red" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				/>
			</div>
			<div class="text">{{ local.getLabel('fileScene-ambient-green-box') || 'Green' }}</div>
			<div class="flex-box" id="fileScene-ambient-green-box">
				<SliderBox
					id="fileScene-ambient-green-slider"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					id="fileScene-ambient-green" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				/>
			</div>
			<div class="text">{{ local.getLabel('fileScene-ambient-blue-box') || 'Blue' }}</div>
			<div class="flex-box" id="fileScene-ambient-blue-box">
				<SliderBox
					id="fileScene-ambient-blue-slider"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					id="fileScene-ambient-blue" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				/>
			</div>
			<div class="text">{{ local.getLabel('fileScene-ambient-direct-box') || 'Direct Light Ratio' }}</div>
			<div class="flex-box" id="fileScene-ambient-direct-box">
				<SliderBox
					id="fileScene-ambient-direct-slider"
					min="0"
					max="1"
					step="0.05"
				/>
				<NumberBox
					id="fileScene-ambient-direct" @input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				/>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScene-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileScene-events"
			class="inspector-list"
			filter="scene"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScene-scripts') || 'Scripts' }}</DetailSummary>
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
import { Inspector } from '@/inspector/inspector.ts';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const scene = useSceneStore();
const local = useLocalStore();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.fileScene?.paramInput?.({ target });
};
const onParamChange = () => {
	Inspector?.fileScene?.paramInput?.();
};

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
