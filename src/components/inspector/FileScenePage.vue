<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileScene-general-grid') || 'Scene' }}</detail-summary>
		<detail-grid id="fileScene-general-grid">
			<text>{{ local.getLabel('fileScene-width') || 'Width' }}</text
			><number-box id="fileScene-width" min="0" max="512" unit="tile" />
			<text>{{ local.getLabel('fileScene-height') || 'Height' }}</text
			><number-box id="fileScene-height" min="0" max="512" unit="tile" />
			<text>{{ local.getLabel('fileScene-tileWidth') || 'Tile Width' }}</text
			><number-box
				id="fileScene-tileWidth"
				min="16"
				max="256"
				unit="px"
			/>
			<text>{{ local.getLabel('fileScene-tileHeight') || 'Tile Height' }}</text
			><number-box
				id="fileScene-tileHeight"
				min="16"
				max="256"
				unit="px"
			/>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileScene-ambient-grid') || 'Ambient Light' }}</detail-summary>
		<detail-grid id="fileScene-ambient-grid">
			<text>{{ local.getLabel('fileScene-ambient-red-box') || 'Red' }}</text>
			<flex-box id="fileScene-ambient-red-box">
				<slider-box
					id="fileScene-ambient-red-slider"
					min="0"
					max="255"
					step="5"
				/>
				<number-box
					id="fileScene-ambient-red"
					min="0"
					max="255"
					step="5"
				/>
			</flex-box>
			<text>{{ local.getLabel('fileScene-ambient-green-box') || 'Green' }}</text>
			<flex-box id="fileScene-ambient-green-box">
				<slider-box
					id="fileScene-ambient-green-slider"
					min="0"
					max="255"
					step="5"
				/>
				<number-box
					id="fileScene-ambient-green"
					min="0"
					max="255"
					step="5"
				/>
			</flex-box>
			<text>{{ local.getLabel('fileScene-ambient-blue-box') || 'Blue' }}</text>
			<flex-box id="fileScene-ambient-blue-box">
				<slider-box
					id="fileScene-ambient-blue-slider"
					min="0"
					max="255"
					step="5"
				/>
				<number-box
					id="fileScene-ambient-blue"
					min="0"
					max="255"
					step="5"
				/>
			</flex-box>
			<text>{{ local.getLabel('fileScene-ambient-direct-box') || 'Direct Light Ratio' }}</text>
			<flex-box id="fileScene-ambient-direct-box">
				<slider-box
					id="fileScene-ambient-direct-slider"
					min="0"
					max="1"
					step="0.05"
				/>
				<number-box
					id="fileScene-ambient-direct"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				/>
			</flex-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileScene-events') || 'Events' }}</detail-summary>
		<param-list
			id="fileScene-events"
			class="inspector-list"
			filter="scene"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileScene-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="fileScene-scripts"
			class="inspector-list"
			flexible
		/>
	</detail-box>
	<parameter-pane id="fileScene-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';

const scene = useSceneStore();
const local = useLocalStore();

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
