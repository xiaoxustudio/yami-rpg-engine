<template>
	<window-frame id="autoTile">
		<title-bar>Auto Tile<close /></title-bar>
		<content-frame>
			<field-set id="autoTile-general-fieldset">
				<legend>General</legend>
				<grid-box id="autoTile-general-grid">
					<text>Image</text
					><custom-box id="autoTile-image" type="file" filter="image" />
					<text>Offset X</text><number-box id="autoTile-x" min="0" max="255" />
					<text>Offset Y</text><number-box id="autoTile-y" min="0" max="255" />
				</grid-box>
			</field-set>
			<field-set id="autoTile-templates-fieldset" class="input pad">
				<legend>Templates</legend>
				<node-list id="autoTile-templates" padded />
			</field-set>
			<field-set id="autoTile-nodes-fieldset" class="input pad">
				<legend>Tiles</legend>
				<common-list id="autoTile-nodes" />
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
					<empty />
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
				<common-list id="autoTile-frames" />
			</field-set>
			<button id="autoTile-confirm" name="confirm">Confirm</button>
			<button id="autoTile-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SwitchItem from '@app/components/common/SwitchItem.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
