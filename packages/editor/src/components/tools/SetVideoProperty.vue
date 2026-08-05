<template>
	<!-- 设置视频 - 属性 -->
	<WindowFrame id="setVideo-property">
		<template #title><TitleBar>Image Property<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="setVideo-property-key" />
				<div class="text">Video</div
				><CustomBox id="setVideo-property-video" type="file" filter="video" />
				<div class="text">Playback Rate</div
				><NumberVar
					id="setVideo-property-playbackRate"
					min="0"
					max="4"
					decimals="4"
				/>
				<div class="text">Loop</div><SelectBox id="setVideo-property-loop" /> <div class="text">Flip</div
				><SelectBox id="setVideo-property-flip" /> <div class="text">Blend</div
				><SelectBox id="setVideo-property-blend" />
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
