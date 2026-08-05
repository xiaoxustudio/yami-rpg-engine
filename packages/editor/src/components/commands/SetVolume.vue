<template>
<WindowFrame id="setVolume">
	<template #title><TitleBar>Set Volume<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="setVolume-type" /> <div class="text">Volume</div
			><NumberVar id="setVolume-volume" min="0" max="1" step="0.1" decimals="4" />
			<div class="text">Easing</div><SelectBox id="setVolume-easingId" name="easing" />
			<div class="text">Duration</div
			><NumberBox
				id="setVolume-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
			<div class="text">Wait</div><SelectBox id="setVolume-wait" name="wait" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
