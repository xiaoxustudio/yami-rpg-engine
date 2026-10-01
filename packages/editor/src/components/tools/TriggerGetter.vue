<template>
	<!-- 触发器访问器窗口 -->
	<WindowFrame ref="frame" id="triggerGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.triggerGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.triggerGetter-type.label') }}</div>
			<SelectBox
				:label="t('components.triggerGetter-type.label')"
				id="triggerGetter-type"
				v-tip="t('components.triggerGetter-type.tip')"
				:ref="fieldRef('triggerGetter-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.triggerGetter-variable.label') }}</div>
			<CustomBox
				id="triggerGetter-variable"
				v-tip="t('components.triggerGetter-variable.tip')"
				:ref="fieldRef('triggerGetter-variable')"
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
import { TriggerGetter } from '@app/commands/accessors/trigger-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useI18n } from 'vue-i18n';
import { useTriggerGetterWindow } from '@app/composables/useTriggerGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const triggerGetter = useTriggerGetterWindow();
const form = triggerGetter.form;

// 把控件实例登记给访问器模块的 initialize()（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
TriggerGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	TriggerGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => triggerGetter.onWindowClosed());
	}
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#triggerGetter {
	width: 324px;
	height: 122px;
}

#triggerGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#triggerGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
