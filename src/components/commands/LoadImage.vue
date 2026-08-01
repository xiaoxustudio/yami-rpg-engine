<template>
	<window-frame id="loadImage">
		<title-bar>Load Image<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="loadImage-element" type="element" />
				<text>Type</text><select-box id="loadImage-type" /> <text>Actor</text
				><custom-box id="loadImage-actor" type="actor" /> <text>Skill</text
				><custom-box id="loadImage-skill" type="skill" /> <text>State</text
				><custom-box id="loadImage-state" type="state" /> <text>Equipment</text
				><custom-box id="loadImage-equipment" type="equipment" /> <text>Item</text
				><custom-box id="loadImage-item" type="item" /> <text>Shortcut Key</text
				><select-var id="loadImage-key" /> <text>Base64 Coding</text
				><custom-box id="loadImage-variable" type="variable" filter="string" />
			</grid-box>
			<button id="loadImage-confirm" name="confirm">Confirm</button>
			<button id="loadImage-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
