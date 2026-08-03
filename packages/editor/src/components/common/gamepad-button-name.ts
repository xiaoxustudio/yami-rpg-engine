const codeToName: Record<number, string> = {
	0: 'A',
	1: 'B',
	2: 'X',
	3: 'Y',
	4: 'LB',
	5: 'RB',
	6: 'LT',
	7: 'RT',
	8: 'View',
	9: 'Menu',
	10: 'LS',
	11: 'RS',
	12: 'Up',
	13: 'Down',
	14: 'Left',
	15: 'Right'
};

export function getButtonName(code: number): string {
	return code === -1 ? '' : (codeToName[code] ?? `Button_${code}`);
}
