<template>
	<!-- 设置窗口 - 属性 -->
	<WindowFrame id="setWindow-property">
		<template #title><TitleBar>Window Property<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="setWindow-property-key" />
				<div class="text">Scroll X</div
				><NumberVar id="setWindow-property-scrollX" min="0" max="10000" unit="px" />
				<div class="text">Scroll Y</div
				><NumberVar id="setWindow-property-scrollY" min="0" max="10000" unit="px" />
				<div class="text">Grid Width</div
				><NumberVar
					id="setWindow-property-gridWidth"
					min="0"
					max="1000"
					unit="px"
				/>
				<div class="text">Grid Height</div
				><NumberVar
					id="setWindow-property-gridHeight"
					min="0"
					max="1000"
					unit="px"
				/>
				<div class="text">Grid Gap X</div
				><NumberVar id="setWindow-property-gridGapX" min="0" max="1000" unit="px" />
				<div class="text">Grid Gap Y</div
				><NumberVar id="setWindow-property-gridGapY" min="0" max="1000" unit="px" />
				<div class="text">Padding X</div
				><NumberVar id="setWindow-property-paddingX" min="0" max="1000" unit="px" />
				<div class="text">Padding Y</div
				><NumberVar id="setWindow-property-paddingY" min="0" max="1000" unit="px" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
