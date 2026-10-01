<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileTrigger-animation-grid.label') || 'Animation'
		}}</DetailSummary>
		<div class="detail-grid" id="fileTrigger-animation-grid">
			<div class="text">
				{{ t('components.fileTrigger-animationId.label') || 'Animation' }}
			</div>
			<CustomBox
				id="fileTrigger-animationId"
				v-tip="t('components.fileTrigger-animationId.tip')"
				:model-value="form.animationId"
				type="file"
				filter="animation"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			/>
			<div class="text">{{ t('components.fileTrigger-motion.label') || 'Motion' }}</div>
			<SelectBox
				id="fileTrigger-motion"
				v-tip="t('components.fileTrigger-motion.tip')"
				:ref="registryRef(inspectorEls, 'fileTrigger-motion')"
				v-model="form.motion"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-priority.label') || 'Priority' }}</div>
			<NumberBox
				:label="t('components.fileTrigger-priority.label') || 'Priority'"
				id="fileTrigger-priority"
				v-tip="t('components.fileTrigger-priority.tip')"
				v-model="form.priority"
				min="-100"
				max="100"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-offsetY.label') || 'Offset Y' }}</div>
			<NumberBox
				:label="t('components.fileTrigger-offsetY.label') || 'Offset Y'"
				id="fileTrigger-offsetY"
				v-tip="t('components.fileTrigger-offsetY.tip')"
				v-model="form.offsetY"
				min="-100"
				max="100"
				unit="px"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileTrigger-rotatable.label') || 'Rotatable' }}</div>
			<SelectBox
				id="fileTrigger-rotatable"
				v-tip="t('components.fileTrigger-rotatable.tip')"
				ref="elRotatable"
				v-model="form.rotatable"
				@input="onParamInput"
			/>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import { Inspector } from '@app/inspector/inspector.ts';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { fileTriggerContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(fileTriggerContextKey)!;

const elRotatable = ref<InstanceType<typeof SelectBox> | null>(null);

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.fileTrigger?.animationIdWrite?.({ value });
};

onMounted(() => {
	elRotatable.value?.loadItems([
		{
			name: t('components.fileTrigger-rotatable.options.true.name'),
			tip: t('components.fileTrigger-rotatable.options.true.tip'),
			value: true
		},
		{
			name: t('components.fileTrigger-rotatable.options.false.name'),
			tip: t('components.fileTrigger-rotatable.options.false.tip'),
			value: false
		}
	]);
});
</script>
