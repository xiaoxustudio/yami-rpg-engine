<template>
	<WindowFrame id="ObjectProperty-index" @confirm="onConfirm">
		<template #title><TitleBar>ObjectProperty-index<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">IndexName</div><TextBox id="ObjectProperty-index-name" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IndexBind } from '@app/legacy/module/command/getObjectProperty.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	IndexBind?.confirm?.();
};

onMounted(() => {


});
</script>
