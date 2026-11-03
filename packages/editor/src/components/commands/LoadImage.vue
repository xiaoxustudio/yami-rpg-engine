<template>
	<WindowFrame id="loadImage" :ref="controlRef('loadImage')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loadImage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.loadImage-element.label') }}</div>
			<CustomBox
				id="loadImage-element"
				:ref="controlRef('loadImage-element')"
				v-tip="t('components.loadImage-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.loadImage-type.label') }}</div>
			<SelectBox
				:label="t('components.loadImage-type.label')"
				id="loadImage-type"
				v-tip="t('components.loadImage-type.tip')"
				:ref="controlRef('loadImage-type')"
				v-model="form.type"
			/>
			<div class="text">{{ t('components.loadImage-actor.label') }}</div>
			<CustomBox
				id="loadImage-actor"
				v-tip="t('components.loadImage-actor.tip')"
				:ref="controlRef('loadImage-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.loadImage-skill.label') }}</div>
			<CustomBox
				id="loadImage-skill"
				v-tip="t('components.loadImage-skill.tip')"
				:ref="controlRef('loadImage-skill')"
				type="skill"
				v-model="form.skill"
			/>
			<div class="text">{{ t('components.loadImage-state.label') }}</div>
			<CustomBox
				id="loadImage-state"
				v-tip="t('components.loadImage-state.tip')"
				:ref="controlRef('loadImage-state')"
				type="state"
				v-model="form.state"
			/>
			<div class="text">{{ t('components.loadImage-equipment.label') }}</div>
			<CustomBox
				id="loadImage-equipment"
				v-tip="t('components.loadImage-equipment.tip')"
				:ref="controlRef('loadImage-equipment')"
				type="equipment"
				v-model="form.equipment"
			/>
			<div class="text">{{ t('components.loadImage-item.label') }}</div>
			<CustomBox
				id="loadImage-item"
				v-tip="t('components.loadImage-item.tip')"
				:ref="controlRef('loadImage-item')"
				type="item"
				v-model="form.item"
			/>
			<div class="text">{{ t('components.loadImage-key.label') }}</div>
			<SelectVar
				id="loadImage-key"
				v-tip="t('components.loadImage-key.tip')"
				:ref="controlRef('loadImage-key')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.loadImage-variable.label') }}</div>
			<CustomBox
				id="loadImage-variable"
				v-tip="t('components.loadImage-variable.tip')"
				:ref="controlRef('loadImage-variable')"
				v-focus
				type="variable"
				filter="string"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoadImageCommandSchema } from '@app/composables/commands/useLoadImageCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideLoadImageBridge,
	resetLoadImageBridge,
	type LoadImageBridge
} from '@app/composables/load-image-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'loadImage-actor'
	| 'loadImage-element'
	| 'loadImage-equipment'
	| 'loadImage-item'
	| 'loadImage-key'
	| 'loadImage-skill'
	| 'loadImage-state'
	| 'loadImage-type'
	| 'loadImage-variable'
	| 'loadImage';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useLoadImageCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入时要候选项，但 schema 不该知道控件 id。 */
const bridgeApi: LoadImageBridge = {
	loadItems: (items) => {
		controls['loadImage-key']?.loadItems?.(items);
	}
};

onMounted(() => {
	provideLoadImageBridge(bridgeApi);
	onUnmounted(() => resetLoadImageBridge(bridgeApi));
	useLocalizedOptions(
		'loadImage-type',
		[
			'actor-portrait',
			'skill-icon',
			'state-icon',
			'equipment-icon',
			'item-icon',
			'shortcut-icon',
			'base64'
		],
		(items) => controls['loadImage-type']?.loadItems?.(items),
		{
			'actor-portrait': 'command.loadImage.actor-portrait',
			'skill-icon': 'command.loadImage.skill-icon',
			'state-icon': 'command.loadImage.state-icon',
			'equipment-icon': 'command.loadImage.equipment-icon',
			'item-icon': 'command.loadImage.item-icon',
			'shortcut-icon': 'command.loadImage.shortcut-icon',
			base64: 'command.loadImage.base64'
		}
	);
	controls['loadImage-type']?.enableHiddenMode?.();
	controls['loadImage-type']?.relate?.([
		{ case: 'actor-portrait', targets: [controlRoot(controls['loadImage-actor'])] },
		{ case: 'skill-icon', targets: [controlRoot(controls['loadImage-skill'])] },
		{ case: 'state-icon', targets: [controlRoot(controls['loadImage-state'])] },
		{
			case: 'equipment-icon',
			targets: [controlRoot(controls['loadImage-equipment'])]
		},
		{ case: 'item-icon', targets: [controlRoot(controls['loadImage-item'])] },
		{
			case: 'shortcut-icon',
			targets: [
				controlRoot(controls['loadImage-actor']),
				controlRoot(controls['loadImage-key'])
			]
		},
		{ case: 'base64', targets: [controlRoot(controls['loadImage-variable'])] }
	]);
});
</script>

<style>
#loadImage {
	width: 324px;
	height: 170px;
}

#loadImage-confirm {
	right: 108px;
	bottom: 10px;
}

#loadImage-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
