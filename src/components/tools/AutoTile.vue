<template>
	<WindowFrame id="autoTile">
		<TitleBar>Auto Tile<div class="close" /></TitleBar>
		<content-frame>
			<field-set id="autoTile-general-fieldset">
				<legend>General</legend>
				<grid-box id="autoTile-general-grid">
					<text>Image</text
					><CustomBox id="autoTile-image" type="file" filter="image" />
					<text>Offset X</text><NumberBox id="autoTile-x" min="0" max="255" />
					<text>Offset Y</text><NumberBox id="autoTile-y" min="0" max="255" />
				</grid-box>
			</field-set>
			<field-set id="autoTile-templates-fieldset" class="input pad">
				<legend>Templates</legend>
				<TreeList id="autoTile-templates" padded />
			</field-set>
			<field-set id="autoTile-nodes-fieldset" class="input pad">
				<legend>Tiles</legend>
				<CommonList id="autoTile-nodes" />
			</field-set>
			<field-set id="autoTile-canvas-fieldset">
				<legend>View</legend>
				<canvas id="autoTile-canvas" width="128" height="128" />
			</field-set>
			<field-set id="autoTile-rule-fieldset">
				<legend>Neighbors</legend>
				<grid-box id="autoTile-rule-grid">
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
				</grid-box>
			</field-set>
			<field-set id="autoTile-frames-fieldset" class="input pad">
				<legend>Frames</legend>
				<CommonList id="autoTile-frames" />
			</field-set>
			<button id="autoTile-confirm" name="confirm">Confirm</button>
			<button id="autoTile-cancel" name="cancel">Cancel</button>
		</content-frame>
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
