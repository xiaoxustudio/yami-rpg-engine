<template>
<WindowFrame id="if">
	<template #title><TitleBar>If<div class="close" /></TitleBar></template>
	
		<div class="grid-box"> <div class="text">Branches</div><ParamList id="if-branches" /> </div>
		<CheckBox id="if-else" class="standard"><div class="text" id="if-else-label">Else</div></CheckBox>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
