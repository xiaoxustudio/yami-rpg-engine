<template>
		<WindowFrame id="setImage-property">
		<template #title><TitleBar>{{ t('components.setImage-property.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setImage-property-key.label') }}</div><SelectBox id="setImage-property-key" />
				<div class="text">{{ t('components.setImage-property-image.label') }}</div
				><CustomBox id="setImage-property-image" type="file" filter="image" />
				<div class="text">{{ t('components.setImage-property-display.label') }}</div><SelectBox id="setImage-property-display" />
				<div class="text">{{ t('components.setImage-property-flip.label') }}</div><SelectBox id="setImage-property-flip" /> <div class="text">{{ t('components.setImage-property-blend.label') }}</div
				><SelectBox id="setImage-property-blend" /> <div class="text">{{ t('components.setImage-property-shiftX.label') }}</div
				><NumberVar
					id="setImage-property-shiftX"
					min="-10000"
					max="10000"
					unit="px"
				/>
				<div class="text">{{ t('components.setImage-property-shiftY.label') }}</div
				><NumberVar
					id="setImage-property-shiftY"
					min="-10000"
					max="10000"
					unit="px"
				/>
				<div class="text">{{ t('components.setImage-property-clip-0.label') }}</div
				><NumberVar id="setImage-property-clip-0" min="0" max="10000" unit="px" />
				<div class="text">{{ t('components.setImage-property-clip-1.label') }}</div
				><NumberVar id="setImage-property-clip-1" min="0" max="10000" unit="px" />
				<div class="text">{{ t('components.setImage-property-clip-2.label') }}</div
				><NumberVar id="setImage-property-clip-2" min="0" max="10000" unit="px" />
				<div class="text">{{ t('components.setImage-property-clip-3.label') }}</div
				><NumberVar id="setImage-property-clip-3" min="0" max="10000" unit="px" />
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
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
