<template>
	<WindowFrame id="loadImage"
				:ref="registryRef(fieldEls, 'loadImage')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loadImage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
		<div class="text">{{ t('components.loadImage-element.label') }}</div>
		<CustomBox id="loadImage-element"
				:ref="registryRef(fieldEls, 'loadImage-element')"
				v-tip="t('components.loadImage-element.tip')" v-focus type="element" v-model="form.element" />
		<div class="text">{{ t('components.loadImage-type.label') }}</div>
		<SelectBox id="loadImage-type"
				v-tip="t('components.loadImage-type.tip')"
				:ref="registryRef(fieldEls, 'loadImage-type')" v-model="form.type" />
		<div class="text">{{ t('components.loadImage-actor.label') }}</div>
		<CustomBox id="loadImage-actor"
				v-tip="t('components.loadImage-actor.tip')"
				:ref="registryRef(fieldEls, 'loadImage-actor')" type="actor" v-model="form.actor" />
		<div class="text">{{ t('components.loadImage-skill.label') }}</div>
		<CustomBox id="loadImage-skill"
				v-tip="t('components.loadImage-skill.tip')"
				:ref="registryRef(fieldEls, 'loadImage-skill')" type="skill" v-model="form.skill" />
		<div class="text">{{ t('components.loadImage-state.label') }}</div>
		<CustomBox id="loadImage-state"
				v-tip="t('components.loadImage-state.tip')"
				:ref="registryRef(fieldEls, 'loadImage-state')" type="state" v-model="form.state" />
		<div class="text">{{ t('components.loadImage-equipment.label') }}</div>
		<CustomBox id="loadImage-equipment"
				v-tip="t('components.loadImage-equipment.tip')"
				:ref="registryRef(fieldEls, 'loadImage-equipment')" type="equipment" v-model="form.equipment" />
		<div class="text">{{ t('components.loadImage-item.label') }}</div>
		<CustomBox id="loadImage-item"
				v-tip="t('components.loadImage-item.tip')"
				:ref="registryRef(fieldEls, 'loadImage-item')" type="item" v-model="form.item" />
		<div class="text">{{ t('components.loadImage-key.label') }}</div>
		<SelectVar id="loadImage-key"
				v-tip="t('components.loadImage-key.tip')"
				:ref="registryRef(fieldEls, 'loadImage-key')" v-model="form.key" />
		<div class="text">{{ t('components.loadImage-variable.label') }}</div>
		<CustomBox
			id="loadImage-variable"
				v-tip="t('components.loadImage-variable.tip')"
				:ref="registryRef(fieldEls, 'loadImage-variable')"
			v-focus
			type="variable"
			filter="string"
			v-model="form.variable"
		/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoadImageCommandSchema } from '@app/composables/commands/useLoadImageCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useLoadImageCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('loadImage-type')?.loadItems?.([
		{ name: t('command.loadImage.actor-portrait') || 'Actor Portrait', value: 'actor-portrait' },
		{ name: t('command.loadImage.skill-icon') || 'Skill Icon', value: 'skill-icon' },
		{ name: t('command.loadImage.state-icon') || 'State Icon', value: 'state-icon' },
		{
			name: t('command.loadImage.equipment-icon') || 'Equipment Icon',
			value: 'equipment-icon'
		},
		{ name: t('command.loadImage.item-icon') || 'Item Icon', value: 'item-icon' },
		{ name: t('command.loadImage.shortcut-icon') || 'Shortcut Icon', value: 'shortcut-icon' },
		{ name: t('command.loadImage.base64') || 'Base64 Image', value: 'base64' }
	]);
	fieldEls.get('loadImage-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor-portrait', targets: [fieldEls.get('loadImage-actor')] },
			{ case: 'skill-icon', targets: [fieldEls.get('loadImage-skill')] },
			{ case: 'state-icon', targets: [fieldEls.get('loadImage-state')] },
			{
				case: 'equipment-icon',
				targets: [fieldEls.get('loadImage-equipment')]
			},
			{ case: 'item-icon', targets: [fieldEls.get('loadImage-item')] },
			{
				case: 'shortcut-icon',
				targets: [fieldEls.get('loadImage-actor'), fieldEls.get('loadImage-key')]
			},
			{ case: 'base64', targets: [fieldEls.get('loadImage-variable')] }
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#loadImage {
	width: 324px;
	height: 170px;
}

#loadImage-confirm {
	right: 108px;
	bottom: 10px;
}

#loadImage-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
