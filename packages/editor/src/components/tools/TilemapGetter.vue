<template>
	<!-- 瓦片地图访问器窗口 -->
	<WindowFrame ref="frame" id="tilemapGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.tilemapGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.tilemapGetter-type.label') }}</div>
			<SelectBox
				id="tilemapGetter-type"
				v-tip="t('components.tilemapGetter-type.tip')"
				:ref="fieldRef('tilemapGetter-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.tilemapGetter-presetId.label') }}</div>
			<CustomBox
				id="tilemapGetter-presetId"
				v-tip="t('components.tilemapGetter-presetId.tip')"
				:ref="fieldRef('tilemapGetter-presetId')"
				v-focus
				type="preset-object"
				filter="tilemap"
				v-model="form.presetId"
			/>
			<div class="text">{{ t('components.tilemapGetter-variable.label') }}</div>
			<CustomBox
				id="tilemapGetter-variable"
				v-tip="t('components.tilemapGetter-variable.tip')"
				:ref="fieldRef('tilemapGetter-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TilemapGetter } from '@app/commands/accessors/tilemap-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useI18n } from 'vue-i18n';
import { useTilemapGetterWindow } from '@app/composables/useTilemapGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const tilemapGetter = useTilemapGetterWindow();
const form = tilemapGetter.form;

// P5b 批次 2：把控件实例登记给访问器模块的 initialize()（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
TilemapGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	TilemapGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => tilemapGetter.onWindowClosed());
	}
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#tilemapGetter {
	width: 324px;
	height: 122px;
}

#tilemapGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#tilemapGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
