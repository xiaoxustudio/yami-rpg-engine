<template>
	<WindowFrame id="moveActor" :ref="controlRef('moveActor')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.moveActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.moveActor-actor.label') }}</div>
			<CustomBox
				id="moveActor-actor"
				:ref="controlRef('moveActor-actor')"
				v-tip="t('components.moveActor-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.moveActor-mode.label') }}</div>
			<SelectBox
				:label="t('components.moveActor-mode.label')"
				id="moveActor-mode"
				v-tip="t('components.moveActor-mode.tip')"
				:ref="controlRef('moveActor-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.moveActor-angle.label') }}</div>
			<NumberVar
				id="moveActor-angle"
				v-tip="t('components.moveActor-angle.tip')"
				:ref="controlRef('moveActor-angle')"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			/>
			<div class="text">{{ t('components.moveActor-destination.label') }}</div>
			<CustomBox
				id="moveActor-destination"
				v-tip="t('components.moveActor-destination.tip')"
				:ref="controlRef('moveActor-destination')"
				type="position"
				v-model="form.destination"
			/>
			<div class="text">{{ t('components.moveActor-wait.label') }}</div>
			<SelectBox
				:label="t('components.moveActor-wait.label')"
				id="moveActor-wait"
				:ref="controlRef('moveActor-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMoveActorCommandSchema } from '@app/composables/commands/useMoveActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'moveActor'
	| 'moveActor-actor'
	| 'moveActor-angle'
	| 'moveActor-destination'
	| 'moveActor-mode'
	| 'moveActor-wait';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useMoveActorCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'moveActor-mode',
		['stop', 'keep', 'straight', 'navigate', 'navigate-bypass', 'teleport'],
		(items) => controls['moveActor-mode']?.loadItems?.(items),
		{
			stop: 'command.moveActor.mode.stop',
			keep: 'command.moveActor.mode.keep',
			straight: 'command.moveActor.mode.straight',
			navigate: 'command.moveActor.mode.navigate',
			'navigate-bypass': 'command.moveActor.mode.navigate-bypass',
			teleport: 'command.moveActor.mode.teleport'
		}
	);
	controls['moveActor-mode']?.enableHiddenMode?.();
	controls['moveActor-mode']?.relate?.([
		{ case: 'keep', targets: [controlRoot(controls['moveActor-angle'])] },
		{
			case: ['straight', 'navigate', 'navigate-bypass'],
			targets: [
				controlRoot(controls['moveActor-destination']),
				controlRoot(controls['moveActor-wait'])
			]
		},
		{ case: 'teleport', targets: [controlRoot(controls['moveActor-destination'])] }
	]);
	useLocalizedOptions('moveActor-wait', [true, false], (items) =>
		controls['moveActor-wait']?.loadItems?.(items)
	);
});
</script>

<style>
#moveActor {
	width: 324px;
	height: 170px;
}

#moveActor-confirm {
	right: 108px;
	bottom: 10px;
}

#moveActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
