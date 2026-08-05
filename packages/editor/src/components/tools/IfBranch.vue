<template>
	<WindowFrame id="if-branch">
		<template #title><TitleBar>Branch<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Mode</div><SelectBox id="if-branch-mode" /> <div class="text">Conditions</div
				><ParamList id="if-branch-conditions" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
