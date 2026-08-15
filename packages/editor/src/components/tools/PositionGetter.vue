<template>
		<WindowFrame id="positionGetter" @confirm="onConfirm">
		<template #title><TitleBar>Position<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="positionGetter-type" /> <div class="text">X</div
				><NumberVar
					id="positionGetter-common-x"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<div class="text">Y</div
				><NumberVar
					id="positionGetter-common-y"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				/>
				<div class="text">Actor</div><CustomBox id="positionGetter-actor" type="actor" />
				<div class="text">Trigger</div><CustomBox id="positionGetter-trigger" type="trigger" />
				<div class="text">Light</div><CustomBox id="positionGetter-light" type="light" />
				<div class="text">Region</div><CustomBox id="positionGetter-region" type="region" />
				<div class="text">Mode</div><SelectBox id="positionGetter-region-mode" />
				<div class="text">Object</div
				><CustomBox
					id="positionGetter-objectId"
					type="preset-object"
					filter="any"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { PositionGetter } from '@/command/position-accessor-window.ts';
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
	PositionGetter?.confirm?.();
};

onMounted(() => {


});
</script>
