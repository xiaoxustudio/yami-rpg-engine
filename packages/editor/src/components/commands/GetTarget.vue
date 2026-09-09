<template>
	<WindowFrame id="getTarget" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.getTarget.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="getTarget-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Selector</div>
			<SelectBox id="getTarget-selector" v-model="form.selector" />
			<div class="text">Condition</div>
			<SelectBox id="getTarget-condition" v-model="form.condition" />
			<div class="text">Attribute</div>
			<SelectBox id="getTarget-attribute" v-focus v-model="form.attribute" />
			<div class="text">Attribute 2</div>
			<SelectBox id="getTarget-divisor" v-focus v-model="form.divisor" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetTargetCommandSchema } from '@app/composables/commands/useGetTargetCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useGetTargetCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#getTarget-selector')?.loadItems?.([
		{ name: 'Enemy', value: 'enemy' },
		{ name: 'Friend', value: 'friend' },
		{ name: 'Team Member', value: 'team' },
		{ name: 'Team Member Except Self', value: 'team-except-self' },
		{ name: 'Any Except Self', value: 'any-except-self' },
		{ name: 'Any', value: 'any' }
	]);
	$('#getTarget-condition')?.loadItems?.([
		{ name: t('command.getTarget.condition.max-threat') || 'Max Threat', value: 'max-threat' },
		{ name: t('command.getTarget.condition.nearest') || 'Nearest', value: 'nearest' },
		{ name: t('command.getTarget.condition.farthest') || 'Farthest', value: 'farthest' },
		{
			name: t('command.getTarget.condition.min-attribute-value') || 'Min Attribute Value',
			value: 'min-attribute-value'
		},
		{
			name: t('command.getTarget.condition.max-attribute-value') || 'Max Attribute Value',
			value: 'max-attribute-value'
		},
		{
			name: t('command.getTarget.condition.min-attribute-ratio') || 'Min Attribute Ratio',
			value: 'min-attribute-ratio'
		},
		{
			name: t('command.getTarget.condition.max-attribute-ratio') || 'Max Attribute Ratio',
			value: 'max-attribute-ratio'
		},
		{ name: t('command.getTarget.condition.random') || 'Random', value: 'random' }
	]);
	$('#getTarget-condition')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['min-attribute-value', 'max-attribute-value'],
				targets: [$('#getTarget-attribute')]
			},
			{
				case: ['min-attribute-ratio', 'max-attribute-ratio'],
				targets: [$('#getTarget-attribute'), $('#getTarget-divisor')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#getTarget {
	width: 324px;
	height: 194px;
}

#getTarget-confirm {
	right: 108px;
	bottom: 10px;
}

#getTarget-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
