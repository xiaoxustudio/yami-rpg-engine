<template>
	<WindowFrame ref="frame" id="forEach" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.forEach.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.forEach-data.label') }}</div>
			<SelectBox
				id="forEach-data"
				v-tip="t('components.forEach-data.tip')"
				:ref="registryRef(fieldEls, 'forEach-data')"
				v-focus
				v-model="form.data"
			/>
			<div class="text">{{ t('components.forEach-list.label') }}</div>
			<CustomBox
				id="forEach-list"
				v-tip="t('components.forEach-list.tip')"
				:ref="registryRef(fieldEls, 'forEach-list')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.list"
			/>
			<div class="text">{{ t('components.forEach-actor.label') }}</div>
			<CustomBox
				id="forEach-actor"
				v-tip="t('components.forEach-actor.tip')"
				:ref="registryRef(fieldEls, 'forEach-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.forEach-element.label') }}</div>
			<CustomBox
				id="forEach-element"
				v-tip="t('components.forEach-element.tip')"
				:ref="registryRef(fieldEls, 'forEach-element')"
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.forEach-attribute-groupId.label') }}</div>
			<CustomBox
				id="forEach-attribute-groupId"
				v-tip="t('components.forEach-attribute-groupId.tip')"
				:ref="registryRef(fieldEls, 'forEach-attribute-groupId')"
				v-focus
				type="attribute-group"
				v-model="form.attributeGroupId"
			/>
			<div class="text">{{ t('components.forEach-enum-groupId.label') }}</div>
			<CustomBox
				id="forEach-enum-groupId"
				v-tip="t('components.forEach-enum-groupId.tip')"
				:ref="registryRef(fieldEls, 'forEach-enum-groupId')"
				v-focus
				type="enum-group"
				v-model="form.enumGroupId"
			/>
			<div class="text">{{ t('components.forEach-variable.label') }}</div>
			<CustomBox
				id="forEach-variable"
				v-tip="t('components.forEach-variable.tip')"
				:ref="registryRef(fieldEls, 'forEach-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.forEach-saveIndex.label') }}</div>
			<CustomBox
				id="forEach-saveIndex"
				v-tip="t('components.forEach-saveIndex.tip')"
				:ref="registryRef(fieldEls, 'forEach-saveIndex')"
				v-focus
				type="variable"
				filter="number"
				v-model="form.saveIndex"
			/>
			<div class="text">{{ t('components.forEach-touchId.label') }}</div>
			<CustomBox
				id="forEach-touchId"
				v-tip="t('components.forEach-touchId.tip')"
				:ref="registryRef(fieldEls, 'forEach-touchId')"
				v-focus
				type="variable"
				filter="number"
				v-model="form.touchId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef, registerElement } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);

// 模板里 WindowFrame 用 ref="frame"（已占用 :ref 槽位），故在 onMounted 里命令式登记
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils.ts';
import { useForEachCommandSchema } from '@app/composables/commands/useForEachCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, windowClosed } = useForEachCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	registerElement(fieldEls, 'forEach', frame.value);
	useLocalizedOptions(
		'forEach-data',
		[
			'list',
			'skill',
			'state',
			'equipment',
			'inventory',
			'element',
			'member',
			'attribute',
			'enum',
			'save',
			'touch',
			'changed-touch'
		],
		(items) => fieldEls.get('forEach-data')?.loadItems?.(items),
		{
			list: 'command.forEach.list',
			skill: 'command.forEach.skill',
			state: 'command.forEach.state',
			equipment: 'command.forEach.equipment',
			inventory: 'command.forEach.inventory',
			element: 'command.forEach.element',
			member: 'command.forEach.member',
			attribute: 'command.forEach.attribute',
			enum: 'command.forEach.enum',
			save: 'command.forEach.save',
			touch: 'command.forEach.touch',
			'changed-touch': 'command.forEach.changed-touch'
		}
	);
	// R2b：`enableHiddenMode`/`relate` 原先挂在 `loadItems` 的**调用链**上，拆成独立语句（语义不变）
	fieldEls
		.get('forEach-data')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'list',
				targets: [fieldEls.get('forEach-list'), fieldEls.get('forEach-variable')]
			},
			{
				case: ['skill', 'state', 'equipment', 'inventory'],
				targets: [fieldEls.get('forEach-actor'), fieldEls.get('forEach-variable')]
			},
			{
				case: 'element',
				targets: [fieldEls.get('forEach-element'), fieldEls.get('forEach-variable')]
			},
			{ case: 'member', targets: [fieldEls.get('forEach-variable')] },
			{
				case: 'attribute',
				targets: [
					fieldEls.get('forEach-attribute-groupId'),
					fieldEls.get('forEach-variable')
				]
			},
			{
				case: 'enum',
				targets: [fieldEls.get('forEach-enum-groupId'), fieldEls.get('forEach-variable')]
			},
			{ case: 'save', targets: [fieldEls.get('forEach-saveIndex')] },
			{
				case: ['touch', 'changed-touch'],
				targets: [fieldEls.get('forEach-touchId')]
			}
		]);
	on(fieldEls.get('forEach'), 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#forEach {
	width: 324px;
	height: 146px;
}

#forEach-confirm {
	right: 108px;
	bottom: 10px;
}

#forEach-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
