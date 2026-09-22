<template>
	<WindowFrame id="deleteTile" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.deleteTile.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.deleteTile-tilemap.label') }}</div>
			<CustomBox
				id="deleteTile-tilemap"
				v-tip="t('components.deleteTile-tilemap.tip')"
				v-focus
				type="tilemap"
				v-model="form.tilemap"
			/>
			<div class="text">{{ t('components.deleteTile-tilemapX.label') }}</div>
			<NumberVar
				id="deleteTile-tilemapX"
				v-tip="t('components.deleteTile-tilemapX.tip')"
				min="0"
				max="511"
				v-model="form.tilemapX"
			/>
			<div class="text">{{ t('components.deleteTile-tilemapY.label') }}</div>
			<NumberVar
				id="deleteTile-tilemapY"
				v-tip="t('components.deleteTile-tilemapY.tip')"
				min="0"
				max="511"
				v-model="form.tilemapY"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useDeleteTileCommandSchema } from '@app/composables/commands/useDeleteTileCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useDeleteTileCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#deleteTile {
	width: 324px;
	height: 146px;
}

#deleteTile-confirm {
	right: 108px;
	bottom: 10px;
}

#deleteTile-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
