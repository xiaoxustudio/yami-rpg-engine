<template>
	<WindowFrame id="setObject" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setObject.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
		<div class="text">Variable</div>
		<CustomBox
			id="setObject-variable"
			v-focus
			type="variable"
			filter="object"
			v-model="form.variable"
		/>
		<div class="text">Type</div>
		<SelectBox id="setObject-operand-type"
				:ref="registryRef(fieldEls, 'setObject-operand-type')" v-model="form['operand-type']" />
		<div class="text">Actor</div>
		<CustomBox id="setObject-operand-actor"
				:ref="registryRef(fieldEls, 'setObject-operand-actor')" type="actor" v-model="form['operand-actor']" />
		<div class="text">Skill</div>
		<CustomBox id="setObject-operand-skill"
				:ref="registryRef(fieldEls, 'setObject-operand-skill')" type="skill" v-model="form['operand-skill']" />
		<div class="text">State</div>
		<CustomBox id="setObject-operand-state"
				:ref="registryRef(fieldEls, 'setObject-operand-state')" type="state" v-model="form['operand-state']" />
		<div class="text">Equipment</div>
		<CustomBox
			id="setObject-operand-equipment"
				:ref="registryRef(fieldEls, 'setObject-operand-equipment')"
			type="equipment"
			v-model="form['operand-equipment']"
		/>
		<div class="text">Item</div>
		<CustomBox id="setObject-operand-item"
				:ref="registryRef(fieldEls, 'setObject-operand-item')" type="item" v-model="form['operand-item']" />
		<div class="text">Trigger</div>
		<CustomBox id="setObject-operand-trigger"
				:ref="registryRef(fieldEls, 'setObject-operand-trigger')" type="trigger" v-model="form['operand-trigger']" />
		<div class="text">Light</div>
		<CustomBox id="setObject-operand-light"
				:ref="registryRef(fieldEls, 'setObject-operand-light')" type="light" v-model="form['operand-light']" />
		<div class="text">Object</div>
		<CustomBox id="setObject-operand-object"
				:ref="registryRef(fieldEls, 'setObject-operand-object')" type="object" v-model="form['operand-object']" />
		<div class="text">Element</div>
		<CustomBox id="setObject-operand-element"
				:ref="registryRef(fieldEls, 'setObject-operand-element')" type="element" v-model="form['operand-element']" />
		<div class="text">Variable</div>
		<CustomBox
			id="setObject-operand-variable"
				:ref="registryRef(fieldEls, 'setObject-operand-variable')"
			v-focus
			type="variable"
			filter="object"
			v-model="form['operand-variable']"
		/>
			<div class="text">Index</div>
			<NumberVar
				id="setObject-operand-list-index"
				:ref="registryRef(fieldEls, 'setObject-operand-list-index')"
				min="0"
				max="1000000000"
				v-model="form['operand-list-index']"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetObjectCommandSchema } from '@app/composables/commands/useSetObjectCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetObjectCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setObject-operand-type')?.loadItems?.([
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
	fieldEls.get('setObject-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor', targets: [fieldEls.get('setObject-operand-actor')] },
			{ case: 'skill', targets: [fieldEls.get('setObject-operand-skill')] },
			{ case: 'state', targets: [fieldEls.get('setObject-operand-state')] },
			{
				case: 'equipment',
				targets: [fieldEls.get('setObject-operand-equipment')]
			},
			{ case: 'item', targets: [fieldEls.get('setObject-operand-item')] },
			{ case: 'trigger', targets: [fieldEls.get('setObject-operand-trigger')] },
			{ case: 'light', targets: [fieldEls.get('setObject-operand-light')] },
			{ case: 'object', targets: [fieldEls.get('setObject-operand-object')] },
			{ case: 'element', targets: [fieldEls.get('setObject-operand-element')] },
			{
				case: 'variable',
				targets: [fieldEls.get('setObject-operand-variable')]
			},
			{
				case: 'list',
				targets: [fieldEls.get('setObject-operand-variable'), fieldEls.get('setObject-operand-list-index')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setObject {
	width: 324px;
	height: 170px;
}

#setObject-confirm {
	right: 108px;
	bottom: 10px;
}

#setObject-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
