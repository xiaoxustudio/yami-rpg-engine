<template>
	<WindowFrame ref="frame" id="objectGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.objectGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.objectGetter-type.label') }}</div>
			<SelectBox
				id="objectGetter-type"
				:ref="registryRef(composableEls, 'objectGetter-type')"
				v-tip="t('components.objectGetter-type.tip')"
			/>
			<div class="text">{{ t('components.objectGetter-presetId.label') }}</div>
			<CustomBox
				id="objectGetter-presetId"
				:ref="registryRef(composableEls, 'objectGetter-presetId')"
				v-tip="t('components.objectGetter-presetId.tip')"
				type="preset-object"
				filter="any"
			/>
			<div class="text">{{ t('components.objectGetter-variable.label') }}</div>
			<CustomBox
				id="objectGetter-variable"
				:ref="registryRef(composableEls, 'objectGetter-variable')"
				v-tip="t('components.objectGetter-variable.tip')"
				type="variable"
				filter="object"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { registryElement, registryRef, registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { ObjectGetter } from '@app/commands/accessors/preset-accessor-factory.ts';
import {
	useObjectGetterWindow,
	type PresetGetterForm
} from '@app/composables/usePresetGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { attachElementApi } from '@app/utils/attach-element-api';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const objectGetter = useObjectGetterWindow();
const form = objectGetter.form;

const setForm = (data: Partial<PresetGetterForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = registryElement<HTMLElement & { write?: (value: unknown) => void }>(
			composableEls,
			id
		);
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): PresetGetterForm => {
	const data = { ...form } as PresetGetterForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = registryElement<HTMLElement & { read?: () => unknown }>(composableEls, id);
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof PresetGetterForm> = {
	'objectGetter-type': 'type',
	'objectGetter-presetId': 'presetId',
	'objectGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	ObjectGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	registerElement(composableEls, 'objectGetter', frame.value);
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		on(el, 'closed', () => objectGetter.onWindowClosed());
	}
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#objectGetter {
	width: 324px;
	height: 122px;
}

#objectGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#objectGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
