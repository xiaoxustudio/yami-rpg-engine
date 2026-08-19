<template>
	<WindowFrame id="controlDialog" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.controlDialog.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="controlDialog-element" type="element" @input="onElement" />
				<div class="text">Operation</div><SelectBox id="controlDialog-operation" v-model="form.operation" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useControlDialogCommandSchema } from '@app/composables/commands/useControlDialogCommandSchema';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useControlDialogCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.controlDialog');
	$('#controlDialog-operation')?.loadItems?.([
		{ name: get('pause') || 'Pause Printing', value: 'pause' },
		{ name: get('continue') || 'Continue Printing', value: 'continue' },
		{ name: get('print-immediately') || 'Print Immediately', value: 'print-immediately' },
		{ name: get('print-next-page') || 'Print Next Page', value: 'print-next-page' }
	]);
});

</script>
