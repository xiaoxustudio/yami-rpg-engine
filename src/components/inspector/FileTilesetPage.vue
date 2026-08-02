<template>
	<box id="palette-head">
		<box id="palette-head-start">
			<item id="palette-scroll" class="toolbar-item" value="scroll"></item>
			<item
				id="palette-priority"
				class="toolbar-item"
				value="priority"
			></item>
			<item id="palette-tag" class="toolbar-item" value="tag"></item>
			<item id="palette-terrain" class="toolbar-item" value="terrain"></item>
			<item id="palette-edit" class="toolbar-item" value="edit"></item>
			<item
				id="palette-flip"
				class="toolbar-item"
				value="flip"
				hotkey="F"
			></item>
		</box>
		<SliderBox
			id="palette-zoom"
			name="zoom"
			min="0"
			max="4"
			hotkey="-/+"
		/>
	</box>
	<box id="palette-body">
		<box id="palette-frame">
			<canvas id="palette-canvas" width="0" height="0"></canvas>
			<box id="palette-screen" tabindex="-1">
				<MarqueeArea id="palette-marquee"></MarqueeArea>
			</box>
		</box>
		<text id="palette-info"></text>
	</box>
	<DetailBox id="fileTileset-general-detail" open>
		<DetailSummary>{{ local.getLabel('fileTileset-general-grid') || 'Tileset' }}</DetailSummary>
		<detail-grid id="fileTileset-general-grid">
			<text>{{ local.getLabel('fileTileset-image') || 'Image' }}</text
			><CustomBox id="fileTileset-image" type="file" filter="image" />
			<text>{{ local.getLabel('fileTileset-width') || 'Width' }}</text
			><NumberBox id="fileTileset-width" min="1" max="256" unit="tile" />
			<text>{{ local.getLabel('fileTileset-height') || 'Height' }}</text
			><NumberBox id="fileTileset-height" min="1" max="256" unit="tile" />
			<text>{{ local.getLabel('fileTileset-tileWidth') || 'Tile Width' }}</text
			><NumberBox
				id="fileTileset-tileWidth"
				min="16"
				max="256"
				unit="px"
			/>
			<text>{{ local.getLabel('fileTileset-tileHeight') || 'Tile Height' }}</text
			><NumberBox
				id="fileTileset-tileHeight"
				min="16"
				max="256"
				unit="px"
			/>
			<text>{{ local.getLabel('fileTileset-globalOffsetX') || 'Tile Offset X' }}</text
			><NumberBox
				id="fileTileset-globalOffsetX"
				min="-256"
				max="256"
				unit="px"
			/>
			<text>{{ local.getLabel('fileTileset-globalOffsetY') || 'Tile Offset Y' }}</text
			><NumberBox
				id="fileTileset-globalOffsetY"
				min="-256"
				max="256"
				unit="px"
			/>
			<text>{{ local.getLabel('fileTileset-globalPriority') || 'Tile Priority' }}</text
			><NumberBox
				id="fileTileset-globalPriority"
				min="-10"
				max="10"
				decimals="4"
			/>
		</detail-grid>
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
