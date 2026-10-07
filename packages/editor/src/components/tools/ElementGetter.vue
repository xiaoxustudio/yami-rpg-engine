<template>
	<WindowFrame ref="frame" id="elementGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.elementGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.elementGetter-type.label') }}</div>
			<SelectBox
				:label="t('components.elementGetter-type.label')"
				id="elementGetter-type"
				v-tip="t('components.elementGetter-type.tip')"
				:ref="fieldRef('elementGetter-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.elementGetter-ancestor.label') }}</div>
			<CustomBox
				id="elementGetter-ancestor"
				v-tip="t('components.elementGetter-ancestor.tip')"
				:ref="fieldRef('elementGetter-ancestor')"
				type="ancestor-element"
				v-model="form.ancestor"
			/>
			<div class="text">{{ t('components.elementGetter-presetId.label') }}</div>
			<CustomBox
				id="elementGetter-presetId"
				v-tip="t('components.elementGetter-presetId.tip')"
				:ref="fieldRef('elementGetter-presetId')"
				v-focus
				type="preset-element"
				v-model="form.presetId"
			/>
			<div class="text">{{ t('components.elementGetter-index.label') }}</div>
			<NumberVar
				id="elementGetter-index"
				v-tip="t('components.elementGetter-index.tip')"
				:ref="fieldRef('elementGetter-index')"
				min="0"
				max="10000"
				v-model="form.index"
			/>
			<div class="text">{{ t('components.elementGetter-variable.label') }}</div>
			<CustomBox
				id="elementGetter-variable"
				v-tip="t('components.elementGetter-variable.tip')"
				:ref="fieldRef('elementGetter-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElementGetter } from '@app/commands/accessors/element-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useElementGetterWindow } from '@app/composables/useElementGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const elementGetter = useElementGetterWindow();
const form = elementGetter.form;

const { fields, fieldRef } = createAccessorFields();
ElementGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	ElementGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => elementGetter.onWindowClosed());
	}
});
</script>

<style>
#elementGetter {
	width: 324px;
	height: 146px;
}

#elementGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#elementGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
