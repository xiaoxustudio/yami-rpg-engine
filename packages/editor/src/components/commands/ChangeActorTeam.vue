<template>
	<WindowFrame
		id="changeActorTeam"
		:ref="registryRef(fieldEls, 'changeActorTeam')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.changeActorTeam.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorTeam-actor.label') }}</div>
			<CustomBox
				id="changeActorTeam-actor"
				:ref="registryRef(fieldEls, 'changeActorTeam-actor')"
				v-tip="t('components.changeActorTeam-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeActorTeam-teamId.label') }}</div>
			<SelectBox
				:label="t('components.changeActorTeam-teamId.label')"
				id="changeActorTeam-teamId"
				v-tip="t('components.changeActorTeam-teamId.tip')"
				:ref="registryRef(fieldEls, 'changeActorTeam-teamId')"
				v-model="form.teamId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorTeamCommandSchema } from '@app/composables/commands/useChangeActorTeamCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorTeamCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。原先是元素优先 API（经 fieldEls 取到元素后订阅 open）。 */
const onWindowOpen = () => {
	fieldEls.get('changeActorTeam-teamId')?.loadItems?.(Data.createTeamItems!());
};

onMounted(() => {});
</script>

<style>
#changeActorTeam {
	width: 324px;
	height: 122px;
}

#changeActorTeam-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorTeam-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
