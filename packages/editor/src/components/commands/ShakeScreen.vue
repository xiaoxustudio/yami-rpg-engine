<template>
	<WindowFrame id="shakeScreen">
		<template #title><TitleBar>Tint Screen<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Shake Mode</div><SelectBox id="shakeScreen-mode" /> <div class="text">Power</div
				><NumberBox id="shakeScreen-power" min="1" max="10" /> <div class="text">Speed</div
				><NumberBox id="shakeScreen-speed" min="1" max="10" /> <div class="text">Easing</div
				><SelectBox id="shakeScreen-easingId" name="easing" /> <div class="text">Duration</div
				><NumberBox
					id="shakeScreen-duration"
					name="duration"
					min="1"
					max="3600000"
					unit="ms"
				 />
				<div class="text">Wait</div><SelectBox id="shakeScreen-wait" name="wait" />
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
