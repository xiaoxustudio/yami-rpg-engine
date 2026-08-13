<template>
	<WindowFrame id="playAnimation" @confirm="onConfirm">
		<template #title><TitleBar>Play Animation<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Mode</div><SelectBox id="playAnimation-mode" /> <div class="text">Position</div
				><CustomBox id="playAnimation-position" type="position" /> <div class="text">Actor</div
				><CustomBox id="playAnimation-actor" type="actor" /> <div class="text">Animation</div
				><CustomBox id="playAnimation-animationId" type="file" filter="animation" />
				<div class="text">Motion</div><SelectBox id="playAnimation-motion" />
				<div class="text">Rotatable</div><SelectBox id="playAnimation-rotatable" />
				<div class="text">Priority</div
				><NumberBox id="playAnimation-priority" min="-100" max="100" />
				<div class="text">Offset Y</div
				><NumberVar
					id="playAnimation-offsetY"
					min="-1000000000"
					max="1000000000"
					unit="px"
				 />
				<div class="text">Angle</div
				><NumberVar
					id="playAnimation-angle"
					min="-360"
					max="360"
					decimals="4"
					unit="deg"
				 />
				<div class="text">Speed</div
				><NumberVar
					id="playAnimation-speed"
					min="0.1"
					max="10"
					step="0.1"
					decimals="4"
				 />
				<div class="text">Wait</div><SelectBox id="playAnimation-wait" name="wait" />
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
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const onWrite = (value: unknown) => {
	Command?.cases?.playAnimation?.writeHandler?.({ value });
};

const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.playAnimation?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
