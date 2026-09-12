<template>
	<WindowFrame id="changeActorTeam"
				:ref="registryRef(fieldEls, 'changeActorTeam')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorTeam.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorTeam-actor.label') }}</div>
			<CustomBox id="changeActorTeam-actor"
				v-tip="t('components.changeActorTeam-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.changeActorTeam-teamId.label') }}</div>
			<SelectBox id="changeActorTeam-teamId"
				v-tip="t('components.changeActorTeam-teamId.tip')"
				:ref="registryRef(fieldEls, 'changeActorTeam-teamId')" v-model="form.teamId" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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

onMounted(() => {
	fieldEls.get('changeActorTeam')?.on?.('open', () => {
		fieldEls.get('changeActorTeam-teamId')?.loadItems?.(Data.createTeamItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
