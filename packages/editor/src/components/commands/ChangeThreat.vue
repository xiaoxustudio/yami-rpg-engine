<template>
	<WindowFrame id="changeThreat"
				:ref="registryRef(fieldEls, 'changeThreat')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeThreat.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeThreat-actor.label') }}</div>
			<CustomBox id="changeThreat-actor"
				:ref="registryRef(fieldEls, 'changeThreat-actor')"
				v-tip="t('components.changeThreat-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.changeThreat-target.label') }}</div>
			<CustomBox id="changeThreat-target"
				:ref="registryRef(fieldEls, 'changeThreat-target')"
				v-tip="t('components.changeThreat-target.tip')" type="actor" v-model="form.target" />
			<div class="text">{{ t('components.changeThreat-operation.label') }}</div>
			<SelectBox id="changeThreat-operation"
				v-tip="t('components.changeThreat-operation.tip')"
				:ref="registryRef(fieldEls, 'changeThreat-operation')" v-model="form.operation" />
			<div class="text">{{ t('components.changeThreat-threat.label') }}</div>
			<NumberVar
				id="changeThreat-threat"
				:ref="registryRef(fieldEls, 'changeThreat-threat')"
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
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeThreatCommandSchema } from '@app/composables/commands/useChangeThreatCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeThreatCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('changeThreat-operation')?.loadItems?.([
		{ name: t('command.changeThreat.increase') || 'Increase', value: 'increase' },
		{ name: t('command.changeThreat.decrease') || 'Decrease', value: 'decrease' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
