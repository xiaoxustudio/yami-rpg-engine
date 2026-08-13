<template>
	<WindowFrame id="angleGetter" @confirm="onConfirm">
		<template #title><TitleBar>Angle<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="angleGetter-type" /> <div class="text">Position</div
				><CustomBox id="angleGetter-position-position" type="position" />
				<div class="text">Degrees</div
				><NumberVar
					id="angleGetter-common-degrees"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { AngleGetter } from '@/command/angle-accessor-window.ts';
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
	AngleGetter?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
