<template>
	<WindowFrame id="registerEvent" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.registerEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Target</div>
			<SelectBox id="registerEvent-target" v-focus v-model="form.target" @write="onTargetWrite" />
			<div class="text">Actor</div>
			<CustomBox id="registerEvent-actor" type="actor" v-model="form.actor" />
			<div class="text">Element</div>
			<CustomBox id="registerEvent-element" type="element" v-model="form.element" />
			<div class="text">Operation</div>
			<SelectBox
				id="registerEvent-operation"
				v-model="form.operation"
				@write="onOperationWrite"
			/>
			<div class="text">Type</div>
			<SelectBox id="registerEvent-type" v-model="form.type" @write="onTypeWrite" />
			<div class="text">Priority</div>
			<CheckBox id="registerEvent-priority" class="standard large" v-model="form.priority" />
			<div class="text">Namespace</div>
			<CheckBox
				id="registerEvent-namespace"
				class="standard large"
				v-model="form.namespace"
			/>
			<div class="text">Tag Name</div>
			<StringVar id="registerEvent-tag" v-focus v-model="form.tag" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { useRegisterEventCommandSchema } from '@app/composables/commands/useRegisterEventCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, targetWrite, operationWrite, typeWrite } = useRegisterEventCommandSchema();

const onTargetWrite = (value: unknown) => {
	targetWrite?.({ value: value as string });
};
const onOperationWrite = () => {
	operationWrite?.();
};
const onTypeWrite = () => {
	typeWrite?.();
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#registerEvent-target')?.loadItems?.([
		{ name: 'Global', value: 'global' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Element', value: 'element' }
	]);
	$('#registerEvent-target')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor', targets: [$('#registerEvent-actor')] },
			{ case: 'element', targets: [$('#registerEvent-element')] }
		]);
	$('#registerEvent-operation')?.loadItems?.([
		{ name: t('command.registerEvent.alias.register') || 'Register', value: 'register' },
		{ name: t('command.registerEvent.alias.unregister') || 'Unregister', value: 'unregister' },
		{ name: t('command.registerEvent.alias.reset') || 'Reset', value: 'reset' }
	]);
});
</script>
