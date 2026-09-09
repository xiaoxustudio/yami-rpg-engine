<template>
	<WindowFrame id="object-attribute" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.object-attribute.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.object-attribute-key.label') }}</div>
			<SelectBox id="object-attribute-key" v-focus v-model="form.key" @write="onKeyWrite" />
			<div class="text">{{ t('components.object-attribute-boolean-value.label') }}</div>
			<SelectBox id="object-attribute-boolean-value" v-focus v-model="form.booleanValue" />
			<div class="text">{{ t('components.object-attribute-number-value.label') }}</div>
			<NumberBox
				id="object-attribute-number-value"
				v-focus
				min="-1000000000"
				max="1000000000"
				decimals="6"
				v-model="form.numberValue"
			/>
			<div class="text">{{ t('components.object-attribute-string-value.label') }}</div>
			<TextArea
				id="object-attribute-string-value"
				v-focus
				menu="tag-localization"
				v-model="form.stringValue"
			/>
			<div class="text">{{ t('components.object-attribute-enum-value.label') }}</div>
			<SelectBox id="object-attribute-enum-value" v-focus v-model="form.enumValue" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { AttributeListInterface, form } from '@app/tools/property-list';

const { t } = useI18n();

const onKeyWrite = (value: unknown) => {
	AttributeListInterface?.keyWrite?.({ value } as { value: string });
};
const onConfirm = () => {
	AttributeListInterface?.target?.save?.();
};

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#object-attribute {
	width: 324px;
	height: 194px;
}

#object-attribute-string-value {
	height: 92px;
}

#object-attribute-confirm {
	right: 108px;
	bottom: 10px;
}

#object-attribute-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

