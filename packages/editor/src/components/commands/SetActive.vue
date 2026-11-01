<template>
	<WindowFrame id="setActive" :ref="boxRef('setActive')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setActive.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setActive-actor.label') }}</div>
			<CustomBox
				id="setActive-actor"
				:ref="boxRef('setActive-actor')"
				v-tip="t('components.setActive-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setActive-active.label') }}</div>
			<SelectBox
				:label="t('components.setActive-active.label')"
				id="setActive-active"
				v-tip="t('components.setActive-active.tip')"
				:ref="boxRef('setActive-active')"
				v-model="form.active"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetActiveCommandSchema } from '@app/composables/commands/useSetActiveCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

// 控件用局部模板 ref 回调（存**元素**，relate/hide/show 需要 DOM 元素），不再进全局注册表。
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

const { form, save } = useSetActiveCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setActive-active',
		[true, false],
		(items) => boxes['setActive-active']?.loadItems?.(items),
		{ true: 'command.setActive.active.true', false: 'command.setActive.active.false' }
	);
});
</script>

<style>
#setActive {
	width: 324px;
	height: 122px;
}

#setActive-confirm {
	right: 108px;
	bottom: 10px;
}

#setActive-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
