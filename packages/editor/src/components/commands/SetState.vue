<template>
	<WindowFrame id="setState" :ref="controlRef('setState')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setState.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setState-state.label') }}</div>
			<CustomBox
				id="setState-state"
				:ref="controlRef('setState-state')"
				v-tip="t('components.setState-state.tip')"
				v-focus
				type="state"
				v-model="form.state"
			/>
			<div class="text">{{ t('components.setState-operation.label') }}</div>
			<SelectBox
				:label="t('components.setState-operation.label')"
				id="setState-operation"
				v-tip="t('components.setState-operation.tip')"
				:ref="controlRef('setState-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setState-time.label') }}</div>
			<NumberVar
				id="setState-time"
				:ref="controlRef('setState-time')"
				v-tip="t('components.setState-time.tip')"
				min="0"
				max="36000000"
				unit="ms"
				v-model="form.time"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetStateCommandSchema } from '@app/composables/commands/useSetStateCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setState' | 'setState-operation' | 'setState-state' | 'setState-time';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetStateCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setState-operation',
		['set-time', 'increase-time', 'decrease-time'],
		(items) => controls['setState-operation']?.loadItems?.(items)
	);
});
</script>

<style>
#setState {
	width: 324px;
	height: 146px;
}

#setState-confirm {
	right: 108px;
	bottom: 10px;
}

#setState-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
