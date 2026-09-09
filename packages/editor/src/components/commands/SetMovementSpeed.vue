<template>
	<WindowFrame id="setMovementSpeed" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setMovementSpeed.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox
				id="setMovementSpeed-actor"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">Property</div>
			<SelectBox id="setMovementSpeed-property" v-model="form.property" />
			<div class="text">Base Speed</div>
			<NumberVar
				id="setMovementSpeed-base"
				min="0"
				max="32"
				decimals="4"
				unit="t/s"
				v-model="form.base"
			/>
			<div class="text">Speed Factor</div>
			<NumberVar
				id="setMovementSpeed-factor"
				min="0"
				max="4"
				decimals="4"
				v-model="form.factor"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetMovementSpeedCommandSchema } from '@app/composables/commands/useSetMovementSpeedCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetMovementSpeedCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setMovementSpeed-property')?.loadItems?.([
		{ name: t('command.setMovementSpeed.base') || 'Base Speed', value: 'base' },
		{ name: t('command.setMovementSpeed.factor') || 'Speed Factor', value: 'factor' },
		{
			name: t('command.setMovementSpeed.factor-temp') || 'Speed Factor (Temp)',
			value: 'factor-temp'
		}
	]);
	$('#setMovementSpeed-property')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'base', targets: [$('#setMovementSpeed-base')] },
			{
				case: ['factor', 'factor-temp'],
				targets: [$('#setMovementSpeed-factor')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setMovementSpeed {
	width: 324px;
	height: 146px;
}

#setMovementSpeed-confirm {
	right: 108px;
	bottom: 10px;
}

#setMovementSpeed-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
