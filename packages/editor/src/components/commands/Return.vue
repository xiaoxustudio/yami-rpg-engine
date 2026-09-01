<template>
	<WindowFrame id="return" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.return.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="return-type" v-focus v-model="form.type" />
			<div class="text">Boolean</div>
			<SelectBox id="return-boolean" v-model="form.boolean" />
			<div class="text">Number</div>
			<NumberVar
				id="return-number"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.number"
			/>
			<div class="text">String</div>
			<StringVar id="return-string" v-model="form.string" />
		<div class="text">Object</div>
		<CustomBox
			id="return-object"
			v-focus
			type="variable"
			filter="object"
			v-model="form.object"
		/>
		<div class="text">Actor</div>
		<CustomBox id="return-actor" type="actor" v-model="form.actor" />
		<div class="text">Skill</div>
		<CustomBox id="return-skill" type="skill" v-model="form.skill" />
		<div class="text">State</div>
		<CustomBox id="return-state" type="state" v-model="form.state" />
		<div class="text">Equipment</div>
		<CustomBox id="return-equipment" type="equipment" v-model="form.equipment" />
		<div class="text">Item</div>
		<CustomBox id="return-item" type="item" v-model="form.item" />
		<div class="text">Trigger</div>
		<CustomBox id="return-trigger" type="trigger" v-model="form.trigger" />
		<div class="text">Light</div>
		<CustomBox id="return-light" type="light" v-model="form.light" />
		<div class="text">Element</div>
		<CustomBox id="return-element" type="element" v-model="form.element" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReturnCommandSchema } from '@app/composables/commands/useReturnCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useReturnCommandSchema();

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
