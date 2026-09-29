<template>
	<div class="text">{{ t('components.uiWindow-overflow.label') || 'Overflow' }}</div>
	<SelectBox
		ref="elOverflow"
		id="uiWindow-overflow"
		v-tip="t('components.uiWindow-overflow.tip')"
		v-model="form.overflow"
		@input="onParamInput"
	></SelectBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import SelectBox from '@app/components/common/SelectBox.vue';
import { uiWindowContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiWindowContextKey)!;

const elOverflow = ref<InstanceType<typeof SelectBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'uiWindow-overflow', elOverflow.value);
	elOverflow.value?.loadItems([
		{
			name: t('components.uiWindow-overflow.options.visible.name'),
			tip: t('components.uiWindow-overflow.options.visible.tip'),
			value: 'visible'
		},
		{
			name: t('components.uiWindow-overflow.options.hidden.name'),
			tip: t('components.uiWindow-overflow.options.hidden.tip'),
			value: 'hidden'
		}
	]);
});
</script>
