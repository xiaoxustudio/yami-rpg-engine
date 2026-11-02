<template>
	<WindowFrame id="changeThreat" :ref="controlRef('changeThreat')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeThreat.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeThreat-actor.label') }}</div>
			<CustomBox
				id="changeThreat-actor"
				:ref="controlRef('changeThreat-actor')"
				v-tip="t('components.changeThreat-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeThreat-target.label') }}</div>
			<CustomBox
				id="changeThreat-target"
				:ref="controlRef('changeThreat-target')"
				v-tip="t('components.changeThreat-target.tip')"
				type="actor"
				v-model="form.target"
			/>
			<div class="text">{{ t('components.changeThreat-operation.label') }}</div>
			<SelectBox
				:label="t('components.changeThreat-operation.label')"
				id="changeThreat-operation"
				v-tip="t('components.changeThreat-operation.tip')"
				:ref="controlRef('changeThreat-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.changeThreat-threat.label') }}</div>
			<NumberVar
				id="changeThreat-threat"
				:ref="controlRef('changeThreat-threat')"
				v-tip="t('components.changeThreat-threat.tip')"
				min="0"
				max="1000000000"
				decimals="4"
				v-model="form.threat"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeThreatCommandSchema } from '@app/composables/commands/useChangeThreatCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'changeThreat'
	| 'changeThreat-actor'
	| 'changeThreat-operation'
	| 'changeThreat-target'
	| 'changeThreat-threat';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useChangeThreatCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'changeThreat-operation',
		['increase', 'decrease'],
		(items) => controls['changeThreat-operation']?.loadItems?.(items),
		{ increase: 'command.changeThreat.increase', decrease: 'command.changeThreat.decrease' }
	);
});
</script>

<style>
#changeThreat {
	width: 324px;
	height: 170px;
}

#changeThreat-confirm {
	right: 108px;
	bottom: 10px;
}

#changeThreat-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
