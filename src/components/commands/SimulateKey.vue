<template>
	<WindowFrame id="simulateKey">
		<TitleBar>Simulate Key<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="simulateKey-operation" />
				<text>Key Code</text><KeyboardBox id="simulateKey-keycode" />
			</grid-box>
			<button id="simulateKey-confirm" name="confirm">Confirm</button>
			<button id="simulateKey-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
