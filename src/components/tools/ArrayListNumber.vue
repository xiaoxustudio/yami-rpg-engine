<template>
	<window-frame id="arrayList-number">
		<title-bar>Number<close /></title-bar>
		<content-frame>
			<number-box
				id="arrayList-number-value"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			/>
			<button id="arrayList-number-confirm" name="confirm">Confirm</button>
			<button id="arrayList-number-cancel" name="cancel">Cancel</button>
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
