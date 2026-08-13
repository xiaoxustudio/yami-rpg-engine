<template>
<WindowFrame id="transition" @confirm="onConfirm">
	<template #title><TitleBar>Transition<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Write to Variable</div
			><CustomBox id="transition-variable" type="variable" filter="number" />
			<div class="text">Start Value</div
			><NumberVar
				id="transition-start"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<div class="text">End Value</div
			><NumberVar
				id="transition-end"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<div class="text">Easing</div><SelectBox id="transition-easingId" name="easing" />
			<div class="text">Duration</div
			><NumberVar
				id="transition-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.transition?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
