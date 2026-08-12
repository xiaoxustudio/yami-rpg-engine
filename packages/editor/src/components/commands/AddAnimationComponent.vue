<template>
<WindowFrame id="addAnimationComponent">
	<template #title><TitleBar>Add Animation Component<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="addAnimationComponent-actor" type="actor" /><div class="text">Animation</div
			><CustomBox
				id="addAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><div class="text">Motion</div><SelectBox id="addAnimationComponent-motion" /><div class="text">Rotatable</div><SelectBox id="addAnimationComponent-rotatable" /><div class="text">Sync Angle</div><SelectBox id="addAnimationComponent-syncAngle" /><div class="text">Priority</div
			><NumberBox id="addAnimationComponent-priority" min="-100" max="100" /><div class="text">Offset Y</div
			><NumberBox
				id="addAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
			 /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const onWrite = (value: unknown) => {
	Command?.cases?.addAnimationComponent?.writeHandler?.({ value });
};

const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
