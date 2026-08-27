<template>
	<WindowFrame id="deleteElement" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.deleteElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="deleteElement-operation" v-model="form.operation" />
			<div class="text">Element</div>
			<CustomBox id="deleteElement-element" type="element" @input="onElement" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDeleteElementCommandSchema } from '@app/composables/commands/useDeleteElementCommandSchema';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useDeleteElementCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.deleteElement');
	$('#deleteElement-operation')?.loadItems?.([
		{ name: 'Delete Element', value: 'delete-element' },
		{ name: get('children') || 'Delete Children', value: 'delete-children' },
		{ name: get('all-elements') || 'Delete All', value: 'delete-all' }
	]);
	$('#deleteElement-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['delete-element', 'delete-children'],
				targets: [$('#deleteElement-element')]
			}
		]);
});
</script>
