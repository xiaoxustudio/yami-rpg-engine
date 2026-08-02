<template>
	<WindowFrame id="fontSize">
		<TitleBar>Set Font Size<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Size</text
				><number-box id="fontSize-size" min="10" max="400" unit="px" />
			</grid-box>
			<button id="fontSize-confirm" name="confirm">Confirm</button>
			<button id="fontSize-cancel" name="cancel">Cancel</button>
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
