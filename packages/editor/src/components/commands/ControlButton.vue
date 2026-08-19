<template>
	<WindowFrame id="controlButton" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.controlButton.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="controlButton-operation" v-model="form.operation" />
				<div class="text">Element</div><CustomBox id="controlButton-element" type="element" @input="onElement" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useControlButtonCommandSchema } from '@app/composables/commands/useControlButtonCommandSchema';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useControlButtonCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.controlButton');
	$('#controlButton-operation')?.loadItems?.([
		{ name: get('select-default') || 'Select Default Button', value: 'select-default' },
		{ name: get('select') || 'Select Button', value: 'select' },
		{ name: get('hover-mode') || 'Display Hover Mode', value: 'hover-mode' },
		{ name: get('active-mode') || 'Display Active Mode', value: 'active-mode' },
		{ name: get('normal-mode') || 'Restore Display Mode', value: 'normal-mode' }
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
