<template>
<WindowFrame id="setShortcut" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.setShortcut.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setShortcut-actor" type="actor" @input="onActor" />
			<div class="text">Operation</div><SelectBox id="setShortcut-operation" v-model="form.operation" />
			<div class="text">Shortcut Key</div><SelectVar id="setShortcut-key" v-model="form.key" />
			<div class="text">Shortcut Key 2</div><SelectVar id="setShortcut-key2" v-model="form.key2" />
			<div class="text">Item</div><FileVar id="setShortcut-itemId" type="file" filter="item" v-model="form.itemId" />
			<div class="text">Skill</div
			><FileVar id="setShortcut-skillId" type="file" filter="skill" v-model="form.skillId" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetShortcutCommandSchema } from '@app/composables/commands/useSetShortcutCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetShortcutCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

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
