<template>
	<WindowFrame id="setShortcut" :ref="controlRef('setShortcut')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setShortcut.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setShortcut-actor.label') }}</div>
			<CustomBox
				id="setShortcut-actor"
				:ref="controlRef('setShortcut-actor')"
				v-tip="t('components.setShortcut-actor.tip')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setShortcut-operation.label') }}</div>
			<SelectBox
				:label="t('components.setShortcut-operation.label')"
				id="setShortcut-operation"
				v-tip="t('components.setShortcut-operation.tip')"
				:ref="controlRef('setShortcut-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setShortcut-key.label') }}</div>
			<SelectVar
				id="setShortcut-key"
				:ref="controlRef('setShortcut-key')"
				v-tip="t('components.setShortcut-key.tip')"
				v-focus
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setShortcut-key2.label') }}</div>
			<SelectVar
				id="setShortcut-key2"
				v-tip="t('components.setShortcut-key2.tip')"
				:ref="controlRef('setShortcut-key2')"
				v-model="form.key2"
			/>
			<div class="text">{{ t('components.setShortcut-itemId.label') }}</div>
			<FileVar
				id="setShortcut-itemId"
				v-tip="t('components.setShortcut-itemId.tip')"
				:ref="controlRef('setShortcut-itemId')"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">{{ t('components.setShortcut-skillId.label') }}</div>
			<FileVar
				id="setShortcut-skillId"
				v-tip="t('components.setShortcut-skillId.tip')"
				:ref="controlRef('setShortcut-skillId')"
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

import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetShortcutCommandSchema } from '@app/composables/commands/useSetShortcutCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideSetShortcutBridge,
	resetSetShortcutBridge,
	type SetShortcutBridge
} from '@app/composables/set-shortcut-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setShortcut-actor'
	| 'setShortcut-itemId'
	| 'setShortcut-key'
	| 'setShortcut-key2'
	| 'setShortcut-operation'
	| 'setShortcut-skillId'
	| 'setShortcut';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetShortcutCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入时要候选项，但 schema 不该知道控件 id。 */
const bridgeApi: SetShortcutBridge = {
	loadItems: (items) => {
		controls['setShortcut-key']?.loadItems?.(items);
		controls['setShortcut-key2']?.loadItems?.(items);
	}
};

onMounted(() => {
	provideSetShortcutBridge(bridgeApi);
	onUnmounted(() => resetSetShortcutBridge(bridgeApi));
	useLocalizedOptions(
		'setShortcut-operation',
		['set-item-shortcut', 'set-skill-shortcut', 'delete-shortcut', 'swap-shortcuts'],
		(items) => controls['setShortcut-operation']?.loadItems?.(items)
	);
	controls['setShortcut-operation']?.enableHiddenMode?.();
	controls['setShortcut-operation']?.relate?.([
		{
			case: 'set-item-shortcut',
			targets: [controlRoot(controls['setShortcut-itemId'])]
		},
		{
			case: 'set-skill-shortcut',
			targets: [controlRoot(controls['setShortcut-skillId'])]
		},
		{ case: 'swap-shortcuts', targets: [controlRoot(controls['setShortcut-key2'])] }
	]);
});
</script>

<style>
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
