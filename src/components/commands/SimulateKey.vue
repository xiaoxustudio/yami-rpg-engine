<template>
	<WindowFrame id="simulateKey">
		<TitleBar>Simulate Key<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Operation</text><SelectBox id="simulateKey-operation" />
				<text>Key Code</text><KeyboardBox id="simulateKey-keycode" />
			</div>
			<button id="simulateKey-confirm" name="confirm">Confirm</button>
			<button id="simulateKey-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
