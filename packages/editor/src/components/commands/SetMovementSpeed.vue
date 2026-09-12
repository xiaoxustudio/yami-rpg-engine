<template>
	<WindowFrame id="setMovementSpeed"
				:ref="registryRef(fieldEls, 'setMovementSpeed')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setMovementSpeed.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setMovementSpeed-actor.label') }}</div>
			<CustomBox
				id="setMovementSpeed-actor"
				:ref="registryRef(fieldEls, 'setMovementSpeed-actor')"
				v-tip="t('components.setMovementSpeed-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setMovementSpeed-property.label') }}</div>
			<SelectBox id="setMovementSpeed-property"
				v-tip="t('components.setMovementSpeed-property.tip')"
				:ref="registryRef(fieldEls, 'setMovementSpeed-property')" v-model="form.property" />
			<div class="text">{{ t('components.setMovementSpeed-base.label') }}</div>
			<NumberVar
				id="setMovementSpeed-base"
				v-tip="t('components.setMovementSpeed-base.tip')"
				:ref="registryRef(fieldEls, 'setMovementSpeed-base')"
				min="0"
				max="32"
				decimals="4"
				unit="t/s"
				v-model="form.base"
			/>
			<div class="text">{{ t('components.setMovementSpeed-factor.label') }}</div>
			<NumberVar
				id="setMovementSpeed-factor"
				v-tip="t('components.setMovementSpeed-factor.tip')"
				:ref="registryRef(fieldEls, 'setMovementSpeed-factor')"
				min="0"
				max="4"
				decimals="4"
				v-model="form.factor"
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
import { useSetMovementSpeedCommandSchema } from '@app/composables/commands/useSetMovementSpeedCommandSchema';
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
	fieldEls.get('setMovementSpeed-property')?.loadItems?.([
		{ name: t('command.setMovementSpeed.base') || 'Base Speed', value: 'base' },
		{ name: t('command.setMovementSpeed.factor') || 'Speed Factor', value: 'factor' },
		{
			name: t('command.setMovementSpeed.factor-temp') || 'Speed Factor (Temp)',
			value: 'factor-temp'
		}
	]);
	fieldEls.get('setMovementSpeed-property')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'base', targets: [fieldEls.get('setMovementSpeed-base')] },
			{
				case: ['factor', 'factor-temp'],
				targets: [fieldEls.get('setMovementSpeed-factor')]
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
