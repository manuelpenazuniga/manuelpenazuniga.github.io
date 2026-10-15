<script>
	import model from '#lib/data/model.json';
	import Calibration from './Calibration.svelte';
	import Selective from './Selective.svelte';
	import Attribution from './Attribution.svelte';
	import Robustness from './Robustness.svelte';
	import { pct } from '#lib/stats.js';

	const r = model.reported;
	const split = model.split;
	const facts = [
		{ v: pct(r.danger_recall), k: 'of dangerous cases flagged by the gate' },
		{ v: r.ece_calibrated.toFixed(3), k: 'expected calibration error' },
		{ v: pct(r.abstain_rate, 0), k: 'of cases it declines, by design' },
		{ v: pct(r.leaf_accuracy), k: 'accuracy across eight diagnoses' }
	];
</script>

<section id="lab" class="wrap band">
	<h2>Model evaluation</h2>
	<div class="band-body">
		<p class="lead">
			The confidence layer of <a href="https://github.com/manuelpenazuniga/Clinibrium">Clinibrium</a>,
			a hierarchical CatBoost classifier for vertigo triage, retrained here from its public repo with the
			same seed and split ({split.train.toLocaleString('en-US')} train, {split.calibration.toLocaleString('en-US')}
			calibration, {split.test.toLocaleString('en-US')} untouched test). Every chart below is computed from
			those held-out predictions in your browser.
		</p>
		<p class="caveat">
			<span class="label">Note</span>
			The cases are synthetic, sampled from published diagnostic criteria, because real patient data had no
			place in a hackathon. These numbers measure how well the model recovers that generator, not clinical
			performance. What they do show is the method.
		</p>

		<dl class="facts">
			{#each facts as f}
				<div><dt>{f.k}</dt><dd>{f.v}</dd></div>
			{/each}
		</dl>

		<div class="figs">
			<Selective />
			<Calibration />
			<Attribution />
			<Robustness />
		</div>
	</div>
</section>

<style>
	.caveat {
		max-width: var(--measure);
		margin-top: 1.25rem;
		color: var(--ink-2);
		font-size: var(--step--1);
	}
	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
		gap: 1.25rem 2rem;
		margin-top: 2rem;
	}
	.facts div {
		display: flex;
		flex-direction: column-reverse;
		gap: 0.2rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line-strong);
	}
	.caveat .label {
		margin-right: 0.5ch;
		text-transform: uppercase;
	}
	dd {
		font-family: var(--display);
		font-size: var(--step-2);
		font-weight: 600;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}
	dt {
		font-size: var(--step--1);
		color: var(--ink-2);
		max-width: 16ch;
	}
	.figs {
		margin-top: 2rem;
	}
</style>
