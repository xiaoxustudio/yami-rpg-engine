<template>
	<WindowFrame id="arrayList-number">
		<TitleBar>Number<close /></TitleBar>
		<content-frame>
			<NumberBox
				id="arrayList-number-value"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			/>
			<button id="arrayList-number-confirm" name="confirm">Confirm</button>
			<button id="arrayList-number-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
