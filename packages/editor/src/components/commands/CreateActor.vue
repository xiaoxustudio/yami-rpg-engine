<template>
	<WindowFrame id="createActor" :ref="registryRef(fieldEls, 'createActor')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.createActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.createActor-actorId.label') }}</div>
			<CustomBox
				id="createActor-actorId"
				:ref="registryRef(fieldEls, 'createActor-actorId')"
				v-tip="t('components.createActor-actorId.tip')"
				v-focus
				type="file"
				filter="actor"
				v-model="form.actorId"
			/>
			<div class="text">{{ t('components.createActor-teamId.label') }}</div>
			<SelectBox
				id="createActor-teamId"
				v-tip="t('components.createActor-teamId.tip')"
				:ref="registryRef(fieldEls, 'createActor-teamId')"
				v-model="form.teamId"
			/>
			<div class="text">{{ t('components.createActor-position.label') }}</div>
			<CustomBox
				id="createActor-position"
				:ref="registryRef(fieldEls, 'createActor-position')"
				v-tip="t('components.createActor-position.tip')"
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.createActor-angle.label') }}</div>
			<NumberVar
				id="createActor-angle"
				:ref="registryRef(fieldEls, 'createActor-angle')"
				v-tip="t('components.createActor-angle.tip')"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCreateActorCommandSchema } from '@app/composables/commands/useCreateActorCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useCreateActorCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('createActor')?.on?.('open', () => {
		fieldEls.get('createActor-teamId')?.loadItems?.(Data.createTeamItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#createActor {
	width: 324px;
	height: 170px;
}

#createActor-confirm {
	right: 108px;
	bottom: 10px;
}

#createActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
