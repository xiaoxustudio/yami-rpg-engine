<template>
	<WindowFrame ref="frame" id="lightGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.lightGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.lightGetter-type.label') }}</div>
			<SelectBox
				id="lightGetter-type"
				:ref="registryRef(composableEls, 'lightGetter-type')"
				v-tip="t('components.lightGetter-type.tip')"
			/>
			<div class="text">{{ t('components.lightGetter-presetId.label') }}</div>
			<CustomBox
				id="lightGetter-presetId"
				:ref="registryRef(composableEls, 'lightGetter-presetId')"
				v-tip="t('components.lightGetter-presetId.tip')"
				type="preset-object"
				filter="light"
			/>
			<div class="text">{{ t('components.lightGetter-variable.label') }}</div>
			<CustomBox
				id="lightGetter-variable"
				:ref="registryRef(composableEls, 'lightGetter-variable')"
				v-tip="t('components.lightGetter-variable.tip')"
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
import { LightGetter } from '@app/commands/accessors/preset-accessor-factory.ts';
import {
	useLightGetterWindow,
	type PresetGetterForm
} from '@app/composables/usePresetGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { attachElementApi } from '@app/utils/attach-element-api';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const lightGetter = useLightGetterWindow();
const form = lightGetter.form;

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
	'lightGetter-type': 'type',
	'lightGetter-presetId': 'presetId',
	'lightGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	LightGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	registerElement(composableEls, 'lightGetter', frame.value);
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		on(el, 'closed', () => lightGetter.onWindowClosed());
	}
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#lightGetter {
	width: 324px;
	height: 122px;
}

#lightGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#lightGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
