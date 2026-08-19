<template>
<WindowFrame id="changeActorState" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.changeActorState.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorState-actor" type="actor" @input="onActor" /><div class="text">Operation</div><SelectBox id="changeActorState-operation" v-model="form.operation" /><div class="text">State</div
			><CustomBox id="changeActorState-stateId" type="file" filter="state" @input="onStateId" /><div class="text">State</div><CustomBox id="changeActorState-state" type="state" @input="onState" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorStateCommandSchema } from '@app/composables/commands/useChangeActorStateCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorStateCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onStateId = (value: unknown) => {
	form.stateId = value;
};

const onState = (value: unknown) => {
	form.state = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.changeActorState');
	$('#changeActorState-operation')?.loadItems?.([
		{ name: get('add') || 'Add', value: 'add' },
		{ name: get('remove') || 'Remove', value: 'remove' },
		{ name: get('remove-instance') || 'Remove Instance', value: 'remove-instance' }
	]);
	$('#changeActorState-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['add', 'remove'],
				targets: [$('#changeActorState-stateId')]
			},
			{
				case: 'remove-instance',
				targets: [$('#changeActorState-state')]
			}
		]);
});
</script>
