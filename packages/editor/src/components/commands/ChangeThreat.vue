<template>
	<WindowFrame id="changeThreat" :ref="boxRef('changeThreat')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeThreat.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeThreat-actor.label') }}</div>
			<CustomBox
				id="changeThreat-actor"
				:ref="boxRef('changeThreat-actor')"
				v-tip="t('components.changeThreat-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeThreat-target.label') }}</div>
			<CustomBox
				id="changeThreat-target"
				:ref="boxRef('changeThreat-target')"
				v-tip="t('components.changeThreat-target.tip')"
				type="actor"
				v-model="form.target"
			/>
			<div class="text">{{ t('components.changeThreat-operation.label') }}</div>
			<SelectBox
				:label="t('components.changeThreat-operation.label')"
				id="changeThreat-operation"
				v-tip="t('components.changeThreat-operation.tip')"
				:ref="boxRef('changeThreat-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.changeThreat-threat.label') }}</div>
			<NumberVar
				id="changeThreat-threat"
				:ref="boxRef('changeThreat-threat')"
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

// 控件用局部模板 ref 回调（存**元素**：relate/hide/show 需要 DOM 元素），不再进全局注册表。
type ControlElement = HTMLElement & {
	loadItems?: (items: unknown[]) => unknown;
	bind?: (value: unknown) => unknown;
	write?: (value: unknown) => void;
	read?: () => unknown;
};
const boxes: Record<string, ControlElement | null> = {};
const boxRef = (id: string) => (el: unknown) => {
	if (el == null) {
		boxes[id] = null;
		return;
	}
	if (el instanceof HTMLElement) {
		boxes[id] = el as ControlElement;
		return;
	}
	const instance = el as { $el?: unknown; root?: unknown };
	const root = instance.$el ?? instance.root ?? null;
	boxes[id] = root instanceof HTMLElement ? (root as ControlElement) : null;
};

const { t } = useI18n();

const { form, save } = useChangeThreatCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'changeThreat-operation',
		['increase', 'decrease'],
		(items) => boxes['changeThreat-operation']?.loadItems?.(items),
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
