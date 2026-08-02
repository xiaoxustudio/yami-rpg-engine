<template>
	<WindowFrame id="setAnimation">
		<TitleBar>Set Animation<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setAnimation-element" type="element" />
				<text>Properties</text><param-list id="setAnimation-properties" />
			</grid-box>
			<button id="setAnimation-confirm" name="confirm">Confirm</button>
			<button id="setAnimation-cancel" name="cancel">Cancel</button>
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
