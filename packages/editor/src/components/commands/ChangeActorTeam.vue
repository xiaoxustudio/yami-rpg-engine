<template>
	<WindowFrame
		id="changeActorTeam"
		:ref="controlRef('changeActorTeam')"
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
				:ref="controlRef('changeActorTeam-actor')"
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
				:ref="controlRef('changeActorTeam-teamId')"
				v-model="form.teamId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorTeamCommandSchema } from '@app/composables/commands/useChangeActorTeamCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideChangeActorTeamBridge,
	resetChangeActorTeamBridge,
	type ChangeActorTeamBridge
} from '@app/composables/change-actor-team-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'changeActorTeam-actor' | 'changeActorTeam-teamId' | 'changeActorTeam';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useChangeActorTeamCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入时要队伍候选项（insert 即加载，不依赖窗口 open 事件）。 */
const bridgeApi: ChangeActorTeamBridge = {
	loadItems: (items) => {
		controls['changeActorTeam-teamId']?.loadItems?.(items);
	}
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	controls['changeActorTeam-teamId']?.loadItems?.(Data.createTeamItems!());
};

onMounted(() => {
	provideChangeActorTeamBridge(bridgeApi);
	onUnmounted(() => resetChangeActorTeamBridge(bridgeApi));
});
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
