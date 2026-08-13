<template>
	<WindowFrame id="createElement" @confirm="onConfirm">
		<template #title><TitleBar>Create Element<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="createElement-operation" />
				<div class="text">Parent</div><CustomBox id="createElement-parent" type="element" />
				<div class="text">UI Elements</div
				><CustomBox id="createElement-uiId" type="file" filter="ui" />
				<div class="text">UI Element</div
				><CustomBox id="createElement-presetId" type="preset-element" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.createElement?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
