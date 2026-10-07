<template>
	<WindowFrame id="object-attribute" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.object-attribute.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.object-attribute-key.label') }}</div>
			<SelectBox
				:label="t('components.object-attribute-key.label')"
				id="object-attribute-key"
				v-tip="t('components.object-attribute-key.tip')"
				:ref="registryRef(objectAttributeEls, 'object-attribute-key')"
				v-focus
				v-model="form.key"
				@write="onKeyWrite"
			/>
			<div class="text">{{ t('components.object-attribute-boolean-value.label') }}</div>
			<SelectBox
				:label="t('components.object-attribute-boolean-value.label')"
				id="object-attribute-boolean-value"
				v-tip="t('components.object-attribute-boolean-value.tip')"
				:ref="registryRef(objectAttributeEls, 'object-attribute-boolean-value')"
				v-focus
				v-model="form.booleanValue"
			/>
			<div class="text">{{ t('components.object-attribute-number-value.label') }}</div>
			<NumberBox
				:label="t('components.object-attribute-number-value.label')"
				id="object-attribute-number-value"
				v-tip="t('components.object-attribute-number-value.tip')"
				:ref="registryRef(objectAttributeEls, 'object-attribute-number-value')"
				v-focus
				min="-1000000000"
				max="1000000000"
				decimals="6"
				v-model="form.numberValue"
			/>
			<div class="text">{{ t('components.object-attribute-string-value.label') }}</div>
			<TextArea
				:label="t('components.object-attribute-string-value.label')"
				id="object-attribute-string-value"
				v-tip="t('components.object-attribute-string-value.tip')"
				:ref="registryRef(objectAttributeEls, 'object-attribute-string-value')"
				v-focus
				menu="tag-localization"
				v-model="form.stringValue"
			/>
			<div class="text">{{ t('components.object-attribute-enum-value.label') }}</div>
			<SelectBox
				:label="t('components.object-attribute-enum-value.label')"
				id="object-attribute-enum-value"
				v-tip="t('components.object-attribute-enum-value.tip')"
				:ref="registryRef(objectAttributeEls, 'object-attribute-enum-value')"
				v-focus
				v-model="form.enumValue"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { YamiElement } from '@app/types/element-api';
import { objectAttributeEls } from '@app/tools/property-list';
import { registryRef } from '@app/utils/element-registry';
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
	(AttributeListInterface?.target as YamiElement | undefined)?.save?.();
};

onMounted(() => {});
</script>

<style>
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
