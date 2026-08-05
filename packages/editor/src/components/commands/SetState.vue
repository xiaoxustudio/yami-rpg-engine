<template>
	<WindowFrame id="setState">
		<template #title><TitleBar>Set State<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">State</div><CustomBox id="setState-state" type="state" />
				<div class="text">Operation</div><SelectBox id="setState-operation" /> <div class="text">Time</div
				><NumberVar id="setState-time" min="0" max="36000000" unit="ms" />
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
