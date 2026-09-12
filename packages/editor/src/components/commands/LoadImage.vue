<template>
	<WindowFrame id="loadImage" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loadImage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
		<div class="text">Element</div>
		<CustomBox id="loadImage-element" v-focus type="element" v-model="form.element" />
		<div class="text">Type</div>
		<SelectBox id="loadImage-type"
				:ref="registryRef(fieldEls, 'loadImage-type')" v-model="form.type" />
		<div class="text">Actor</div>
		<CustomBox id="loadImage-actor"
				:ref="registryRef(fieldEls, 'loadImage-actor')" type="actor" v-model="form.actor" />
		<div class="text">Skill</div>
		<CustomBox id="loadImage-skill"
				:ref="registryRef(fieldEls, 'loadImage-skill')" type="skill" v-model="form.skill" />
		<div class="text">State</div>
		<CustomBox id="loadImage-state"
				:ref="registryRef(fieldEls, 'loadImage-state')" type="state" v-model="form.state" />
		<div class="text">Equipment</div>
		<CustomBox id="loadImage-equipment"
				:ref="registryRef(fieldEls, 'loadImage-equipment')" type="equipment" v-model="form.equipment" />
		<div class="text">Item</div>
		<CustomBox id="loadImage-item"
				:ref="registryRef(fieldEls, 'loadImage-item')" type="item" v-model="form.item" />
		<div class="text">Shortcut Key</div>
		<SelectVar id="loadImage-key"
				:ref="registryRef(fieldEls, 'loadImage-key')" v-model="form.key" />
		<div class="text">Base64 Coding</div>
		<CustomBox
			id="loadImage-variable"
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

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
