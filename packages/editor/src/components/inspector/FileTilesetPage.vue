<template>
	<div class="box" id="palette-head">
		<div class="box" id="palette-head-start">
			<div id="palette-scroll" class="item toolbar-item" value="scroll"></div>
			<div
				id="palette-priority"
				class="item toolbar-item"
				value="priority"
			></div>
			<div id="palette-tag" class="item toolbar-item" value="tag"></div>
			<div id="palette-terrain" class="item toolbar-item" value="terrain"></div>
			<div id="palette-edit" class="item toolbar-item" value="edit"></div>
			<div
				id="palette-flip"
				class="item toolbar-item"
				value="flip"
				hotkey="F"
			></div>
		</div>
		<SliderBox
			id="palette-zoom"
			name="zoom"
			min="0"
			max="4"
			hotkey="-/+"
		/>
	</div>
	<div class="box" id="palette-body">
		<div class="box" id="palette-frame">
			<canvas id="palette-canvas" width="0" height="0"></canvas>
			<div class="box" id="palette-screen" tabindex="-1">
				<MarqueeArea id="palette-marquee"></MarqueeArea>
			</div>
		</div>
		<div class="text" id="palette-info"></div>
	</div>
	<DetailBox id="fileTileset-general-detail" open>
		<DetailSummary>{{ local.getLabel('fileTileset-general-grid') || 'Tileset' }}</DetailSummary>
		<div class="detail-grid" id="fileTileset-general-grid">
			<div class="text">{{ local.getLabel('fileTileset-image') || 'Image' }}</div
			><CustomBox id="fileTileset-image" type="file" filter="image" />
			<div class="text">{{ local.getLabel('fileTileset-width') || 'Width' }}</div
			><NumberBox id="fileTileset-width" min="1" max="256" unit="tile" />
			<div class="text">{{ local.getLabel('fileTileset-height') || 'Height' }}</div
			><NumberBox id="fileTileset-height" min="1" max="256" unit="tile" />
			<div class="text">{{ local.getLabel('fileTileset-tileWidth') || 'Tile Width' }}</div
			><NumberBox
				id="fileTileset-tileWidth"
				min="16"
				max="256"
				unit="px"
			/>
			<div class="text">{{ local.getLabel('fileTileset-tileHeight') || 'Tile Height' }}</div
			><NumberBox
				id="fileTileset-tileHeight"
				min="16"
				max="256"
				unit="px"
			/>
			<div class="text">{{ local.getLabel('fileTileset-globalOffsetX') || 'Tile Offset X' }}</div
			><NumberBox
				id="fileTileset-globalOffsetX"
				min="-256"
				max="256"
				unit="px"
			/>
			<div class="text">{{ local.getLabel('fileTileset-globalOffsetY') || 'Tile Offset Y' }}</div
			><NumberBox
				id="fileTileset-globalOffsetY"
				min="-256"
				max="256"
				unit="px"
			/>
			<div class="text">{{ local.getLabel('fileTileset-globalPriority') || 'Tile Priority' }}</div
			><NumberBox
				id="fileTileset-globalPriority"
				min="-10"
				max="10"
				decimals="4"
			/>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const scene = useSceneStore();
const local = useLocalStore();

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
