<template>
	<WindowFrame id="fileActor-sprite" @confirm="onConfirm">
		<template #title><TitleBar>Sprite<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Name</div><SelectBox id="fileActor-sprite-id" /> <div class="text">Image</div
				><CustomBox id="fileActor-sprite-image" type="file" filter="image" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Inspector?.fileActor?.sprites?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
