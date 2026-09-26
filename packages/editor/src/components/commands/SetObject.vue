<template>
	<WindowFrame id="setObject" :ref="registryRef(fieldEls, 'setObject')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setObject.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setObject-variable.label') }}</div>
			<CustomBox
				id="setObject-variable"
				:ref="registryRef(fieldEls, 'setObject-variable')"
				v-tip="t('components.setObject-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setObject-operand-type.label') }}</div>
			<SelectBox
				id="setObject-operand-type"
				v-tip="t('components.setObject-operand-type.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-type')"
				v-model="form['operand-type']"
			/>
			<div class="text">{{ t('components.setObject-operand-actor.label') }}</div>
			<CustomBox
				id="setObject-operand-actor"
				v-tip="t('components.setObject-operand-actor.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-actor')"
				type="actor"
				v-model="form['operand-actor']"
			/>
			<div class="text">{{ t('components.setObject-operand-skill.label') }}</div>
			<CustomBox
				id="setObject-operand-skill"
				v-tip="t('components.setObject-operand-skill.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-skill')"
				type="skill"
				v-model="form['operand-skill']"
			/>
			<div class="text">{{ t('components.setObject-operand-state.label') }}</div>
			<CustomBox
				id="setObject-operand-state"
				v-tip="t('components.setObject-operand-state.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-state')"
				type="state"
				v-model="form['operand-state']"
			/>
			<div class="text">{{ t('components.setObject-operand-equipment.label') }}</div>
			<CustomBox
				id="setObject-operand-equipment"
				v-tip="t('components.setObject-operand-equipment.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-equipment')"
				type="equipment"
				v-model="form['operand-equipment']"
			/>
			<div class="text">{{ t('components.setObject-operand-item.label') }}</div>
			<CustomBox
				id="setObject-operand-item"
				v-tip="t('components.setObject-operand-item.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-item')"
				type="item"
				v-model="form['operand-item']"
			/>
			<div class="text">{{ t('components.setObject-operand-trigger.label') }}</div>
			<CustomBox
				id="setObject-operand-trigger"
				v-tip="t('components.setObject-operand-trigger.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-trigger')"
				type="trigger"
				v-model="form['operand-trigger']"
			/>
			<div class="text">{{ t('components.setObject-operand-light.label') }}</div>
			<CustomBox
				id="setObject-operand-light"
				v-tip="t('components.setObject-operand-light.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-light')"
				type="light"
				v-model="form['operand-light']"
			/>
			<div class="text">{{ t('components.setObject-operand-object.label') }}</div>
			<CustomBox
				id="setObject-operand-object"
				v-tip="t('components.setObject-operand-object.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-object')"
				type="object"
				v-model="form['operand-object']"
			/>
			<div class="text">{{ t('components.setObject-operand-element.label') }}</div>
			<CustomBox
				id="setObject-operand-element"
				v-tip="t('components.setObject-operand-element.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-element')"
				type="element"
				v-model="form['operand-element']"
			/>
			<div class="text">{{ t('components.setObject-operand-variable.label') }}</div>
			<CustomBox
				id="setObject-operand-variable"
				v-tip="t('components.setObject-operand-variable.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form['operand-variable']"
			/>
			<div class="text">{{ t('components.setObject-operand-list-index.label') }}</div>
			<NumberVar
				id="setObject-operand-list-index"
				v-tip="t('components.setObject-operand-list-index.tip')"
				:ref="registryRef(fieldEls, 'setObject-operand-list-index')"
				min="0"
				max="1000000000"
				v-model="form['operand-list-index']"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
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
	useLocalizedOptions(
		'setObject-operand-type',
		[
			'none',
			'actor',
			'skill',
			'state',
			'equipment',
			'item',
			'trigger',
			'light',
			'object',
			'element',
			'variable',
			'list'
		],
		(items) => fieldEls.get('setObject-operand-type')?.loadItems?.(items)
	);
	fieldEls
		.get('setObject-operand-type')
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
				targets: [
					fieldEls.get('setObject-operand-variable'),
					fieldEls.get('setObject-operand-list-index')
				]
			}
		]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
