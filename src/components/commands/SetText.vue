<template>
	<WindowFrame id="setText">
		<TitleBar>Set Text<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setText-element" type="element" />
				<text>Properties</text><param-list id="setText-properties" />
			</grid-box>
			<button id="setText-confirm" name="confirm">Confirm</button>
			<button id="setText-cancel" name="cancel">Cancel</button>
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
