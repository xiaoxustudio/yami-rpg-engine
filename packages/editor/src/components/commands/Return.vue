<template>
	<WindowFrame id="return" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.return.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="return-type"
				v-tip="t('components.return-type.tip')"
				:ref="registryRef(fieldEls, 'return-type')" v-focus v-model="form.type" />
			<div class="text">Boolean</div>
			<SelectBox id="return-boolean"
				v-tip="t('components.return-boolean.tip')"
				:ref="registryRef(fieldEls, 'return-boolean')" v-model="form.boolean" />
			<div class="text">Number</div>
			<NumberVar
				id="return-number"
				v-tip="t('components.return-number.tip')"
				:ref="registryRef(fieldEls, 'return-number')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.number"
			/>
			<div class="text">String</div>
			<StringVar id="return-string"
				v-tip="t('components.return-string.tip')"
				:ref="registryRef(fieldEls, 'return-string')" v-model="form.string" />
		<div class="text">Object</div>
		<CustomBox
			id="return-object"
				v-tip="t('components.return-object.tip')"
				:ref="registryRef(fieldEls, 'return-object')"
			v-focus
			type="variable"
			filter="object"
			v-model="form.object"
		/>
		<div class="text">Actor</div>
		<CustomBox id="return-actor"
				v-tip="t('components.return-actor.tip')"
				:ref="registryRef(fieldEls, 'return-actor')" type="actor" v-model="form.actor" />
		<div class="text">Skill</div>
		<CustomBox id="return-skill"
				v-tip="t('components.return-skill.tip')"
				:ref="registryRef(fieldEls, 'return-skill')" type="skill" v-model="form.skill" />
		<div class="text">State</div>
		<CustomBox id="return-state"
				v-tip="t('components.return-state.tip')"
				:ref="registryRef(fieldEls, 'return-state')" type="state" v-model="form.state" />
		<div class="text">Equipment</div>
		<CustomBox id="return-equipment"
				v-tip="t('components.return-equipment.tip')"
				:ref="registryRef(fieldEls, 'return-equipment')" type="equipment" v-model="form.equipment" />
		<div class="text">Item</div>
		<CustomBox id="return-item"
				v-tip="t('components.return-item.tip')"
				:ref="registryRef(fieldEls, 'return-item')" type="item" v-model="form.item" />
		<div class="text">Trigger</div>
		<CustomBox id="return-trigger"
				v-tip="t('components.return-trigger.tip')"
				:ref="registryRef(fieldEls, 'return-trigger')" type="trigger" v-model="form.trigger" />
		<div class="text">Light</div>
		<CustomBox id="return-light"
				v-tip="t('components.return-light.tip')"
				:ref="registryRef(fieldEls, 'return-light')" type="light" v-model="form.light" />
		<div class="text">Element</div>
		<CustomBox id="return-element"
				v-tip="t('components.return-element.tip')"
				:ref="registryRef(fieldEls, 'return-element')" type="element" v-model="form.element" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReturnCommandSchema } from '@app/composables/commands/useReturnCommandSchema';
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
	fieldEls.get('return-boolean')?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
	fieldEls.get('return-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'boolean', targets: [fieldEls.get('return-boolean')] },
			{ case: 'number', targets: [fieldEls.get('return-number')] },
			{ case: 'string', targets: [fieldEls.get('return-string')] },
			{ case: 'object', targets: [fieldEls.get('return-object')] },
			{ case: 'actor', targets: [fieldEls.get('return-actor')] },
			{ case: 'skill', targets: [fieldEls.get('return-skill')] },
			{ case: 'state', targets: [fieldEls.get('return-state')] },
			{ case: 'equipment', targets: [fieldEls.get('return-equipment')] },
			{ case: 'item', targets: [fieldEls.get('return-item')] },
			{ case: 'trigger', targets: [fieldEls.get('return-trigger')] },
			{ case: 'light', targets: [fieldEls.get('return-light')] },
			{ case: 'element', targets: [fieldEls.get('return-element')] }
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#return {
	width: 324px;
	height: 122px;
}

#return-confirm {
	right: 108px;
	bottom: 10px;
}

#return-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
