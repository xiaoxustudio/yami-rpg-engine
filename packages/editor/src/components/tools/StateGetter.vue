<template>
	<!-- 状态访问器窗口 -->
	<WindowFrame ref="frame" id="stateGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stateGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.stateGetter-type.label') }}</div>
			<SelectBox id="stateGetter-type"
				v-tip="t('components.stateGetter-type.tip')"
				:ref="fieldRef('stateGetter-type')" v-focus v-model="form.type" />
			<div class="text">{{ t('components.stateGetter-actor.label') }}</div>
			<CustomBox id="stateGetter-actor"
				v-tip="t('components.stateGetter-actor.tip')"
				:ref="fieldRef('stateGetter-actor')" type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.stateGetter-stateId.label') }}</div>
			<CustomBox
				id="stateGetter-stateId"
				v-tip="t('components.stateGetter-stateId.tip')"
				:ref="fieldRef('stateGetter-stateId')"
				v-focus
				type="file"
				filter="state"
				v-model="form.stateId"
			/>
			<div class="text">{{ t('components.stateGetter-variable.label') }}</div>
			<CustomBox
				id="stateGetter-variable"
				v-tip="t('components.stateGetter-variable.tip')"
				:ref="fieldRef('stateGetter-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { StateGetter } from '@app/commands/accessors/state-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useI18n } from 'vue-i18n';
import { useStateGetterWindow } from '@app/composables/useStateGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const stateGetter = useStateGetterWindow();
const form = stateGetter.form;

// P5b 批次 2：把控件实例登记给访问器模块的 initialize()（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
StateGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	StateGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => stateGetter.onWindowClosed());
	}
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#stateGetter {
	width: 324px;
	height: 146px;
}

#stateGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#stateGetter-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
