import '@app/legacy/module/command/setTile.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTileCommandSchema() {
	const { form, save, load } = useCommandSchema('setTile', {
		onLoad() {
			getFocus($('#setTile-tilemap'));
		}
	});
	const onSave = (): void => {
		const tilesetId = read($('#setTile-tilesetId')) ?? form.tilesetId;
		if (tilesetId === '') {
			getFocus($('#setTile-tilesetId'));
			return;
		}
		Command.save!({
			tilemap: read($('#setTile-tilemap')) ?? form.tilemap,
			tilemapX: read($('#setTile-tilemapX')) ?? form.tilemapX,
			tilemapY: read($('#setTile-tilemapY')) ?? form.tilemapY,
			tilesetId,
			tilesetX: read($('#setTile-tilesetX')) ?? form.tilesetX,
			tilesetY: read($('#setTile-tilesetY')) ?? form.tilesetY
		});
	};
	Command.cases.setTile.customSave = onSave;
	return { form, save: onSave, load };
}
