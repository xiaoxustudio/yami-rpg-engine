<template>
	<WindowFrame id="gameData" :ref="registryRef(fieldEls, 'gameData')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.gameData.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.gameData-operation.label') }}</div>
			<SelectBox
				:label="t('components.gameData-operation.label')"
				id="gameData-operation"
				v-tip="t('components.gameData-operation.tip')"
				:ref="registryRef(fieldEls, 'gameData-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.gameData-index.label') }}</div>
			<NumberVar
				id="gameData-index"
				v-tip="t('components.gameData-index.tip')"
				:ref="registryRef(fieldEls, 'gameData-index')"
				min="0"
				max="32"
				v-model="form.index"
			/>
			<div class="text">{{ t('components.gameData-variables.label') }}</div>
			<TextBox
				:label="t('components.gameData-variables.label')"
				id="gameData-variables"
				:placeholder="t('components.gameData-variables.placeholder')"
				v-tip="t('components.gameData-variables.tip')"
				:ref="registryRef(fieldEls, 'gameData-variables')"
				v-model="variables"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameDataCommandSchema } from '@app/composables/commands/useGameDataCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useGameDataCommandSchema();

const variables = computed({
	get: () => form.variables as string,
	set: (value) => {
		form.variables = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'gameData-operation',
		['save', 'load', 'delete'],
		(items) => fieldEls.get('gameData-operation')?.loadItems?.(items),
		{
			save: 'command.gameData.save',
			load: 'command.gameData.load',
			delete: 'command.gameData.delete'
		}
	);
	fieldEls
		.get('gameData-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'save',
				targets: [fieldEls.get('gameData-index'), fieldEls.get('gameData-variables')]
			},
			{ case: ['load', 'delete'], targets: [fieldEls.get('gameData-index')] }
		]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#gameData {
	width: 324px;
	height: 146px;
}

#gameData-confirm {
	right: 108px;
	bottom: 10px;
}

#gameData-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
