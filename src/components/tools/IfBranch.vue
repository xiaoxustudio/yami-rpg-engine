<template>
	<WindowFrame id="if-branch">
		<TitleBar>Branch<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Mode</text><select-box id="if-branch-mode" /> <text>Conditions</text
				><param-list id="if-branch-conditions" />
			</grid-box>
			<button id="if-branch-confirm" name="confirm">Confirm</button>
			<button id="if-branch-cancel" name="cancel">Cancel</button>
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
