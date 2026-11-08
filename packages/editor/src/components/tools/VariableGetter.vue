<template>
	<WindowFrame ref="frame" id="variableGetter" @confirm="onConfirm" scrollable>
		<template #title
			><TitleBar
				>{{ t('components.variableGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.variableGetter-type.label') }}</div>
			<SelectBox
				:label="t('components.variableGetter-type.label')"
				id="variableGetter-type"
				:ref="controlRef('variableGetter-type')"
				v-tip="t('components.variableGetter-type.tip')"
				v-model="form.type"
			/>
			<div class="text">{{ t('components.variableGetter-actor.label') }}</div>
			<CustomBox
				id="variableGetter-actor"
				:ref="controlRef('variableGetter-actor')"
				v-tip="t('components.variableGetter-actor.tip')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.variableGetter-skill.label') }}</div>
			<CustomBox
				id="variableGetter-skill"
				:ref="controlRef('variableGetter-skill')"
				v-tip="t('components.variableGetter-skill.tip')"
				type="skill"
				v-model="form.skill"
			/>
			<div class="text">{{ t('components.variableGetter-state.label') }}</div>
			<CustomBox
				id="variableGetter-state"
				:ref="controlRef('variableGetter-state')"
				v-tip="t('components.variableGetter-state.tip')"
				type="state"
				v-model="form.state"
			/>
			<div class="text">{{ t('components.variableGetter-equipment.label') }}</div>
			<CustomBox
				id="variableGetter-equipment"
				:ref="controlRef('variableGetter-equipment')"
				v-tip="t('components.variableGetter-equipment.tip')"
				type="equipment"
				v-model="form.equipment"
			/>
			<div class="text">{{ t('components.variableGetter-item.label') }}</div>
			<CustomBox
				id="variableGetter-item"
				:ref="controlRef('variableGetter-item')"
				v-tip="t('components.variableGetter-item.tip')"
				type="item"
				v-model="form.item"
			/>
			<div class="text">{{ t('components.variableGetter-element.label') }}</div>
			<CustomBox
				id="variableGetter-element"
				:ref="controlRef('variableGetter-element')"
				v-tip="t('components.variableGetter-element.tip')"
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.variableGetter-common-key.label') }}</div>
			<TextBox
				:label="t('components.variableGetter-common-key.label')"
				id="variableGetter-common-key"
				:ref="controlRef('variableGetter-common-key')"
				v-tip="t('components.variableGetter-common-key.tip')"
				v-model="form.commonKey"
			/>
			<div class="text">{{ t('components.variableGetter-preset-key.label') }}</div>
			<SelectVar
				id="variableGetter-preset-key"
				:ref="controlRef('variableGetter-preset-key')"
				v-tip="t('components.variableGetter-preset-key.tip')"
				v-model="form.presetKey"
			/>
			<div class="text">{{ t('components.variableGetter-global-key.label') }}</div>
			<CustomBox
				id="variableGetter-global-key"
				:ref="controlRef('variableGetter-global-key')"
				v-tip="t('components.variableGetter-global-key.tip')"
				type="global-variable"
				v-model="form.globalKey"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import {
	provideVariableGetterControls,
	useVariableGetterWindow
} from '@app/composables/useVariableGetterWindow';
import { useControlRefs } from '@app/composables/control-refs';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'variableGetter-actor'
	| 'variableGetter-common-key'
	| 'variableGetter-element'
	| 'variableGetter-equipment'
	| 'variableGetter-global-key'
	| 'variableGetter-item'
	| 'variableGetter-preset-key'
	| 'variableGetter-skill'
	| 'variableGetter-state'
	| 'variableGetter-type';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const variableGetter = useVariableGetterWindow();
const form = variableGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	VariableGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	// 控件表交给单例：懒挂载时可查，窗口一卸载就不再指向这块 DOM
	provideVariableGetterControls('variableGetter', () => controls);
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => variableGetter.onWindowClosed());
	}
});
</script>

<style>
#variableGetter {
	width: 324px;
	height: 146px;
}

#variableGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#variableGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
