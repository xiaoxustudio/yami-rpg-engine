<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScene-general-grid') || 'Scene' }}</DetailSummary>
		<detail-grid id="fileScene-general-grid">
			<text>{{ local.getLabel('fileScene-width') || 'Width' }}</text
			><NumberBox id="fileScene-width" min="0" max="512" unit="tile" />
			<text>{{ local.getLabel('fileScene-height') || 'Height' }}</text
			><NumberBox id="fileScene-height" min="0" max="512" unit="tile" />
			<text>{{ local.getLabel('fileScene-tileWidth') || 'Tile Width' }}</text
			><NumberBox
				id="fileScene-tileWidth"
				min="16"
				max="256"
				unit="px"
			/>
			<text>{{ local.getLabel('fileScene-tileHeight') || 'Tile Height' }}</text
			><NumberBox
				id="fileScene-tileHeight"
				min="16"
				max="256"
				unit="px"
			/>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScene-ambient-grid') || 'Ambient Light' }}</DetailSummary>
		<detail-grid id="fileScene-ambient-grid">
			<text>{{ local.getLabel('fileScene-ambient-red-box') || 'Red' }}</text>
			<flex-box id="fileScene-ambient-red-box">
				<SliderBox
					id="fileScene-ambient-red-slider"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					id="fileScene-ambient-red"
					min="0"
					max="255"
					step="5"
				/>
			</flex-box>
			<text>{{ local.getLabel('fileScene-ambient-green-box') || 'Green' }}</text>
			<flex-box id="fileScene-ambient-green-box">
				<SliderBox
					id="fileScene-ambient-green-slider"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					id="fileScene-ambient-green"
					min="0"
					max="255"
					step="5"
				/>
			</flex-box>
			<text>{{ local.getLabel('fileScene-ambient-blue-box') || 'Blue' }}</text>
			<flex-box id="fileScene-ambient-blue-box">
				<SliderBox
					id="fileScene-ambient-blue-slider"
					min="0"
					max="255"
					step="5"
				/>
				<NumberBox
					id="fileScene-ambient-blue"
					min="0"
					max="255"
					step="5"
				/>
			</flex-box>
			<text>{{ local.getLabel('fileScene-ambient-direct-box') || 'Direct Light Ratio' }}</text>
			<flex-box id="fileScene-ambient-direct-box">
				<SliderBox
					id="fileScene-ambient-direct-slider"
					min="0"
					max="1"
					step="0.05"
				/>
				<NumberBox
					id="fileScene-ambient-direct"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				/>
			</flex-box>
		</detail-grid>
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
	<parameter-pane id="fileScene-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const scene = useSceneStore();
const local = useLocalStore();

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
