<template>
	<WindowFrame id="setMovementSpeed" :ref="controlRef('setMovementSpeed')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setMovementSpeed.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setMovementSpeed-actor.label') }}</div>
			<CustomBox
				id="setMovementSpeed-actor"
				:ref="controlRef('setMovementSpeed-actor')"
				v-tip="t('components.setMovementSpeed-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setMovementSpeed-property.label') }}</div>
			<SelectBox
				:label="t('components.setMovementSpeed-property.label')"
				id="setMovementSpeed-property"
				v-tip="t('components.setMovementSpeed-property.tip')"
				:ref="controlRef('setMovementSpeed-property')"
				v-model="form.property"
			/>
			<div class="text">{{ t('components.setMovementSpeed-base.label') }}</div>
			<NumberVar
				id="setMovementSpeed-base"
				v-tip="t('components.setMovementSpeed-base.tip')"
				:ref="controlRef('setMovementSpeed-base')"
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
				:ref="controlRef('setMovementSpeed-factor')"
				min="0"
				max="4"
				decimals="4"
				v-model="form.factor"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetMovementSpeedCommandSchema } from '@app/composables/commands/useSetMovementSpeedCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setMovementSpeed'
	| 'setMovementSpeed-actor'
	| 'setMovementSpeed-base'
	| 'setMovementSpeed-factor'
	| 'setMovementSpeed-property';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetMovementSpeedCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setMovementSpeed-property',
		['base', 'factor', 'factor-temp'],
		(items) => controls['setMovementSpeed-property']?.loadItems?.(items),
		{
			base: 'command.setMovementSpeed.base',
			factor: 'command.setMovementSpeed.factor',
			'factor-temp': 'command.setMovementSpeed.factor-temp'
		}
	);
	controls['setMovementSpeed-property']?.enableHiddenMode?.();
	controls['setMovementSpeed-property']?.relate?.([
		{ case: 'base', targets: [controlRoot(controls['setMovementSpeed-base'])] },
		{
			case: ['factor', 'factor-temp'],
			targets: [controlRoot(controls['setMovementSpeed-factor'])]
		}
	]);
});
</script>

<style>
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
