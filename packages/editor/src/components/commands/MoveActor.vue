<template>
	<WindowFrame id="moveActor" :ref="registryRef(fieldEls, 'moveActor')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.moveActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.moveActor-actor.label') }}</div>
			<CustomBox
				id="moveActor-actor"
				:ref="registryRef(fieldEls, 'moveActor-actor')"
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
				:ref="registryRef(fieldEls, 'moveActor-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.moveActor-angle.label') }}</div>
			<NumberVar
				id="moveActor-angle"
				v-tip="t('components.moveActor-angle.tip')"
				:ref="registryRef(fieldEls, 'moveActor-angle')"
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
				:ref="registryRef(fieldEls, 'moveActor-destination')"
				type="position"
				v-model="form.destination"
			/>
			<div class="text">{{ t('components.moveActor-wait.label') }}</div>
			<SelectBox
				:label="t('components.moveActor-wait.label')"
				id="moveActor-wait"
				:ref="registryRef(fieldEls, 'moveActor-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMoveActorCommandSchema } from '@app/composables/commands/useMoveActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useMoveActorCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'moveActor-mode',
		['stop', 'keep', 'straight', 'navigate', 'navigate-bypass', 'teleport'],
		(items) => fieldEls.get('moveActor-mode')?.loadItems?.(items),
		{
			stop: 'command.moveActor.mode.stop',
			keep: 'command.moveActor.mode.keep',
			straight: 'command.moveActor.mode.straight',
			navigate: 'command.moveActor.mode.navigate',
			'navigate-bypass': 'command.moveActor.mode.navigate-bypass',
			teleport: 'command.moveActor.mode.teleport'
		}
	);
	fieldEls
		.get('moveActor-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'keep', targets: [fieldEls.get('moveActor-angle')] },
			{
				case: ['straight', 'navigate', 'navigate-bypass'],
				targets: [fieldEls.get('moveActor-destination'), fieldEls.get('moveActor-wait')]
			},
			{ case: 'teleport', targets: [fieldEls.get('moveActor-destination')] }
		]);
	useLocalizedOptions('moveActor-wait', [true, false], (items) =>
		fieldEls.get('moveActor-wait')?.loadItems?.(items)
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
