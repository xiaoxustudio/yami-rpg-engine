<template>
		<WindowFrame id="regionGetter" @confirm="onConfirm">
		<template #title><TitleBar>Region<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="regionGetter-type" /> <div class="text">Region</div
				><CustomBox
					id="regionGetter-presetId"
					type="preset-object"
					filter="region"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RegionGetter } from '@/command/region-accessor-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	RegionGetter?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
