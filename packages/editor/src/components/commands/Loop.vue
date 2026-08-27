<template>
	<WindowFrame id="loop" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loop.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Mode</div>
			<SelectBox id="loop-mode" v-model="form.mode" />
			<div class="text">Conditions</div>
			<ParamList id="loop-conditions" v-model="form.conditions" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoopCommandSchema } from '@app/composables/commands/useLoopCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';

const IfCondition = useIfConditionSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save, reset } = useLoopCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#loop-conditions')?.bind?.(IfCondition);
	$('#loop-mode')?.loadItems?.([
		{ name: 'Meet All', value: 'all' },
		{ name: 'Meet Any', value: 'any' }
	]);
	$('#loop')?.on?.('closed', () => {
		reset();
		clear($('#loop-conditions'));
	});
});
</script>
