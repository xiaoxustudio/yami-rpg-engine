<template>
<WindowFrame id="setShortcut">
	<TitleBar>Set Shortcut<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="setShortcut-actor" type="actor" />
			<text>Operation</text><select-box id="setShortcut-operation" />
			<text>Shortcut Key</text><select-var id="setShortcut-key" />
			<text>Shortcut Key 2</text><select-var id="setShortcut-key2" />
			<text>Item</text><file-var id="setShortcut-itemId" type="file" filter="item" />
			<text>Skill</text
			><file-var id="setShortcut-skillId" type="file" filter="skill" />
		</grid-box>
		<button id="setShortcut-confirm" name="confirm">Confirm</button>
		<button id="setShortcut-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
