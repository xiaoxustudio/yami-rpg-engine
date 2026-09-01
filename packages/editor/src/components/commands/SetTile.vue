<template>
	<WindowFrame id="setTile" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTile.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Tilemap</div>
			<CustomBox id="setTile-tilemap" v-focus type="tilemap" v-model="form.tilemap" />
			<div class="text">Tilemap X</div>
			<NumberVar id="setTile-tilemapX" min="0" max="511" v-model="form.tilemapX" />
			<div class="text">Tilemap Y</div>
			<NumberVar id="setTile-tilemapY" min="0" max="511" v-model="form.tilemapY" />
			<div class="text">Tileset</div>
			<CustomBox
				id="setTile-tilesetId"
				v-focus
				type="file"
				filter="tileset"
				v-model="form.tilesetId"
			/>
			<div class="text">Tileset X</div>
			<NumberVar id="setTile-tilesetX" min="0" max="255" v-model="form.tilesetX" />
			<div class="text">Tileset Y</div>
			<NumberVar id="setTile-tilesetY" min="0" max="255" v-model="form.tilesetY" />
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
