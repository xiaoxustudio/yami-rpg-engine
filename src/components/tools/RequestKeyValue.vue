<template>
		<WindowFrame id="request-keyValue">
		<TitleBar>Header<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>key</text><StringVar id="request-keyValue-key" /> <text>value</text
				><StringVar id="request-keyValue-value" />
			</grid-box>
			<button id="request-keyValue-confirm" name="confirm">Confirm</button>
			<button id="request-keyValue-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import StringVar from '@app/components/common/StringVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
