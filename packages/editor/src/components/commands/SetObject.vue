<template>
	<WindowFrame id="setObject" @confirm="onConfirm">
		<template #title><TitleBar>Set Object<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox id="setObject-variable" type="variable" filter="object" @input="onVariable" />
				<div class="text">Type</div><SelectBox id="setObject-operand-type" v-model="form['operand-type']" /> <div class="text">Actor</div
				><CustomBox id="setObject-operand-actor" type="actor" @input="onOperandActor" /> <div class="text">Skill</div
				><CustomBox id="setObject-operand-skill" type="skill" @input="onOperandSkill" /> <div class="text">State</div
				><CustomBox id="setObject-operand-state" type="state" @input="onOperandState" />
				<div class="text">Equipment</div
				><CustomBox id="setObject-operand-equipment" type="equipment" @input="onOperandEquipment" />
				<div class="text">Item</div><CustomBox id="setObject-operand-item" type="item" @input="onOperandItem" />
				<div class="text">Trigger</div
				><CustomBox id="setObject-operand-trigger" type="trigger" @input="onOperandTrigger" />
				<div class="text">Light</div><CustomBox id="setObject-operand-light" type="light" @input="onOperandLight" />
				<div class="text">Object</div><CustomBox id="setObject-operand-object" type="object" @input="onOperandObject" />
				<div class="text">Element</div
				><CustomBox id="setObject-operand-element" type="element" @input="onOperandElement" />
				<div class="text">Variable</div
				><CustomBox
					id="setObject-operand-variable"
					type="variable"
					filter="object"
					@input="onOperandVariable"
				/>
				<div class="text">Index</div
				><NumberVar id="setObject-operand-list-index" min="0" max="1000000000" v-model="form['operand-list-index']" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetObjectCommandSchema } from '@app/composables/commands/useSetObjectCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetObjectCommandSchema();

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onOperandActor = (value: unknown) => {
	form['operand-actor'] = value;
};

const onOperandSkill = (value: unknown) => {
	form['operand-skill'] = value;
};

const onOperandState = (value: unknown) => {
	form['operand-state'] = value;
};

const onOperandEquipment = (value: unknown) => {
	form['operand-equipment'] = value;
};

const onOperandItem = (value: unknown) => {
	form['operand-item'] = value;
};

const onOperandTrigger = (value: unknown) => {
	form['operand-trigger'] = value;
};

const onOperandLight = (value: unknown) => {
	form['operand-light'] = value;
};

const onOperandObject = (value: unknown) => {
	form['operand-object'] = value;
};

const onOperandElement = (value: unknown) => {
	form['operand-element'] = value;
};

const onOperandVariable = (value: unknown) => {
	form['operand-variable'] = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setObject-operand-type')?.loadItems?.([
		{ name: 'None', value: 'none' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Skill', value: 'skill' },
		{ name: 'State', value: 'state' },
		{ name: 'Equipment', value: 'equipment' },
		{ name: 'Item', value: 'item' },
		{ name: 'Trigger', value: 'trigger' },
		{ name: 'Light', value: 'light' },
		{ name: 'Object', value: 'object' },
		{ name: 'Element', value: 'element' },
		{ name: 'Variable', value: 'variable' },
		{ name: 'List', value: 'list' }
	]);
	$('#setObject-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor', targets: [$('#setObject-operand-actor')] },
			{ case: 'skill', targets: [$('#setObject-operand-skill')] },
			{ case: 'state', targets: [$('#setObject-operand-state')] },
			{
				case: 'equipment',
				targets: [$('#setObject-operand-equipment')]
			},
			{ case: 'item', targets: [$('#setObject-operand-item')] },
			{ case: 'trigger', targets: [$('#setObject-operand-trigger')] },
			{ case: 'light', targets: [$('#setObject-operand-light')] },
			{ case: 'object', targets: [$('#setObject-operand-object')] },
			{ case: 'element', targets: [$('#setObject-operand-element')] },
			{
				case: 'variable',
				targets: [$('#setObject-operand-variable')]
			},
			{
				case: 'list',
				targets: [$('#setObject-operand-variable'), $('#setObject-operand-list-index')]
			}
		]);
});

</script>
