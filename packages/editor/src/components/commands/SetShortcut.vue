<template>
	<WindowFrame id="setShortcut" :ref="registryRef(fieldEls, 'setShortcut')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setShortcut.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setShortcut-actor.label') }}</div>
			<CustomBox
				id="setShortcut-actor"
				:ref="registryRef(fieldEls, 'setShortcut-actor')"
				v-tip="t('components.setShortcut-actor.tip')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setShortcut-operation.label') }}</div>
			<SelectBox
				id="setShortcut-operation"
				v-tip="t('components.setShortcut-operation.tip')"
				:ref="registryRef(fieldEls, 'setShortcut-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setShortcut-key.label') }}</div>
			<SelectVar
				id="setShortcut-key"
				:ref="registryRef(fieldEls, 'setShortcut-key')"
				v-tip="t('components.setShortcut-key.tip')"
				v-focus
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setShortcut-key2.label') }}</div>
			<SelectVar
				id="setShortcut-key2"
				v-tip="t('components.setShortcut-key2.tip')"
				:ref="registryRef(fieldEls, 'setShortcut-key2')"
				v-model="form.key2"
			/>
			<div class="text">{{ t('components.setShortcut-itemId.label') }}</div>
			<FileVar
				id="setShortcut-itemId"
				v-tip="t('components.setShortcut-itemId.tip')"
				:ref="registryRef(fieldEls, 'setShortcut-itemId')"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">{{ t('components.setShortcut-skillId.label') }}</div>
			<FileVar
				id="setShortcut-skillId"
				v-tip="t('components.setShortcut-skillId.tip')"
				:ref="registryRef(fieldEls, 'setShortcut-skillId')"
				v-focus
				type="file"
				filter="skill"
				v-model="form.skillId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetShortcutCommandSchema } from '@app/composables/commands/useSetShortcutCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetShortcutCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setShortcut-operation',
		['set-item-shortcut', 'set-skill-shortcut', 'delete-shortcut', 'swap-shortcuts'],
		(items) => fieldEls.get('setShortcut-operation')?.loadItems?.(items)
	);
	fieldEls
		.get('setShortcut-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'set-item-shortcut',
				targets: [fieldEls.get('setShortcut-itemId')]
			},
			{
				case: 'set-skill-shortcut',
				targets: [fieldEls.get('setShortcut-skillId')]
			},
			{ case: 'swap-shortcuts', targets: [fieldEls.get('setShortcut-key2')] }
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setShortcut {
	width: 324px;
	height: 170px;
}

#setShortcut-confirm {
	right: 108px;
	bottom: 10px;
}

#setShortcut-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
