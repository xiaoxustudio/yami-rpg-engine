<template>
	<div class="text">{{ t('components.uiWindow-overflow.label') || 'Overflow' }}</div>
	<SelectBox
		:label="t('components.uiWindow-overflow.label') || 'Overflow'"
		ref="elOverflow"
		id="uiWindow-overflow"
		v-tip="t('components.uiWindow-overflow.tip')"
		v-model="form.overflow"
		@input="onParamInput"
	></SelectBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, onUnmounted } from 'vue';
import { uiWindowPageNodes } from '@app/composables/inspector-page-nodes';
import { useI18n } from 'vue-i18n';
import SelectBox from '@app/components/common/SelectBox.vue';
import { uiWindowContextKey } from './context.ts';

const { t } = useI18n();

const { dispose } = uiWindowPageNodes.scoped();
onUnmounted(dispose);
const { form, onParamInput } = inject(uiWindowContextKey)!;

const elOverflow = ref<InstanceType<typeof SelectBox> | null>(null);

onMounted(() => {
	uiWindowPageNodes.set('overflow', elOverflow.value?.root ?? null);
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
