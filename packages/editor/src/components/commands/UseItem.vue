<template>
	<WindowFrame id="useItem" :ref="controlRef('useItem')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.useItem.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.useItem-actor.label') }}</div>
			<CustomBox
				id="useItem-actor"
				:ref="controlRef('useItem-actor')"
				v-tip="t('components.useItem-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.useItem-mode.label') }}</div>
			<SelectBox
				:label="t('components.useItem-mode.label')"
				id="useItem-mode"
				v-tip="t('components.useItem-mode.tip')"
				:ref="controlRef('useItem-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.useItem-key.label') }}</div>
			<SelectBox
				:label="t('components.useItem-key.label')"
				id="useItem-key"
				v-tip="t('components.useItem-key.tip')"
				:ref="controlRef('useItem-key')"
				v-focus
				v-model="form.key"
			/>
			<div class="text">{{ t('components.useItem-itemId.label') }}</div>
			<CustomBox
				id="useItem-itemId"
				v-tip="t('components.useItem-itemId.tip')"
				:ref="controlRef('useItem-itemId')"
				v-focus
				type="file"
				filter="item"
				v-model="form.itemId"
			/>
			<div class="text">{{ t('components.useItem-item.label') }}</div>
			<CustomBox
				id="useItem-item"
				v-tip="t('components.useItem-item.tip')"
				:ref="controlRef('useItem-item')"
				type="item"
				v-model="form.item"
			/>
			<div class="text">{{ t('components.useItem-wait.label') }}</div>
			<SelectBox
				:label="t('components.useItem-wait.label')"
				id="useItem-wait"
				:ref="controlRef('useItem-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUseItemCommandSchema } from '@app/composables/commands/useUseItemCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideUseItemBridge,
	resetUseItemBridge,
	type UseItemBridge
} from '@app/composables/use-item-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'useItem-actor'
	| 'useItem-item'
	| 'useItem-itemId'
	| 'useItem-key'
	| 'useItem-mode'
	| 'useItem-wait'
	| 'useItem';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useUseItemCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入时要候选项，但 schema 不该知道控件 id。 */
const bridgeApi: UseItemBridge = {
	loadItems: (items) => {
		controls['useItem-key']?.loadItems?.(items);
	}
};

onMounted(() => {
	provideUseItemBridge(bridgeApi);
	onUnmounted(() => resetUseItemBridge(bridgeApi));
	useLocalizedOptions('useItem-mode', ['by-key', 'by-id', 'by-item'], (items) =>
		controls['useItem-mode']?.loadItems?.(items)
	);
	controls['useItem-mode']?.enableHiddenMode?.();
	controls['useItem-mode']?.relate?.([
		{ case: 'by-key', targets: [controlRoot(controls['useItem-key'])] },
		{ case: 'by-id', targets: [controlRoot(controls['useItem-itemId'])] },
		{ case: 'by-item', targets: [controlRoot(controls['useItem-item'])] }
	]);
	useLocalizedOptions('useItem-wait', [true, false], (items) =>
		controls['useItem-wait']?.loadItems?.(items)
	);
});
</script>

<style>
#useItem {
	width: 324px;
	height: 170px;
}

#useItem-confirm {
	right: 108px;
	bottom: 10px;
}

#useItem-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
