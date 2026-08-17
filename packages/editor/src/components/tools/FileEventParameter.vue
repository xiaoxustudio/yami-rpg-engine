<template>
	<WindowFrame id="fileEvent-parameter" @confirm="onConfirm">
		<template #title><TitleBar>Parameter<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="fileEvent-parameter-type" /> <div class="text">Key</div
				><TextBox id="fileEvent-parameter-key" /> <div class="text">Note</div
				><TextArea id="fileEvent-parameter-note" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Inspector?.fileEvent?.parameters?.save?.();
};

onMounted(() => {


});
</script>
