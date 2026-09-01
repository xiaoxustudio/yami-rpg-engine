<template>
	<WindowFrame id="gameData" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.gameData.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="gameData-operation" v-focus v-model="form.operation" />
			<div class="text">Index</div>
			<NumberVar id="gameData-index" min="0" max="32" v-model="form.index" />
			<div class="text">Variables</div>
			<TextBox id="gameData-variables" v-model="form.variables" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameDataCommandSchema } from '@app/composables/commands/useGameDataCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useGameDataCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#gameData-operation')?.loadItems?.([
		{ name: t('command.gameData.save') || 'Save', value: 'save' },
		{ name: t('command.gameData.load') || 'Load', value: 'load' },
		{ name: t('command.gameData.delete') || 'Delete', value: 'delete' }
	]);
	$('#gameData-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'save',
				targets: [$('#gameData-index'), $('#gameData-variables')]
			},
			{ case: ['load', 'delete'], targets: [$('#gameData-index')] }
		]);
});
</script>
