<template>
	<WindowFrame id="renderOutline" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.renderOutline.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="renderOutline-operation" v-model="form.operation" />
			<div class="text">Actor</div>
			<CustomBox id="renderOutline-actor" type="actor" @input="onActor" />
			<div class="text">Color</div>
			<ColorBox id="renderOutline-color" v-model="form.color" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRenderOutlineCommandSchema } from '@app/composables/commands/useRenderOutlineCommandSchema';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useRenderOutlineCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.renderOutline');
	$('#renderOutline-operation')?.loadItems?.([
		{ name: get('add') || 'Add', value: 'add' },
		{ name: get('remove') || 'Remove', value: 'remove' },
		{ name: get('reset') || 'Reset', value: 'reset' }
	]);
	$('#renderOutline-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'add',
				targets: [$('#renderOutline-actor'), $('#renderOutline-color')]
			},
			{ case: 'remove', targets: [$('#renderOutline-actor')] }
		]);
});
</script>
