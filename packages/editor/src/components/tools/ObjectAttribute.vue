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
				ref="keyRef"
				v-focus
				v-model="form.key"
				@write="onKeyWrite"
			/>
			<div class="text">{{ t('components.object-attribute-boolean-value.label') }}</div>
			<SelectBox
				:label="t('components.object-attribute-boolean-value.label')"
				id="object-attribute-boolean-value"
				v-tip="t('components.object-attribute-boolean-value.tip')"
				ref="booleanRef"
				v-focus
				v-model="form.booleanValue"
			/>
			<div class="text">{{ t('components.object-attribute-number-value.label') }}</div>
			<NumberBox
				:label="t('components.object-attribute-number-value.label')"
				id="object-attribute-number-value"
				v-tip="t('components.object-attribute-number-value.tip')"
				ref="numberRef"
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
				ref="stringRef"
				v-focus
				menu="tag-localization"
				v-model="form.stringValue"
			/>
			<div class="text">{{ t('components.object-attribute-enum-value.label') }}</div>
			<SelectBox
				:label="t('components.object-attribute-enum-value.label')"
				id="object-attribute-enum-value"
				v-tip="t('components.object-attribute-enum-value.tip')"
				ref="enumRef"
				v-focus
				v-model="form.enumValue"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	provideObjectAttribute,
	resetObjectAttribute,
	type ObjectAttributeApi
} from '@app/composables/object-attribute-bridge';
import { controlRoot, toControl } from '@app/composables/control-refs';
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
	(AttributeListInterface?.target as { save?(): void } | undefined)?.save?.();
};

onMounted(() => {});

const keyRef = ref<InstanceType<typeof SelectBox> | null>(null);
const booleanRef = ref<InstanceType<typeof SelectBox> | null>(null);
const numberRef = ref<InstanceType<typeof NumberBox> | null>(null);
const stringRef = ref<InstanceType<typeof TextArea> | null>(null);
const enumRef = ref<InstanceType<typeof SelectBox> | null>(null);

const controlsOf = (): Record<string, unknown> => ({
	key: keyRef.value,
	boolean: booleanRef.value,
	number: numberRef.value,
	string: stringRef.value,
	enum: enumRef.value
});

const bridgeApi: ObjectAttributeApi = {
	control: (name) => toControl(controlsOf()[name] ?? null),
	elementsOf: (names) =>
		names
			.map((name) => controlRoot(toControl(controlsOf()[name] ?? null)))
			.filter((element): element is HTMLElement => element != null)
};

onMounted(() => {
	provideObjectAttribute(bridgeApi);
	onUnmounted(() => resetObjectAttribute(bridgeApi));
});
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
