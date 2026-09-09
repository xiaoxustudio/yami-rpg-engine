<template>
	<WindowFrame id="setShortcut" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setShortcut.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="setShortcut-actor" type="actor" v-model="form.actor" />
			<div class="text">Operation</div>
			<SelectBox id="setShortcut-operation" v-focus v-model="form.operation" />
			<div class="text">Shortcut Key</div>
			<SelectVar id="setShortcut-key" v-focus v-model="form.key" />
			<div class="text">Shortcut Key 2</div>
			<SelectVar id="setShortcut-key2" v-model="form.key2" />
			<div class="text">Item</div>
			<FileVar id="setShortcut-itemId" v-focus type="file" filter="item" v-model="form.itemId" />
			<div class="text">Skill</div>
			<FileVar id="setShortcut-skillId" v-focus type="file" filter="skill" v-model="form.skillId" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetShortcutCommandSchema } from '@app/composables/commands/useSetShortcutCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#setShortcut-operation')?.loadItems?.([
		{ name: 'Set Item Shortcut', value: 'set-item-shortcut' },
		{ name: 'Set Skill Shortcut', value: 'set-skill-shortcut' },
		{ name: 'Delete Shortcut', value: 'delete-shortcut' },
		{ name: 'Swap Shortcuts', value: 'swap-shortcuts' }
	]);
	$('#setShortcut-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'set-item-shortcut',
				targets: [$('#setShortcut-itemId')]
			},
			{
				case: 'set-skill-shortcut',
				targets: [$('#setShortcut-skillId')]
			},
			{ case: 'swap-shortcuts', targets: [$('#setShortcut-key2')] }
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
