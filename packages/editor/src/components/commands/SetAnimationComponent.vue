<template>
<WindowFrame id="setAnimationComponent" @confirm="onConfirm">
	<template #title><TitleBar>Set Animation Component<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="setAnimationComponent-actor" type="actor" /><div class="text">Animation</div
			><CustomBox
				id="setAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><div class="text">Motion</div><SelectBox id="setAnimationComponent-motion" /><div class="text">Operation</div><SelectBox id="setAnimationComponent-operation" /><div class="text">Angle</div
			><CustomBox id="setAnimationComponent-angle" type="angle" /><div class="text">Scale</div
			><NumberVar
				id="setAnimationComponent-scale"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
			 /><div class="text">Speed</div
			><NumberVar
				id="setAnimationComponent-speed"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
			 /><div class="text">Opacity</div
			><NumberVar
				id="setAnimationComponent-opacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			 /><div class="text">Priority</div
			><NumberBox id="setAnimationComponent-priority" min="-100" max="100" /><div class="text">Offset Y</div
			><NumberBox
				id="setAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
			 /><div class="text">Sprite Name</div><SelectBox id="setAnimationComponent-spriteId" /><div class="text">Image</div
			><CustomBox id="setAnimationComponent-image" type="file" filter="image" /><div class="text">Play Motion</div><SelectBox id="setAnimationComponent-playMotion" /><div class="text">Wait</div><SelectBox id="setAnimationComponent-wait" name="wait" /></div>
	
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const onWrite = (value: unknown) => {
	Command?.cases?.setAnimationComponent?.writeHandler?.({ value });
};

const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.setAnimationComponent?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
