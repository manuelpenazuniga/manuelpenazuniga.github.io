// Wilson score interval for a proportion: honest near 0 and 1, where the
// usual normal approximation collapses to a zero-width bar.
export function wilson(k, n, z = 1.96) {
	if (!n) return [0, 1];
	const p = k / n;
	const d = 1 + (z * z) / n;
	const c = p + (z * z) / (2 * n);
	const h = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
	return [Math.max(0, (c - h) / d), Math.min(1, (c + h) / d)];
}

export const pct = (x, digits = 1) => `${(x * 100).toFixed(digits)}%`;

export const leafLabel = {
	bppv_posterior: 'BPPV, posterior',
	bppv_horizontal: 'BPPV, horizontal',
	meniere: 'Ménière',
	vestibular_migraine: 'Vestibular migraine',
	vestibular_neuritis: 'Vestibular neuritis',
	labyrinthitis: 'Labyrinthitis',
	central_suspected: 'Central',
	cardiogenic_suspected: 'Cardiogenic'
};
export const leafCode = {
	bppv_posterior: 'BPp',
	bppv_horizontal: 'BPh',
	meniere: 'Mén',
	vestibular_migraine: 'Mig',
	vestibular_neuritis: 'Neu',
	labyrinthitis: 'Lab',
	central_suspected: 'Cen',
	cardiogenic_suspected: 'Car'
};
export const featureLabel = {
	vascular_risk_count: 'Vascular risk factors',
	age_years: 'Age',
	trigger: 'Trigger',
	onset: 'Onset',
	danger_sign_count: 'Neurological alarm signs',
	head_impulse: 'Head impulse test',
	nystagmus_direction: 'Nystagmus direction',
	cardiogenic_cluster: 'Cardiogenic cluster',
	hints_central_pattern: 'Central HINTS pattern',
	central_nystagmus_pattern: 'Central nystagmus pattern',
	skew_deviation: 'Skew deviation',
	timing_pattern: 'Timing pattern',
	duration: 'Duration'
};
