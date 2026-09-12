<template>
	<WindowFrame id="setShortcut" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setShortcut.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="setShortcut-actor"
				v-tip="t('components.setShortcut-actor.tip')" type="actor" v-model="form.actor" />
			<div class="text">Operation</div>
			<SelectBox id="setShortcut-operation"
				v-tip="t('components.setShortcut-operation.tip')"
				:ref="registryRef(fieldEls, 'setShortcut-operation')" v-focus v-model="form.operation" />
			<div class="text">Shortcut Key</div>
			<SelectVar id="setShortcut-key"
				v-tip="t('components.setShortcut-key.tip')" v-focus v-model="form.key" />
			<div class="text">Shortcut Key 2</div>
			<SelectVar id="setShortcut-key2"
				v-tip="t('components.setShortcut-key2.tip')"
				:ref="registryRef(fieldEls, 'setShortcut-key2')" v-model="form.key2" />
			<div class="text">Item</div>
			<FileVar id="setShortcut-itemId"
				v-tip="t('components.setShortcut-itemId.tip')"
				:ref="registryRef(fieldEls, 'setShortcut-itemId')" v-focus type="file" filter="item" v-model="form.itemId" />
			<div class="text">Skill</div>
			<FileVar id="setShortcut-skillId"
				v-tip="t('components.setShortcut-skillId.tip')"
				:ref="registryRef(fieldEls, 'setShortcut-skillId')" v-focus type="file" filter="skill" v-model="form.skillId" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	fieldEls.get('setShortcut-operation')?.loadItems?.([
		{ name: 'Set Item Shortcut', value: 'set-item-shortcut' },
		{ name: 'Set Skill Shortcut', value: 'set-skill-shortcut' },
		{ name: 'Delete Shortcut', value: 'delete-shortcut' },
		{ name: 'Swap Shortcuts', value: 'swap-shortcuts' }
	]);
	fieldEls.get('setShortcut-operation')
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
