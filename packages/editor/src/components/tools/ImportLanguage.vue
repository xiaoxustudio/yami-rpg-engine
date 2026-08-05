<template>
	<WindowFrame id="importLanguage">
		<template #title><TitleBar>Import Language Pack<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Import to</div><SelectBox id="importLanguage-language" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
