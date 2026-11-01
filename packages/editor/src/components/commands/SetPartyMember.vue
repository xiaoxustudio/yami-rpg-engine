<template>
	<WindowFrame id="setPartyMember" :ref="boxRef('setPartyMember')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setPartyMember.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setPartyMember-operation.label') }}</div>
			<SelectBox
				:label="t('components.setPartyMember-operation.label')"
				id="setPartyMember-operation"
				v-tip="t('components.setPartyMember-operation.tip')"
				:ref="boxRef('setPartyMember-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setPartyMember-actor.label') }}</div>
			<CustomBox
				id="setPartyMember-actor"
				:ref="boxRef('setPartyMember-actor')"
				v-tip="t('components.setPartyMember-actor.tip')"
				type="actor"
				v-model="form.actor"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetPartyMemberCommandSchema } from '@app/composables/commands/useSetPartyMemberCommandSchema';
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

const { form, save } = useSetPartyMemberCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setPartyMember-operation',
		['add', 'remove'],
		(items) => boxes['setPartyMember-operation']?.loadItems?.(items),
		{ add: 'command.setPartyMember.add', remove: 'command.setPartyMember.remove' }
	);
});
</script>

<style>
#setPartyMember {
	width: 324px;
	height: 122px;
}

#setPartyMember-confirm {
	right: 108px;
	bottom: 10px;
}

#setPartyMember-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
