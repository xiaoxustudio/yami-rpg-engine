<template>
	<WindowFrame id="setSkill" :ref="boxRef('setSkill')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setSkill.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setSkill-skill.label') }}</div>
			<CustomBox
				id="setSkill-skill"
				:ref="boxRef('setSkill-skill')"
				v-tip="t('components.setSkill-skill.tip')"
				v-focus
				type="skill"
				v-model="form.skill"
			/>
			<div class="text">{{ t('components.setSkill-operation.label') }}</div>
			<SelectBox
				:label="t('components.setSkill-operation.label')"
				id="setSkill-operation"
				v-tip="t('components.setSkill-operation.tip')"
				:ref="boxRef('setSkill-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setSkill-cooldown.label') }}</div>
			<NumberVar
				id="setSkill-cooldown"
				:ref="boxRef('setSkill-cooldown')"
				v-tip="t('components.setSkill-cooldown.tip')"
				min="1"
				max="3600000"
				unit="ms"
				v-model="form.cooldown"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetSkillCommandSchema } from '@app/composables/commands/useSetSkillCommandSchema';
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

const { form, save } = useSetSkillCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setSkill-operation',
		['set-cooldown', 'increase-cooldown', 'decrease-cooldown'],
		(items) => boxes['setSkill-operation']?.loadItems?.(items)
	);
});
</script>

<style>
#setSkill {
	width: 324px;
	height: 146px;
}

#setSkill-confirm {
	right: 108px;
	bottom: 10px;
}

#setSkill-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
