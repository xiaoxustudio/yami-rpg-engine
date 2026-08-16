<template>
	<WindowFrame id="deleteTile" @confirm="onConfirm">
		<template #title><TitleBar>Delete Tile<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Tilemap</div><CustomBox id="deleteTile-tilemap" type="tilemap" @input="onTilemap" />
				<div class="text">Tilemap X</div
				><NumberVar id="deleteTile-tilemapX" min="0" max="511" v-model="form.tilemapX" />
				<div class="text">Tilemap Y</div
				><NumberVar id="deleteTile-tilemapY" min="0" max="511" v-model="form.tilemapY" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { useDeleteTileCommandSchema } from '@app/composables/commands/useDeleteTileCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { form, save } = useDeleteTileCommandSchema();

const onTilemap = (value: unknown) => {
	form.tilemap = value;
};

const onConfirm = () => {
	save();
};

</script>
