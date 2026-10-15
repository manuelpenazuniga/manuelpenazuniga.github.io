<script>
	// Selective prediction: the model may decline to answer. Moving the
	// confidence bar trades how often it answers against how often it is wrong.
	import model from '#lib/data/model.json';
	import { wilson, pct, leafLabel, leafCode } from '#lib/stats.js';

	const { cases, leaves } = model;
	const n = cases.y.length;
	const isDanger = (i) => model.danger.includes(i);

	// most confident first; cum[k - 1] = wrong answers among the k most confident
	const order = cases.conf.map((_, i) => i).sort((a, b) => cases.conf[b] - cases.conf[a]);
	const cum = [];
	let wrong = 0;
	for (const i of order) cum.push((wrong += cases.pred[i] !== cases.y[i]));

	const atLeast = (tau) => cases.conf.filter((c) => c >= tau).length;
	const shipped = atLeast(model.threshold);
	const kMin = Math.ceil(n * 0.5);

	let target = $state(shipped);
	// several cases can share a confidence, so snap to the whole tie
	const tau = $derived(cases.conf[order[target - 1]]);
	const k = $derived(atLeast(tau));
	const errors = $derived(cum[k - 1]);
	const ci = $derived(wilson(k - errors, k));

	const matrix = $derived.by(() => {
		const rows = leaves.map(() => ({ cells: leaves.map(() => 0), held: 0, total: 0 }));
		let missed = 0;
		cases.y.forEach((y, i) => {
			rows[y].total++;
			if (cases.conf[i] < tau) return rows[y].held++;
			rows[y].cells[cases.pred[i]]++;
			if (isDanger(y) && !isDanger(cases.pred[i])) missed++;
		});
		return { rows, missed };
	});
	const shade = (v, total) => (v === 0 ? 0 : Math.min(5, Math.ceil((v / total) * 5)));

	// the curve, with its interval sampled every few cases
	const pts = [];
	for (let i = kMin; i <= n; i += 8) pts.push(i);
	if (pts.at(-1) !== n) pts.push(n);
	const curve = pts.map((i) => {
		const [lo, hi] = wilson(cum[i - 1], i);
		return { cov: i / n, err: cum[i - 1] / i, lo, hi };
	});
	const yMax = 0.05;
	const yTicks = [0, 0.01, 0.02, 0.03, 0.04, 0.05];
	const xTicks = [0.5, 0.6, 0.7, 0.8, 0.9, 1];

	let w = $state(520);
	const h = 250;
	const m = { l: 40, r: 16, t: 26, b: 36 };
	const x = $derived((v) => m.l + ((v - 0.5) / 0.5) * (w - m.l - m.r));
	const y = (v) => m.t + (1 - Math.min(v, yMax) / yMax) * (h - m.t - m.b);
	const line = $derived(curve.map((p, i) => `${i ? 'L' : 'M'}${x(p.cov).toFixed(1)},${y(p.err).toFixed(1)}`).join(''));
	const band = $derived(
		curve.map((p, i) => `${i ? 'L' : 'M'}${x(p.cov).toFixed(1)},${y(p.hi).toFixed(1)}`).join('') +
			curve
				.toReversed()
				.map((p) => `L${x(p.cov).toFixed(1)},${y(p.lo).toFixed(1)}`)
				.join('') +
			'Z'
	);
	const cx = $derived(x(k / n));
	const cy = $derived(y(errors / k));
</script>

<figure class="figure">
	<h3>A model that is allowed to say “I don’t know”</h3>
	<p class="sub">
		Below a confidence bar the model returns <em>undetermined</em> instead of a diagnosis. Move the bar:
		the curve shows the error rate among the cases it still answers, and the matrix shows where those
		answers land. The shipped bar was fitted on a separate calibration split to answer 90% of cases.
	</p>

	<div class="control">
		<label for="bar">Answer the most confident <strong>{pct(k / n)}</strong> of cases</label>
		<input id="bar" type="range" min={kMin} max={n} step="1" bind:value={target} />
		<button type="button" onclick={() => (target = shipped)} disabled={k === shipped}>Shipped setting</button>
	</div>

	<dl class="stats">
		<div>
			<dt>Confidence bar</dt>
			<dd>{tau.toFixed(3)}</dd>
		</div>
		<div>
			<dt>Right when it answers</dt>
			<dd>{pct(1 - errors / k)}</dd>
			<dd class="aside">95% interval {pct(ci[0])} to {pct(ci[1])}</dd>
		</div>
		<div>
			<dt>Wrong answers given</dt>
			<dd>{errors} <span class="of">of {k.toLocaleString('en-US')}</span></dd>
		</div>
		<div>
			<dt>Dangerous cases answered as benign</dt>
			<dd>{matrix.missed}</dd>
		</div>
	</dl>

	<div class="split">
		<div class="plot" bind:clientWidth={w}>
			<svg width={w} height={h} role="img" aria-label="Error rate among answered cases against the share of cases answered">
				{#each yTicks as t}
					<line class="grid" x1={m.l} x2={w - m.r} y1={y(t)} y2={y(t)} />
					<text x={m.l - 8} y={y(t) + 4} text-anchor="end">{t * 100}%</text>
				{/each}
				{#each xTicks as t}
					<text x={x(t)} y={h - m.b + 16} text-anchor="middle">{t * 100}%</text>
				{/each}
				<text x={m.l - 32} y={12}>wrong, among answered</text>
				<text x={w - m.r} y={h - 2} text-anchor="end">share of cases answered</text>
				<line class="axis" x1={m.l} x2={w - m.r} y1={y(0)} y2={y(0)} />
				<path class="band" d={band} />
				<path class="line" d={line} />
				<line class="ref" x1={x(shipped / n)} x2={x(shipped / n)} y1={m.t} y2={y(0)} />
				<text class="note" x={x(shipped / n) - 6} y={m.t + 10} text-anchor="end">shipped</text>
				<line class="cross" x1={cx} x2={cx} y1={cy} y2={y(0)} />
				<circle class="now" {cx} {cy} r="6" />
			</svg>
		</div>

		<div class="cm">
			<table>
				<caption>Rows are the true diagnosis, columns the model’s answer</caption>
				<thead>
					<tr>
						<td></td>
						{#each leaves as leaf, j}
							<th scope="col" class:sep={j === model.danger[0]} title={leafLabel[leaf]}>{leafCode[leaf]}</th>
						{/each}
						<th scope="col" class="sep" title="Undetermined: the model declined to answer">n/a</th>
					</tr>
				</thead>
				<tbody>
					{#each matrix.rows as row, i}
						<tr class:gap={i === model.danger[0]}>
							<th scope="row"><span class="long">{leafLabel[leaves[i]]}</span><span class="short">{leafCode[leaves[i]]}</span></th>
							{#each row.cells as v, j}
								{@const q = shade(v, row.total)}
								<td class:sep={j === model.danger[0]} class:inv={q >= 3} style="background:var(--q{q})">{v || ''}</td>
							{/each}
							<td class="sep held">{row.held || ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<p class="key">
				Central and cardiogenic are the two dangerous classes. Shade is the share of each row; n/a counts
				the cases held back.
			</p>
		</div>
	</div>
</figure>

<style>
	.control {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		margin-top: 1.5rem;
	}
	.control label {
		flex: 1 1 15rem;
		font-size: var(--step--1);
		color: var(--ink-2);
	}
	.control label strong {
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	input[type='range'] {
		flex: 4 1 14rem;
		min-width: 0;
		height: 2rem;
		accent-color: var(--indigo);
	}
	.control button {
		padding: 0.4rem 0.8rem;
		border: 1px solid var(--line-strong);
		border-radius: 2px;
		background: none;
		font-size: var(--step--1);
		cursor: pointer;
	}
	.control button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
		gap: 1rem 1.5rem;
		margin-top: 1.25rem;
	}
	dt {
		font-size: var(--step--1);
		color: var(--ink-2);
	}
	dd {
		font-family: var(--display);
		font-size: var(--step-2);
		font-weight: 600;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
	}
	dd .of,
	dd.aside {
		font-family: var(--sans);
		font-size: var(--step--1);
		font-weight: 400;
		color: var(--muted);
	}
	.split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
		gap: 1.5rem 2rem;
		align-items: start;
		margin-top: 0.75rem;
	}
	.band {
		fill: var(--c-a);
		opacity: 0.16;
	}
	.line {
		fill: none;
		stroke: var(--c-a);
		stroke-width: 2;
		stroke-linejoin: round;
	}
	.ref {
		stroke: var(--muted);
		stroke-dasharray: 4 4;
	}
	.cross {
		stroke: var(--ink);
		stroke-width: 1;
	}
	.now {
		fill: var(--c-a);
		stroke: var(--surface);
		stroke-width: 2;
	}

	.cm {
		container-type: inline-size;
		min-width: 0;
		margin-top: 1.25rem;
	}
	table {
		width: 100%;
		table-layout: fixed;
		border-collapse: separate;
		border-spacing: 2px;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}
	caption {
		caption-side: top;
		padding-bottom: 0.5rem;
		text-align: left;
		font-size: var(--step--1);
		color: var(--ink-2);
	}
	thead th {
		font-weight: 500;
		color: var(--muted);
	}
	thead td:first-child,
	tbody th {
		width: 9.5rem;
	}
	tbody th {
		padding-right: 0.5rem;
		text-align: left;
		font-weight: 400;
		color: var(--ink-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.short {
		display: none;
	}
	tbody td {
		height: 1.9rem;
		border-radius: 3px;
		text-align: center;
		color: var(--ink);
	}
	tbody td.inv {
		color: var(--paper);
		font-weight: 600;
	}
	tbody td.held {
		background: none;
		border: 1px dashed var(--line-strong);
		color: var(--ink-2);
	}
	.sep {
		border-left: 6px solid transparent;
		background-clip: padding-box;
	}
	tbody td.held.sep {
		border: 1px dashed var(--line-strong);
	}
	tr.gap > * {
		border-top: 6px solid transparent;
		background-clip: padding-box;
	}
	.key {
		margin-top: 0.6rem;
		font-size: var(--step--1);
		color: var(--muted);
	}
	@container (max-width: 30rem) {
		thead td:first-child,
		tbody th {
			width: 2.4rem;
		}
		.long {
			display: none;
		}
		.short {
			display: inline;
		}
		table {
			font-size: 10px;
			border-spacing: 1px;
		}
	}
</style>
