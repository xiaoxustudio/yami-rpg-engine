<template>
	<!-- 设置文本框 - 属性 -->
	<WindowFrame id="setTextBox-property">
		<template #title><TitleBar>{{ t('components.setTextBox-property.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setTextBox-property-key.label') }}</div><SelectBox id="setTextBox-property-key" />
				<div class="text">{{ t('components.setTextBox-property-type.label') }}</div><SelectBox id="setTextBox-property-type" />
				<div class="text">{{ t('components.setTextBox-property-text.label') }}</div><StringVar id="setTextBox-property-text" />
				<div class="text">{{ t('components.setTextBox-property-number.label') }}</div
				><NumberVar
					id="setTextBox-property-number"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">{{ t('components.setTextBox-property-min.label') }}</div
				><NumberVar
					id="setTextBox-property-min"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">{{ t('components.setTextBox-property-max.label') }}</div
				><NumberVar
					id="setTextBox-property-max"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">{{ t('components.setTextBox-property-decimals.label') }}</div
				><NumberBox id="setTextBox-property-decimals" min="0" max="10" />
				<div class="text">{{ t('components.setTextBox-property-color.label') }}</div><ColorBox id="setTextBox-property-color" />
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
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
