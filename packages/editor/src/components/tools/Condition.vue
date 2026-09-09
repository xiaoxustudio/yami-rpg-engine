<template>
	<WindowFrame id="condition" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.condition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.condition-type.label') }}</div>
			<SelectBox id="condition-type" v-focus v-model="form.type" @write="onTypeWrite" />
			<div class="text">{{ t('components.condition-key.label') }}</div>
			<CustomBox
				id="condition-key"
				v-focus
				type="global-variable"
				filter="all"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.condition-boolean-operation.label') }}</div>
			<SelectBox id="condition-boolean-operation" v-model="form.booleanOperation" />
			<div class="text">{{ t('components.condition-boolean-value.label') }}</div>
			<SelectBox id="condition-boolean-value" v-model="form.booleanValue" />
			<div class="text">{{ t('components.condition-number-operation.label') }}</div>
			<SelectBox id="condition-number-operation" v-model="form.numberOperation" />
			<div class="text">{{ t('components.condition-number-value.label') }}</div>
			<NumberBox
				id="condition-number-value"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.numberValue"
			/>
			<div class="text">{{ t('components.condition-string-operation.label') }}</div>
			<SelectBox id="condition-string-operation" v-model="form.stringOperation" />
			<div class="text">{{ t('components.condition-string-value.label') }}</div>
			<TextArea id="condition-string-value" v-model="form.stringValue" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ConditionListInterface, form } from '@app/tools/condition-list.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TextArea from '@app/components/common/TextArea.vue';

const { t } = useI18n();

const onTypeWrite = (value: unknown) => {
	ConditionListInterface?.typeWrite?.({ value } as Event & { value: string });
};
const onConfirm = () => {
	ConditionListInterface?.target?.save?.();
};

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#condition {
	width: 324px;
	height: 194px;
}

#condition-string-value {
	height: 44px;
}

#condition-confirm {
	right: 108px;
	bottom: 10px;
}

#condition-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

