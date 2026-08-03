<template>
	<WindowFrame id="webSocketClose">
		<TitleBar>webSocketClose<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>ID</text><StringVar id="webSocketClose-id" /> <text>Code</text
				><NumberBox id="webSocketClose-code" min="1000" max="4999" />
				<text>Reason</text><StringVar id="webSocketClose-reason" />
			</div>
			<button id="webSocketClose-confirm" name="confirm">Confirm</button>
			<button id="webSocketClose-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import StringVar from '@app/components/common/StringVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
