<template>
	<WindowFrame id="gameData" @confirm="onConfirm">
		<template #title><TitleBar>Game Data<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="gameData-operation" v-model="form.operation" />
				<div class="text">Index</div><NumberVar id="gameData-index" min="0" max="32" v-model="form.index" />
				<div class="text">Variables</div><TextBox id="gameData-variables" v-model="form.variables" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useGameDataCommandSchema } from '@app/composables/commands/useGameDataCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useGameDataCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.gameData');
	$('#gameData-operation')?.loadItems?.([
		{ name: get('save') || 'Save', value: 'save' },
		{ name: get('load') || 'Load', value: 'load' },
		{ name: get('delete') || 'Delete', value: 'delete' }
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
