<template>
	<WindowFrame id="ancestorGetter">
		<template #title><TitleBar>Element<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="ancestorGetter-type" /> <div class="text">Data ID</div
				><CustomBox id="ancestorGetter-presetId" type="preset-element" />
				<div class="text">Variable</div
				><CustomBox id="ancestorGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
