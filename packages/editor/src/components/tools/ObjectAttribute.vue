<template>
	<WindowFrame id="object-attribute" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.object-attribute.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.object-attribute-key.label') }}</div>
			<SelectBox id="object-attribute-key" v-model="form.key" @write="onKeyWrite" />
			<div class="text">{{ t('components.object-attribute-boolean-value.label') }}</div>
			<SelectBox id="object-attribute-boolean-value" v-model="form.booleanValue" />
			<div class="text">{{ t('components.object-attribute-number-value.label') }}</div>
			<NumberBox
				id="object-attribute-number-value"
				min="-1000000000"
				max="1000000000"
				decimals="6"
				v-model="form.numberValue"
			/>
			<div class="text">{{ t('components.object-attribute-string-value.label') }}</div>
			<TextArea
				id="object-attribute-string-value"
				menu="tag-localization"
				v-model="form.stringValue"
			/>
			<div class="text">{{ t('components.object-attribute-enum-value.label') }}</div>
			<SelectBox id="object-attribute-enum-value" v-model="form.enumValue" />
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
import NumberBox from '@app/components/common/NumberBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { AttributeListInterface, form } from '@app/tools/property-list';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const onKeyWrite = (value: unknown) => {
	AttributeListInterface?.keyWrite?.({ value });
};
const onConfirm = () => {
	AttributeListInterface?.target?.save?.();
};

onMounted(() => {});
</script>
