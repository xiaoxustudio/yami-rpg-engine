<template>
<WindowFrame id="removeAnimationComponent">
	<template #title><TitleBar>Remove Animation Component<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="removeAnimationComponent-actor" type="actor" /><div class="text">Animation</div
			><CustomBox
				id="removeAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><div class="text">Motion</div><SelectBox id="removeAnimationComponent-motion" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
