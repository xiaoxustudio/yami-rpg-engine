<template>
	<WindowFrame id="setTile" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setTile.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Tilemap</div><CustomBox id="setTile-tilemap" type="tilemap" @input="onTilemap" />
				<div class="text">Tilemap X</div><NumberVar id="setTile-tilemapX" min="0" max="511" v-model="form.tilemapX" />
				<div class="text">Tilemap Y</div><NumberVar id="setTile-tilemapY" min="0" max="511" v-model="form.tilemapY" />
				<div class="text">Tileset</div
				><CustomBox id="setTile-tilesetId" type="file" filter="tileset" @input="onTilesetId" />
				<div class="text">Tileset X</div><NumberVar id="setTile-tilesetX" min="0" max="255" v-model="form.tilesetX" />
				<div class="text">Tileset Y</div><NumberVar id="setTile-tilesetY" min="0" max="255" v-model="form.tilesetY" />
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

const onTilemap = (value: unknown) => {
	form.tilemap = value;
};

const onTilesetId = (value: unknown) => {
	form.tilesetId = value;
};

const onConfirm = () => {
	save();
};

</script>
