<template>
	<WindowFrame
		id="changeActorState"
		:ref="registryRef(fieldEls, 'changeActorState')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.changeActorState.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorState-actor.label') }}</div>
			<CustomBox
				id="changeActorState-actor"
				:ref="registryRef(fieldEls, 'changeActorState-actor')"
				v-tip="t('components.changeActorState-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeActorState-operation.label') }}</div>
			<SelectBox
				:label="t('components.changeActorState-operation.label')"
				id="changeActorState-operation"
				v-tip="t('components.changeActorState-operation.tip')"
				:ref="registryRef(fieldEls, 'changeActorState-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.changeActorState-stateId.label') }}</div>
			<CustomBox
				id="changeActorState-stateId"
				v-tip="t('components.changeActorState-stateId.tip')"
				:ref="registryRef(fieldEls, 'changeActorState-stateId')"
				v-focus
				type="file"
				filter="state"
				v-model="form.stateId"
			/>
			<div class="text">{{ t('components.changeActorState-state.label') }}</div>
			<CustomBox
				id="changeActorState-state"
				v-tip="t('components.changeActorState-state.tip')"
				:ref="registryRef(fieldEls, 'changeActorState-state')"
				type="state"
				v-model="form.state"
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
import { useChangeActorStateCommandSchema } from '@app/composables/commands/useChangeActorStateCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorStateCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'changeActorState-operation',
		['add', 'remove', 'remove-instance'],
		(items) => fieldEls.get('changeActorState-operation')?.loadItems?.(items),
		{
			add: 'command.changeActorState.add',
			remove: 'command.changeActorState.remove',
			'remove-instance': 'command.changeActorState.remove-instance'
		}
	);
	fieldEls
		.get('changeActorState-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['add', 'remove'],
				targets: [fieldEls.get('changeActorState-stateId')]
			},
			{
				case: 'remove-instance',
				targets: [fieldEls.get('changeActorState-state')]
			}
		]);
});
</script>

<style>
#changeActorState {
	width: 324px;
	height: 146px;
}

#changeActorState-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorState-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
