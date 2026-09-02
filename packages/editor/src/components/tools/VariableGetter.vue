<template>
	<!-- 变量访问器窗口 -->
	<WindowFrame ref="frame" id="variableGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.variableGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.variableGetter-type.label') }}</div>
			<SelectBox id="variableGetter-type" v-model="form.type" />
			<div class="text">{{ t('components.variableGetter-actor.label') }}</div>
			<CustomBox id="variableGetter-actor" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.variableGetter-skill.label') }}</div>
			<CustomBox id="variableGetter-skill" type="skill" v-model="form.skill" />
			<div class="text">{{ t('components.variableGetter-state.label') }}</div>
			<CustomBox id="variableGetter-state" type="state" v-model="form.state" />
			<div class="text">{{ t('components.variableGetter-equipment.label') }}</div>
			<CustomBox id="variableGetter-equipment" type="equipment" v-model="form.equipment" />
			<div class="text">{{ t('components.variableGetter-item.label') }}</div>
			<CustomBox id="variableGetter-item" type="item" v-model="form.item" />
			<div class="text">{{ t('components.variableGetter-element.label') }}</div>
			<CustomBox id="variableGetter-element" type="element" v-model="form.element" />
			<div class="text">{{ t('components.variableGetter-common-key.label') }}</div>
			<TextBox id="variableGetter-common-key" v-model="form.commonKey" />
			<div class="text">{{ t('components.variableGetter-preset-key.label') }}</div>
			<SelectVar id="variableGetter-preset-key" v-model="form.presetKey" />
			<div class="text">{{ t('components.variableGetter-global-key.label') }}</div>
			<CustomBox
				id="variableGetter-global-key"
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
import { useVariableGetterWindow } from '@app/composables/useVariableGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const variableGetter = useVariableGetterWindow();
const form = variableGetter.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	VariableGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => variableGetter.onWindowClosed());
	}
});
</script>
