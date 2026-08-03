<template>
	<WindowFrame id="autoTile">
		<TitleBar>Auto Tile<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="field-set" id="autoTile-general-fieldset">
				<div class="legend">General</div>
				<div class="grid-box" id="autoTile-general-grid">
					<text>Image</text
					><CustomBox id="autoTile-image" type="file" filter="image" />
					<text>Offset X</text><NumberBox id="autoTile-x" min="0" max="255" />
					<text>Offset Y</text><NumberBox id="autoTile-y" min="0" max="255" />
				</div>
			</div>
			<div class="field-set input pad" id="autoTile-templates-fieldset">
				<div class="legend">Templates</div>
				<TreeList id="autoTile-templates" padded />
			</div>
			<div class="field-set input pad" id="autoTile-nodes-fieldset">
				<div class="legend">Tiles</div>
				<CommonList id="autoTile-nodes" />
			</div>
			<div class="field-set" id="autoTile-canvas-fieldset">
				<div class="legend">View</div>
				<canvas id="autoTile-canvas" width="128" height="128" />
			</div>
			<div class="field-set" id="autoTile-rule-fieldset">
				<div class="legend">Neighbors</div>
				<div class="grid-box" id="autoTile-rule-grid">
					<SwitchItem
						id="autoTile-rule-1"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-2"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-3"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-0"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<div class="empty" />
					<SwitchItem
						id="autoTile-rule-4"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-7"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-6"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-5"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
				</div>
			</div>
			<div class="field-set input pad" id="autoTile-frames-fieldset">
				<div class="legend">Frames</div>
				<CommonList id="autoTile-frames" />
			</div>
			<button id="autoTile-confirm" name="confirm">Confirm</button>
			<button id="autoTile-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SwitchItem from '@app/components/common/SwitchItem.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import CommonList from '@app/components/common/CommonList.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
