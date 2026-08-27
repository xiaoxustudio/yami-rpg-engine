<template>
	<WindowFrame id="setElement" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setElement-element" type="element" @input="onElement" />
			<div class="text">Operation</div>
			<SelectBox id="setElement-operation" v-model="form.operation" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetElementCommandSchema } from '@app/composables/commands/useSetElementCommandSchema';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetElementCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.setElement');
	$('#setElement-operation')?.loadItems?.([
		{ name: get('hide') || 'Hide', value: 'hide' },
		{ name: get('show') || 'Show', value: 'show' },
		{
			name: get('disable-pointer-events') || 'Disable Pointer Events',
			value: 'disable-pointer-events'
		},
		{
			name: get('enable-pointer-events') || 'Enable Pointer Events',
			value: 'enable-pointer-events'
		},
		{ name: get('skip-pointer-events') || 'Skip Pointer Events', value: 'skip-pointer-events' },
		{ name: get('move-to-first') || 'Move to First', value: 'move-to-first' },
		{ name: get('move-to-last') || 'Move to Last', value: 'move-to-last' }
	]);
});
</script>
