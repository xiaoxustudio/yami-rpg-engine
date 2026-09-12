<template>
	<WindowFrame id="followActor"
				:ref="registryRef(fieldEls, 'followActor')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.followActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.followActor-actor.label') }}</div>
			<CustomBox id="followActor-actor"
				:ref="registryRef(fieldEls, 'followActor-actor')"
				v-tip="t('components.followActor-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.followActor-target.label') }}</div>
			<CustomBox id="followActor-target"
				:ref="registryRef(fieldEls, 'followActor-target')"
				v-tip="t('components.followActor-target.tip')" type="actor" v-model="form.target" />
			<div class="text">{{ t('components.followActor-mode.label') }}</div>
			<SelectBox id="followActor-mode"
				v-tip="t('components.followActor-mode.tip')"
				:ref="registryRef(fieldEls, 'followActor-mode')" v-model="form.mode" />
			<div class="text">{{ t('components.followActor-minDist.label') }}</div>
			<NumberVar
				id="followActor-minDist"
				:ref="registryRef(fieldEls, 'followActor-minDist')"
				v-tip="t('components.followActor-minDist.tip')"
				min="0"
				max="16"
				decimals="4"
				unit="tile"
				v-model="form.minDist"
			/>
			<div class="text">{{ t('components.followActor-maxDist.label') }}</div>
			<NumberVar
				id="followActor-maxDist"
				:ref="registryRef(fieldEls, 'followActor-maxDist')"
				v-tip="t('components.followActor-maxDist.tip')"
				min="0"
				max="20"
				decimals="4"
				unit="tile"
				v-model="form.maxDist"
			/>
			<div class="text">{{ t('components.followActor-offset.label') }}</div>
			<NumberBox
				id="followActor-offset"
				v-tip="t('components.followActor-offset.tip')"
				:ref="registryRef(fieldEls, 'followActor-offset')"
				min="-0.8"
				max="0.8"
				decimals="4"
				unit="r"
				v-model="offset"
			/>
			<div class="text">{{ t('components.followActor-vertDist.label') }}</div>
			<NumberBox
				id="followActor-vertDist"
				v-tip="t('components.followActor-vertDist.tip')"
				:ref="registryRef(fieldEls, 'followActor-vertDist')"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
				v-model="vertDist"
			/>
			<div class="text">{{ t('components.followActor-bufferDist.label') }}</div>
			<NumberBox
				id="followActor-bufferDist"
				:ref="registryRef(fieldEls, 'followActor-bufferDist')"
				v-tip="t('components.followActor-bufferDist.tip')"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
				v-model="bufferDist"
			/>
			<div class="text">{{ t('components.followActor-navigate.label') }}</div>
			<SelectBox id="followActor-navigate"
				v-tip="t('components.followActor-navigate.tip')"
				:ref="registryRef(fieldEls, 'followActor-navigate')" v-model="form.navigate" />
			<div class="text">{{ t('components.followActor-bypass.label') }}</div>
			<SelectBox id="followActor-bypass"
				v-tip="t('components.followActor-bypass.tip')"
				:ref="registryRef(fieldEls, 'followActor-bypass')" v-model="form.bypass" />
			<div class="text">{{ t('components.followActor-once.label') }}</div>
			<SelectBox id="followActor-once"
				v-tip="t('components.followActor-once.tip')"
				:ref="registryRef(fieldEls, 'followActor-once')" v-model="form.once" />
			<div class="text">{{ t('components.followActor-wait.label') }}</div>
			<SelectBox id="followActor-wait"
				:ref="registryRef(fieldEls, 'followActor-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFollowActorCommandSchema } from '@app/composables/commands/useFollowActorCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useFollowActorCommandSchema();

const offset = computed({
	get: () => form.offset as number | string,
	set: (value) => {
		form.offset = value;
	}
});
const vertDist = computed({
	get: () => form.vertDist as number | string,
	set: (value) => {
		form.vertDist = value;
	}
});
const bufferDist = computed({
	get: () => form.bufferDist as number | string,
	set: (value) => {
		form.bufferDist = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('followActor-mode')?.loadItems?.([
		{ name: t('command.followActor.mode.circle') || 'Circle', value: 'circle' },
		{ name: t('command.followActor.mode.rectangle') || 'Rectangle', value: 'rectangle' }
	]);
	fieldEls.get('followActor-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'circle', targets: [fieldEls.get('followActor-offset')] },
			{ case: 'rectangle', targets: [fieldEls.get('followActor-vertDist')] }
		]);
	fieldEls.get('followActor-navigate')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('followActor-navigate')
		?.enableHiddenMode?.()
		?.relate?.([{ case: true, targets: [fieldEls.get('followActor-bypass')] }]);
	fieldEls.get('followActor-bypass')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('followActor-once')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('followActor-once')
		?.enableHiddenMode?.()
		?.relate?.([{ case: true, targets: [fieldEls.get('followActor-wait')] }]);
	fieldEls.get('followActor-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#followActor {
	width: 324px;
	height: 338px;
}

#followActor-confirm {
	right: 108px;
	bottom: 10px;
}

#followActor-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
