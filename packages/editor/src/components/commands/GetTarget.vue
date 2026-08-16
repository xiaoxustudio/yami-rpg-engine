<template>
<WindowFrame id="getTarget" @confirm="onConfirm">
	<template #title><TitleBar>Get Target<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="getTarget-actor" type="actor" @input="onActor" /><div class="text">Selector</div><SelectBox id="getTarget-selector" v-model="form.selector" /><div class="text">Condition</div><SelectBox id="getTarget-condition" v-model="form.condition" /><div class="text">Attribute</div><SelectBox id="getTarget-attribute" v-model="form.attribute" /><div class="text">Attribute 2</div><SelectBox id="getTarget-divisor" v-model="form.divisor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useGetTargetCommandSchema } from '@app/composables/commands/useGetTargetCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useGetTargetCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#getTarget-selector')?.loadItems?.([
		{ name: 'Enemy', value: 'enemy' },
		{ name: 'Friend', value: 'friend' },
		{ name: 'Team Member', value: 'team' },
		{ name: 'Team Member Except Self', value: 'team-except-self' },
		{ name: 'Any Except Self', value: 'any-except-self' },
		{ name: 'Any', value: 'any' }
	]);
	$('#getTarget-condition')?.loadItems?.([
		{ name: 'Max Threat', value: 'max-threat' },
		{ name: 'Nearest', value: 'nearest' },
		{ name: 'Farthest', value: 'farthest' },
		{ name: 'Min Attribute Value', value: 'min-attribute-value' },
		{ name: 'Max Attribute Value', value: 'max-attribute-value' },
		{ name: 'Min Attribute Ratio', value: 'min-attribute-ratio' },
		{ name: 'Max Attribute Ratio', value: 'max-attribute-ratio' },
		{ name: 'Random', value: 'random' }
	]);
	$('#getTarget-condition')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['min-attribute-value', 'max-attribute-value'],
				targets: [$('#getTarget-attribute')]
			},
			{
				case: ['min-attribute-ratio', 'max-attribute-ratio'],
				targets: [$('#getTarget-attribute'), $('#getTarget-divisor')]
			}
		]);
});

</script>
