<template>
	<WindowFrame id="condition" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.condition.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.condition-type.label') }}</div><SelectBox id="condition-type" @write="onTypeWrite" />
			<div class="text">{{ t('components.condition-key.label') }}</div
			><CustomBox id="condition-key" type="global-variable" filter="all" />
			<div class="text">{{ t('components.condition-boolean-operation.label') }}</div><SelectBox id="condition-boolean-operation" />
			<div class="text">{{ t('components.condition-boolean-value.label') }}</div><SelectBox id="condition-boolean-value" />
			<div class="text">{{ t('components.condition-number-operation.label') }}</div><SelectBox id="condition-number-operation" />
				<div class="text">{{ t('components.condition-number-value.label') }}</div
				><NumberBox
					id="condition-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">{{ t('components.condition-string-operation.label') }}</div><SelectBox id="condition-string-operation" />
				<div class="text">{{ t('components.condition-string-value.label') }}</div><TextArea id="condition-string-value" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TextArea from '@app/components/common/TextArea.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const onTypeWrite = (value: string) => {
	ConditionListInterface?.typeWrite?.({ value });
};
const onConfirm = () => {
	ConditionListInterface?.target?.save?.();
};

onMounted(() => {


});
</script>
