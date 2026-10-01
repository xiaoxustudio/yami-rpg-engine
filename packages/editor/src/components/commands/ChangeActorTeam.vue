<template>
	<WindowFrame
		id="changeActorTeam"
		:ref="registryRef(fieldEls, 'changeActorTeam')"
		@confirm="onConfirm"
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

// 本组件的控件元素注册表（替代按 id 查 DOM）
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

onMounted(() => {
	fieldEls.get('changeActorTeam')?.on?.('open', () => {
		fieldEls.get('changeActorTeam-teamId')?.loadItems?.(Data.createTeamItems!());
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
