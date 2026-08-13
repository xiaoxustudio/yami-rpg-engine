<template>
<WindowFrame id="switch">
	<template #title><TitleBar>Switch<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Variable</div
			><CustomBox id="switch-variable" type="variable" filter="all" />
			<div class="text">Branches</div><ParamList id="switch-branches" />
		</div>
		<CheckBox id="switch-default" class="standard"
			><div class="text" id="switch-default-label">Default</div></CheckBox
		>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
