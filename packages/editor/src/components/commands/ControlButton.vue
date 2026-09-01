<template>
	<WindowFrame id="controlButton" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.controlButton.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="controlButton-operation" v-focus v-model="form.operation" />
			<div class="text">Element</div>
			<CustomBox id="controlButton-element" type="element" v-model="form.element" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useControlButtonCommandSchema } from '@app/composables/commands/useControlButtonCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useControlButtonCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#controlButton-operation')?.loadItems?.([
		{
			name: t('command.controlButton.select-default') || 'Select Default Button',
			value: 'select-default'
		},
		{ name: t('command.controlButton.select') || 'Select Button', value: 'select' },
		{ name: t('command.controlButton.hover-mode') || 'Display Hover Mode', value: 'hover-mode' },
		{
			name: t('command.controlButton.active-mode') || 'Display Active Mode',
			value: 'active-mode'
		},
		{
			name: t('command.controlButton.normal-mode') || 'Restore Display Mode',
			value: 'normal-mode'
		}
	]);
	$('#controlButton-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['select', 'hover-mode', 'active-mode', 'normal-mode'],
				targets: [$('#controlButton-element')]
			}
		]);
});
</script>
