<template>
	<!-- 变量访问器窗口2 -->
	<WindowFrame id="variableGetter2">
		<template #title><TitleBar>Variable<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="variableGetter2-type" /> <div class="text">Element</div
				><CustomBox id="variableGetter2-element" type="element" /> <div class="text">Key</div
				><TextBox id="variableGetter2-common-key" /> <div class="text">Key</div
				><SelectBox id="variableGetter2-preset-key" /> <div class="text">Key</div
				><CustomBox id="variableGetter2-global-key" type="global-variable" />
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
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
