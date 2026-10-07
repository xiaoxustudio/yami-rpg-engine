<template>
	<WindowFrame ref="frame" id="ancestorGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.ancestorGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.ancestorGetter-type.label') }}</div>
			<SelectBox
				:label="t('components.ancestorGetter-type.label')"
				id="ancestorGetter-type"
				v-tip="t('components.ancestorGetter-type.tip')"
				:ref="fieldRef('ancestorGetter-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.ancestorGetter-presetId.label') }}</div>
			<CustomBox
				id="ancestorGetter-presetId"
				v-tip="t('components.ancestorGetter-presetId.tip')"
				:ref="fieldRef('ancestorGetter-presetId')"
				v-focus
				type="preset-element"
				v-model="form.presetId"
			/>
			<div class="text">{{ t('components.ancestorGetter-variable.label') }}</div>
			<CustomBox
				id="ancestorGetter-variable"
				v-tip="t('components.ancestorGetter-variable.tip')"
				:ref="fieldRef('ancestorGetter-variable')"
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
import { AncestorGetter } from '@app/commands/accessors/ancestor-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useI18n } from 'vue-i18n';
import { useAncestorGetterWindow } from '@app/composables/useAncestorGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const ancestorGetter = useAncestorGetterWindow();
const form = ancestorGetter.form;

const { fields, fieldRef } = createAccessorFields();
AncestorGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	AncestorGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => ancestorGetter.onWindowClosed());
	}
});
</script>

<style>
#ancestorGetter {
	width: 324px;
	height: 146px;
}

#ancestorGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#ancestorGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
