import '@app/legacy/module/command/setTile.ts';
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTileCommandSchema() {
	const { form, save, load } = useCommandSchema('setTile', {
		onLoad() {
			getFocus(document.getElementById('setTile-tilemap'));
		}
	});
	const onSave = (): void => {
		const tilesetId = read(document.getElementById('setTile-tilesetId')) ?? form.tilesetId;
		if (tilesetId === '') {
			getFocus(document.getElementById('setTile-tilesetId'));
			return;
		}
		Command.save!({
			tilemap: read(document.getElementById('setTile-tilemap')) ?? form.tilemap,
			tilemapX: read(document.getElementById('setTile-tilemapX')) ?? form.tilemapX,
			tilemapY: read(document.getElementById('setTile-tilemapY')) ?? form.tilemapY,
			tilesetId,
			tilesetX: read(document.getElementById('setTile-tilesetX')) ?? form.tilesetX,
			tilesetY: read(document.getElementById('setTile-tilesetY')) ?? form.tilesetY
		});
	};
	Command.cases.setTile.customSave = onSave;
	return { form, save: onSave, load };
}
