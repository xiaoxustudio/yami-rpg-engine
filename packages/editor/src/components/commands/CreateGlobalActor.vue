<template>
	<WindowFrame
		id="createGlobalActor"
		:ref="boxRef('createGlobalActor')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.createGlobalActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.createGlobalActor-actorId.label') }}</div>
			<CustomBox
				id="createGlobalActor-actorId"
				:ref="boxRef('createGlobalActor-actorId')"
				v-tip="t('components.createGlobalActor-actorId.tip')"
				v-focus
				type="file"
				filter="actor"
				v-model="form.actorId"
			/>
			<div class="text">{{ t('components.createGlobalActor-teamId.label') }}</div>
			<SelectBox
				:label="t('components.createGlobalActor-teamId.label')"
				id="createGlobalActor-teamId"
				v-tip="t('components.createGlobalActor-teamId.tip')"
				:ref="boxRef('createGlobalActor-teamId')"
				v-model="form.teamId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCreateGlobalActorCommandSchema } from '@app/composables/commands/useCreateGlobalActorCommandSchema';
import { Data } from '@app/data/data-object.ts';
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

const { form, save } = useCreateGlobalActorCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	boxes['createGlobalActor-teamId']?.loadItems?.(Data.createTeamItems!());
};

onMounted(() => {});
</script>

<style>
#createGlobalActor {
	width: 324px;
	height: 122px;
}

#createGlobalActor-confirm {
	right: 108px;
	bottom: 10px;
}

#createGlobalActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
