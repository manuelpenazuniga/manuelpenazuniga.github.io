// One colour per language, everywhere: charts, legends and the dots beside projects.
// Stack order is bottom to top and is the order the palette was validated in
// (adjacent pairs stay distinguishable under colour-vision deficiency).
export const series = [
	{ key: 'other', label: 'Web and other', langs: ['HTML', 'CSS', 'JavaScript', 'Astro', 'Cuda', 'Other'] },
	{ key: 'python', label: 'Python', langs: ['Python'] },
	{ key: 'solidity', label: 'Solidity', langs: ['Solidity'] },
	{ key: 'circom', label: 'Circom', langs: ['Circom'] },
	{ key: 'ts', label: 'TypeScript', langs: ['TypeScript'] },
	{ key: 'rust', label: 'Rust', langs: ['Rust'] }
];

export const seriesLabel = Object.fromEntries(series.map((s) => [s.key, s.label]));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthName = (m) => MONTHS[m - 1];
export const num = (n) => n.toLocaleString('en-US');
