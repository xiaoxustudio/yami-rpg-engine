<template>
	<WindowFrame id="choice">
		<template #title><TitleBar>Choice<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Content</div
				><TextBox
					id="choice-content"
					menu="tag-local-var tag-global-var tag-localization"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
