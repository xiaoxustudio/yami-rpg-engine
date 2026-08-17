<template>
<WindowFrame id="registerEvent" @confirm="onConfirm">
	<template #title><TitleBar>Register Event<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Target</div
			><SelectBox id="registerEvent-target" @write="onTargetWrite" /> <div class="text">Actor</div
			><CustomBox id="registerEvent-actor" type="actor" /> <div class="text">Element</div
			><CustomBox id="registerEvent-element" type="element" />
			<div class="text">Operation</div
			><SelectBox id="registerEvent-operation" @write="onOperationWrite" />
			<div class="text">Type</div><SelectBox id="registerEvent-type" @write="onTypeWrite" /> <div class="text">Priority</div
			><CheckBox id="registerEvent-priority" class="standard large" />
			<div class="text">Namespace</div
			><CheckBox id="registerEvent-namespace" class="standard large" />
			<div class="text">Tag Name</div><StringVar id="registerEvent-tag" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { $ } from '@app/legacy/util/dom.ts';
import { Local } from '@app/legacy/tools/localization.ts';
import { useRegisterEventCommandSchema } from '@app/composables/commands/useRegisterEventCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { save, targetWrite, operationWrite, typeWrite } = useRegisterEventCommandSchema();

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
	const get = Local.createGetter!('command.registerEvent');
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
		{ name: get('alias.register') || 'Register', value: 'register' },
		{ name: get('alias.unregister') || 'Unregister', value: 'unregister' },
		{ name: get('alias.reset') || 'Reset', value: 'reset' }
	]);
});

</script>
