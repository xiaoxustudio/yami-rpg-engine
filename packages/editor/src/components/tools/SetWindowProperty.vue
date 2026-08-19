<template>
	<!-- 设置窗口 - 属性 -->
	<WindowFrame id="setWindow-property">
		<template #title><TitleBar>{{ t('components.setWindow-property.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setWindow-property-key.label') }}</div><SelectBox id="setWindow-property-key" />
				<div class="text">{{ t('components.setWindow-property-scrollX.label') }}</div
				><NumberVar id="setWindow-property-scrollX" min="0" max="10000" unit="px" />
				<div class="text">{{ t('components.setWindow-property-scrollY.label') }}</div
				><NumberVar id="setWindow-property-scrollY" min="0" max="10000" unit="px" />
				<div class="text">{{ t('components.setWindow-property-gridWidth.label') }}</div
				><NumberVar
					id="setWindow-property-gridWidth"
					min="0"
					max="1000"
					unit="px"
				/>
				<div class="text">{{ t('components.setWindow-property-gridHeight.label') }}</div
				><NumberVar
					id="setWindow-property-gridHeight"
					min="0"
					max="1000"
					unit="px"
				/>
				<div class="text">{{ t('components.setWindow-property-gridGapX.label') }}</div
				><NumberVar id="setWindow-property-gridGapX" min="0" max="1000" unit="px" />
				<div class="text">{{ t('components.setWindow-property-gridGapY.label') }}</div
				><NumberVar id="setWindow-property-gridGapY" min="0" max="1000" unit="px" />
				<div class="text">{{ t('components.setWindow-property-paddingX.label') }}</div
				><NumberVar id="setWindow-property-paddingX" min="0" max="1000" unit="px" />
				<div class="text">{{ t('components.setWindow-property-paddingY.label') }}</div
				><NumberVar id="setWindow-property-paddingY" min="0" max="1000" unit="px" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
