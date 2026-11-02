<template>
	<WindowFrame
		id="createGlobalActor"
		:ref="controlRef('createGlobalActor')"
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
				:ref="controlRef('createGlobalActor-actorId')"
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
				:ref="controlRef('createGlobalActor-teamId')"
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
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'createGlobalActor' | 'createGlobalActor-actorId' | 'createGlobalActor-teamId';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useCreateGlobalActorCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	controls['createGlobalActor-teamId']?.loadItems?.(Data.createTeamItems!());
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
