<template>
	<WindowFrame id="setDialogBox" @confirm="onConfirm">
		<template #title><TitleBar>Set Dialog Box<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setDialogBox-element" type="element" />
				<div class="text">Properties</div><ParamList id="setDialogBox-properties" />
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
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.setDialogBox?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
