export { Scene } from '@app/scene/scene-window.ts';
export { UI } from '@app/engine/ui/legacy/ui-window.ts';
export { Animation } from '@app/animation/animation-window.ts';
export { Particle } from '@app/particle/particle-window.ts';
export { Inspector } from '@app/inspector/inspector.ts';
export { Curve } from '@app/animation/curve-window.ts';
export { Layout } from '@app/engine/layout/layout.ts';
export { Title } from '@app/title/title-bar.ts';
export { Menubar } from '@app/title/menu-bar.ts';
export { Home } from '@app/title/home-page.ts';
export { Attribute } from '@app/attribute/attribute-window.ts';
export { AudioManager } from '@app/audio/audio-manager.ts';
export { Command } from '@app/commands/command-object.ts';
export { CustomCommand } from '@app/commands/custom-command-window.ts';
export { EventEditor } from '@app/commands/event-editor.ts';
export { Project } from '@app/data/project-settings-window.ts';
export { Team } from '@app/data/team-window.ts';
export { Easing } from '@app/data/transition-window.ts';
export { Enum } from '@app/enum/enum-window.ts';
export { Directory } from '@app/file/directory-object.ts';
export { File } from '@app/file/file-system-core.ts';
export { Localization } from '@app/local/local-window.ts';
export { Log } from '@app/log/log-window.ts';
export { Reference } from '@app/log/related-references.ts';
export { UpdateLog } from '@app/log/update-log-window.ts';
export { SetTileTag } from '@app/module/global.ts';
export { PluginManager } from '@app/plugin/plugin.ts';
export { Printer } from '@app/printer/printer.ts';
export { ArrayList } from '@app/composables/useArrayWindow';
export { Color } from '@app/tools/color-picker-window.ts';
export { ConditionListInterface } from '@app/tools/condition-list.ts';
export { ImageClip } from '@app/tools/image-crop-window.ts';
export { PresetElement } from '@app/composables/usePresetElementWindow';
export { AttributeListInterface } from '@app/tools/property-list.ts';
export { Rename } from '@app/composables/useRenameWindow';
export { PresetObject } from '@app/composables/usePresetObjectWindow';
export { SetKey } from '@app/composables/useSetKeyWindow';
export { SetQuantity } from '@app/tools/set-number-window.ts';
export { Selection } from '@app/tools/text-capture.ts';
export { Zoom } from '@app/composables/useZoomWindow';
export { Sprite } from '@app/engine/sprite/sprite.ts';

import '@app/commands/command-custom.ts';
import '@app/commands/event-editor-register.ts';
import '@app/plugin/register.ts';

import { sceneWindowReady } from '@app/scene/scene-window.ts';
import { uiWindowReady } from '@app/engine/ui/legacy/ui-window.ts';
import { animationWindowReady } from '@app/animation/animation-window.ts';
import { particleWindowReady } from '@app/particle/particle-window.ts';
import { paletteReady } from '@app/palette/palette.ts';

export const clusterReady = Promise.all([
	sceneWindowReady,
	uiWindowReady,
	animationWindowReady,
	particleWindowReady,
	paletteReady
]).then(() => undefined);
