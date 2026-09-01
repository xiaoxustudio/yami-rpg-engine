<template>
	<WindowFrame id="setElement" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="setElement-element" v-focus type="element" v-model="form.element" />
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
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetElementCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setElement-operation')?.loadItems?.([
		{ name: t('command.setElement.hide') || 'Hide', value: 'hide' },
		{ name: t('command.setElement.show') || 'Show', value: 'show' },
		{
			name: t('command.setElement.disable-pointer-events') || 'Disable Pointer Events',
			value: 'disable-pointer-events'
		},
		{
			name: t('command.setElement.enable-pointer-events') || 'Enable Pointer Events',
			value: 'enable-pointer-events'
		},
		{
			name: t('command.setElement.skip-pointer-events') || 'Skip Pointer Events',
			value: 'skip-pointer-events'
		},
		{
			name: t('command.setElement.move-to-first') || 'Move to First',
			value: 'move-to-first'
		},
		{ name: t('command.setElement.move-to-last') || 'Move to Last', value: 'move-to-last' }
	]);
});
</script>
