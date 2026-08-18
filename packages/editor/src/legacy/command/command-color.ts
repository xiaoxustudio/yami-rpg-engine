import { Command } from './command-object.ts';
import {
	setNormalColor,
	setVariableColor,
	setGlobalVariableColor,
	setDelimiterColor,
	setOperatorColor,
	setBooleanColor,
	setNumberColor,
	setStringColor,
	setScriptColor,
	setFileColor,
	setPresetColor,
	setWeakColor,
	setCommaColors,
	setTextId,
	setTooltip,
	setClass
} from '@app/composables/useCommandColor.ts';

Command.setNormalColor = setNormalColor;
Command.setVariableColor = setVariableColor;
Command.setGlobalVariableColor = setGlobalVariableColor;
Command.setDelimiterColor = setDelimiterColor;
Command.setOperatorColor = setOperatorColor;
Command.setBooleanColor = setBooleanColor;
Command.setNumberColor = setNumberColor;
Command.setStringColor = setStringColor;
Command.setScriptColor = setScriptColor;
Command.setFileColor = setFileColor;
Command.setPresetColor = setPresetColor;
Command.setWeakColor = setWeakColor;
Command.setCommaColors = setCommaColors;
Command.setTextId = setTextId;
Command.setTooltip = setTooltip;
Command.setClass = setClass;
