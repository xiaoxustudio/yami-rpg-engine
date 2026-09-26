<template>
	<WindowFrame id="setTile" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTile.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTile-tilemap.label') }}</div>
			<CustomBox
				id="setTile-tilemap"
				v-tip="t('components.setTile-tilemap.tip')"
				v-focus
				type="tilemap"
				v-model="form.tilemap"
			/>
			<div class="text">{{ t('components.setTile-tilemapX.label') }}</div>
			<NumberVar
				id="setTile-tilemapX"
				v-tip="t('components.setTile-tilemapX.tip')"
				min="0"
				max="511"
				v-model="form.tilemapX"
			/>
			<div class="text">{{ t('components.setTile-tilemapY.label') }}</div>
			<NumberVar
				id="setTile-tilemapY"
				v-tip="t('components.setTile-tilemapY.tip')"
				min="0"
				max="511"
				v-model="form.tilemapY"
			/>
			<div class="text">{{ t('components.setTile-tilesetId.label') }}</div>
			<CustomBox
				id="setTile-tilesetId"
				v-tip="t('components.setTile-tilesetId.tip')"
				v-focus
				type="file"
				filter="tileset"
				v-model="form.tilesetId"
			/>
			<div class="text">{{ t('components.setTile-tilesetX.label') }}</div>
			<NumberVar
				id="setTile-tilesetX"
				v-tip="t('components.setTile-tilesetX.tip')"
				min="0"
				max="255"
				v-model="form.tilesetX"
			/>
			<div class="text">{{ t('components.setTile-tilesetY.label') }}</div>
			<NumberVar
				id="setTile-tilesetY"
				v-tip="t('components.setTile-tilesetY.tip')"
				min="0"
				max="255"
				v-model="form.tilesetY"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetTileCommandSchema } from '@app/composables/commands/useSetTileCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useSetTileCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setTile {
	width: 324px;
	height: 218px;
}

#setTile-confirm {
	right: 108px;
	bottom: 10px;
}

#setTile-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
