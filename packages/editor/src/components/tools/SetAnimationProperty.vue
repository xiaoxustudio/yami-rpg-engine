<template>
		<WindowFrame id="setAnimation-property">
		<template #title><TitleBar>Set Animation<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="setAnimation-property-key" />
				<div class="text">Animation</div
				><CustomBox
					id="setAnimation-property-animation"
					type="file"
					filter="animation"
				/>
				<div class="text">Actor</div
				><CustomBox id="setAnimation-property-actor" type="actor" />
				<div class="text">Motion</div
				><CustomBox id="setAnimation-property-motion" type="enum-string" />
				<div class="text">Angle</div
				><NumberVar id="setAnimation-property-angle" min="0" max="360" unit="deg" />
				<div class="text">Frame</div
				><NumberVar id="setAnimation-property-frame" min="0" max="10000" />
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


});
</script>
