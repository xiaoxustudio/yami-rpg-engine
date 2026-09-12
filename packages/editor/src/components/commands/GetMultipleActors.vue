<template>
	<WindowFrame id="getMultipleActors"
				:ref="registryRef(fieldEls, 'getMultipleActors')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.getMultipleActors.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Write to List</div>
			<CustomBox
				id="getMultipleActors-variable"
				v-tip="t('components.getMultipleActors-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">Position</div>
			<CustomBox id="getMultipleActors-position"
				v-tip="t('components.getMultipleActors-position.tip')" type="position" v-model="form.position" />
			<div class="text">Area</div>
			<SelectBox id="getMultipleActors-area"
				v-tip="t('components.getMultipleActors-area.tip')"
				:ref="registryRef(fieldEls, 'getMultipleActors-area')" v-model="form.area" />
			<div class="text">Width</div>
			<NumberVar
				id="getMultipleActors-width"
				v-tip="t('components.getMultipleActors-width.tip')"
				:ref="registryRef(fieldEls, 'getMultipleActors-width')"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.width"
			/>
			<div class="text">Height</div>
			<NumberVar
				id="getMultipleActors-height"
				v-tip="t('components.getMultipleActors-height.tip')"
				:ref="registryRef(fieldEls, 'getMultipleActors-height')"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.height"
			/>
			<div class="text">Radius</div>
			<NumberVar
				id="getMultipleActors-radius"
				v-tip="t('components.getMultipleActors-radius.tip')"
				:ref="registryRef(fieldEls, 'getMultipleActors-radius')"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
				v-model="form.radius"
			/>
			<div class="text">Selector</div>
			<SelectBox id="getMultipleActors-selector"
				v-tip="t('components.getMultipleActors-selector.tip')"
				:ref="registryRef(fieldEls, 'getMultipleActors-selector')" v-model="form.selector" />
			<div class="text">Team</div>
			<SelectVar id="getMultipleActors-teamId"
				v-tip="t('components.getMultipleActors-teamId.tip')"
				:ref="registryRef(fieldEls, 'getMultipleActors-teamId')" v-model="form.teamId" />
			<div class="text">Activation</div>
			<SelectBox id="getMultipleActors-activation"
				v-tip="t('components.getMultipleActors-activation.tip')"
				:ref="registryRef(fieldEls, 'getMultipleActors-activation')" v-model="form.activation" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetMultipleActorsCommandSchema } from '@app/composables/commands/useGetMultipleActorsCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useGetMultipleActorsCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('getMultipleActors-area')?.loadItems?.([
		{ name: t('command.getMultipleActors.rectangle') || 'Rectangle', value: 'rectangle' },
		{ name: t('command.getMultipleActors.circle') || 'Circle', value: 'circle' }
	]);
	fieldEls.get('getMultipleActors-area')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'rectangle',
				targets: [fieldEls.get('getMultipleActors-width'), fieldEls.get('getMultipleActors-height')]
			},
			{ case: 'circle', targets: [fieldEls.get('getMultipleActors-radius')] }
		]);
	fieldEls.get('getMultipleActors-selector')?.loadItems?.([
		{ name: 'Team Enemy', value: 'enemy' },
		{ name: 'Team Friend', value: 'friend' },
		{ name: 'Team Member', value: 'team' },
		{ name: 'Any', value: 'any' }
	]);
	fieldEls.get('getMultipleActors-selector')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['enemy', 'friend', 'team'],
				targets: [fieldEls.get('getMultipleActors-teamId')]
			}
		]);
	fieldEls.get('getMultipleActors-activation')?.loadItems?.([
		{ name: t('command.getMultipleActors.active') || 'Active', value: 'active' },
		{ name: t('command.getMultipleActors.inactive') || 'Inactive', value: 'inactive' },
		{ name: t('command.getMultipleActors.either') || 'Either', value: 'either' }
	]);
	fieldEls.get('getMultipleActors')?.on?.('open', function (_event: Event) {
		const items = Data.createTeamItems!();
		fieldEls.get('getMultipleActors-teamId')?.loadItems?.(items);
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#getMultipleActors {
	width: 324px;
	height: 266px;
}

#getMultipleActors-confirm {
	right: 108px;
	bottom: 10px;
}

#getMultipleActors-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
