<template>
<WindowFrame id="return" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.return.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="return-type" v-model="form.type" /> <div class="text">Boolean</div
			><SelectBox id="return-boolean" v-model="form.boolean" /> <div class="text">Number</div
			><NumberVar
				id="return-number"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.number"
			 />
			<div class="text">String</div><StringVar id="return-string" v-model="form.string" /> <div class="text">Object</div
			><CustomBox id="return-object" type="variable" filter="object" @input="onObject" />
			<div class="text">Actor</div><CustomBox id="return-actor" type="actor" @input="onActor" />
			<div class="text">Skill</div><CustomBox id="return-skill" type="skill" @input="onSkill" />
			<div class="text">State</div><CustomBox id="return-state" type="state" @input="onState" />
			<div class="text">Equipment</div><CustomBox id="return-equipment" type="equipment" @input="onEquipment" />
			<div class="text">Item</div><CustomBox id="return-item" type="item" @input="onItem" />
			<div class="text">Trigger</div><CustomBox id="return-trigger" type="trigger" @input="onTrigger" />
			<div class="text">Light</div><CustomBox id="return-light" type="light" @input="onLight" />
			<div class="text">Element</div><CustomBox id="return-element" type="element" @input="onElement" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReturnCommandSchema } from '@app/composables/commands/useReturnCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useReturnCommandSchema();

const onObject = (value: unknown) => {
	form.object = value;
};

const onActor = (value: unknown) => {
	form.actor = value;
};

const onSkill = (value: unknown) => {
	form.skill = value;
};

const onState = (value: unknown) => {
	form.state = value;
};

const onEquipment = (value: unknown) => {
	form.equipment = value;
};

const onItem = (value: unknown) => {
	form.item = value;
};

const onTrigger = (value: unknown) => {
	form.trigger = value;
};

const onLight = (value: unknown) => {
	form.light = value;
};

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#return-boolean')?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
	$('#return-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'boolean', targets: [$('#return-boolean')] },
			{ case: 'number', targets: [$('#return-number')] },
			{ case: 'string', targets: [$('#return-string')] },
			{ case: 'object', targets: [$('#return-object')] },
			{ case: 'actor', targets: [$('#return-actor')] },
			{ case: 'skill', targets: [$('#return-skill')] },
			{ case: 'state', targets: [$('#return-state')] },
			{ case: 'equipment', targets: [$('#return-equipment')] },
			{ case: 'item', targets: [$('#return-item')] },
			{ case: 'trigger', targets: [$('#return-trigger')] },
			{ case: 'light', targets: [$('#return-light')] },
			{ case: 'element', targets: [$('#return-element')] }
		]);
});

</script>
