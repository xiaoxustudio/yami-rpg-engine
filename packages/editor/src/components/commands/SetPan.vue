<template>
<WindowFrame id="setPan" @confirm="onConfirm">
	<template #title><TitleBar>Set Pan<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="setPan-type" /> <div class="text">Pan</div
			><NumberVar id="setPan-pan" min="-1" max="1" step="0.1" decimals="4" />
			<div class="text">Easing</div><SelectBox id="setPan-easingId" name="easing" />
			<div class="text">Duration</div
			><NumberBox
				id="setPan-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
			<div class="text">Wait</div><SelectBox id="setPan-wait" name="wait" />
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
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.setPan?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
