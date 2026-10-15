<script>
	// When I commit: weekday by hour, Santiago time.
	import activity from '#lib/data/activity.json';
	import { num } from '#lib/series.js';

	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	const grid = days.map((_, d) => Array.from({ length: 24 }, (_, hr) => activity.clock[`${d},${hr}`] ?? 0));
	const flat = grid.flatMap((row, d) => row.map((n, hr) => ({ d, hr, n })));
	const peak = flat.reduce((a, b) => (b.n > a.n ? b : a));
	const total = flat.reduce((a, c) => a + c.n, 0);
	const dawn = flat.filter((c) => c.hr >= 3 && c.hr < 8).reduce((a, c) => a + c.n, 0);

	// five equal steps of one hue; zero gets its own near-surface step
	const step = Math.ceil(peak.n / 5);
	const bin = (n) => (n === 0 ? 0 : Math.min(5, Math.ceil(n / step)));
	const bins = [
		{ q: 0, label: '0' },
		...Array.from({ length: 5 }, (_, i) => ({
			q: i + 1,
			label: `${i * step + 1} to ${Math.min(peak.n, (i + 1) * step)}`
		}))
	];
	const hh = (hr) => `${String(hr).padStart(2, '0')}:00`;

	let w = $state(720);
	let hover = $state(null);

	const left = 38;
	const cell = $derived((w - left) / 24);
	const ch = $derived(Math.max(14, Math.min(28, cell)));
	const h = $derived(ch * 7 + 22);
</script>

<figure class="figure">
	<h3>When I write it</h3>
	<p class="sub">
		Commits by weekday and hour, Santiago time. The busiest hour is {dayNames[peak.d]} from {hh(peak.hr)}
		with {peak.n} commits; only {Math.round((dawn / total) * 100)}% of everything lands between 03:00
		and 08:00.
	</p>

	<div class="plot" bind:clientWidth={w}>
		<svg width={w} height={h} role="img" aria-label="Heatmap of commits by weekday and hour" onpointerleave={() => (hover = null)}>
			{#each grid as row, d}
				<text x="0" y={d * ch + ch / 2 + 4}>{days[d]}</text>
				{#each row as n, hr}
					<rect
						class="cell"
						class:on={hover && hover.d === d && hover.hr === hr}
						x={left + hr * cell + 1}
						y={d * ch + 1}
						width={Math.max(1, cell - 2)}
						height={ch - 2}
						rx="2"
						fill="var(--q{bin(n)})"
						onpointerenter={() => (hover = { d, hr, n })}
					/>
				{/each}
			{/each}
			{#each [0, 6, 12, 18] as hr}
				<text x={left + hr * cell + 1} y={h - 4}>{hh(hr)}</text>
			{/each}
		</svg>

		{#if hover}
			<div
				class="tip"
				style="left:{Math.max(80, Math.min(w - 80, left + (hover.hr + 0.5) * cell))}px; top:{hover.d * ch}px"
			>
				<div class="tip-head">{dayNames[hover.d]}, {hh(hover.hr)} to {hh((hover.hr + 1) % 24)}</div>
				<strong>{num(hover.n)}</strong>
				{hover.n === 1 ? 'commit' : 'commits'}
			</div>
		{/if}
	</div>

	<ul class="legend" aria-label="Commits per hour">
		{#each bins as b}
			<li><span class="swatch" style="background:var(--q{b.q})"></span>{b.label}</li>
		{/each}
	</ul>

	<details class="table">
		<summary>Show the numbers</summary>
		<div class="scroll">
			<table>
				<thead>
					<tr>
						<th scope="col">Day</th>
						{#each grid[0] as _, hr}<th scope="col">{String(hr).padStart(2, '0')}</th>{/each}
					</tr>
				</thead>
				<tbody>
					{#each grid as row, d}
						<tr>
							<td>{days[d]}</td>
							{#each row as n}<td>{n || ''}</td>{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</details>
</figure>

<style>
	.cell.on {
		stroke: var(--ink);
		stroke-width: 2;
	}
</style>
