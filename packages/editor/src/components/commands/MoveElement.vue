<template>
	<WindowFrame id="moveElement" @confirm="onConfirm">
		<template #title><TitleBar>Move Element<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="moveElement-element" type="element" />
				<div class="text">Properties</div><ParamList id="moveElement-properties" />
				<div class="text">Easing</div><SelectBox id="moveElement-easingId" name="easing" />
				<div class="text">Duration</div
				><NumberBox
					id="moveElement-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				/>
				<div class="text">Wait</div><SelectBox id="moveElement-wait" name="wait" />
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
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.moveElement?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
