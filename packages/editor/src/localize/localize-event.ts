/**
 * 控件本地化事件（唯一真源在 `@ui-kit` 的 `utils/localize-event`）。
 *
 * editor 侧只做一次转出，保持 `@app/localize/localize-event` 这个 import 路径稳定。
 */
export { LOCALIZE_EVENT, onLocalize, requestLocalize, type LocalizeDetail } from '@ui-kit';
