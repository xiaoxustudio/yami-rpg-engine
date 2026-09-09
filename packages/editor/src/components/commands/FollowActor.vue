<template>
	<WindowFrame id="followActor" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.followActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="followActor-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Target</div>
			<CustomBox id="followActor-target" type="actor" v-model="form.target" />
			<div class="text">Mode</div>
			<SelectBox id="followActor-mode" v-model="form.mode" />
			<div class="text">Min Distance</div>
			<NumberVar
				id="followActor-minDist"
				min="0"
				max="16"
				decimals="4"
				unit="tile"
				v-model="form.minDist"
			/>
			<div class="text">Max Distance</div>
			<NumberVar
				id="followActor-maxDist"
				min="0"
				max="20"
				decimals="4"
				unit="tile"
				v-model="form.maxDist"
			/>
			<div class="text">Offset Ratio</div>
			<NumberBox
				id="followActor-offset"
				min="-0.8"
				max="0.8"
				decimals="4"
				unit="r"
				v-model="offset"
			/>
			<div class="text">Vert Distance</div>
			<NumberBox
				id="followActor-vertDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
				v-model="vertDist"
			/>
			<div class="text">Buffer Distance</div>
			<NumberBox
				id="followActor-bufferDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
				v-model="bufferDist"
			/>
			<div class="text">Navigate</div>
			<SelectBox id="followActor-navigate" v-model="form.navigate" />
			<div class="text">Bypass Actors</div>
			<SelectBox id="followActor-bypass" v-model="form.bypass" />
			<div class="text">Once</div>
			<SelectBox id="followActor-once" v-model="form.once" />
			<div class="text">Wait</div>
			<SelectBox id="followActor-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFollowActorCommandSchema } from '@app/composables/commands/useFollowActorCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#followActor-mode')?.loadItems?.([
		{ name: t('command.followActor.mode.circle') || 'Circle', value: 'circle' },
		{ name: t('command.followActor.mode.rectangle') || 'Rectangle', value: 'rectangle' }
	]);
	$('#followActor-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'circle', targets: [$('#followActor-offset')] },
			{ case: 'rectangle', targets: [$('#followActor-vertDist')] }
		]);
	$('#followActor-navigate')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#followActor-navigate')
		?.enableHiddenMode?.()
		?.relate?.([{ case: true, targets: [$('#followActor-bypass')] }]);
	$('#followActor-bypass')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#followActor-once')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#followActor-once')
		?.enableHiddenMode?.()
		?.relate?.([{ case: true, targets: [$('#followActor-wait')] }]);
	$('#followActor-wait')?.loadItems?.([
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
