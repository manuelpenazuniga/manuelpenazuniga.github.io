<script>
	import { path, education, recognition } from '#lib/content.js';
</script>

<section id="path" class="wrap band">
	<h2>Path</h2>
	<div class="band-body">
		<p class="lead">
			I trained as a biotechnology engineer and modelled food processes for years before I wrote a
			smart contract. The same habit runs through all of it: write the model down, then make
			something check it.
		</p>

		<ol class="steps">
			{#each path as step}
				<li>
					<div class="when">{step.when}</div>
					<div>
						<h3>{step.where}</h3>
						<p class="role">{step.role}</p>
						<p class="what">{step.what}</p>
						{#if step.figures}
							<dl class="figures">
								{#each step.figures as f}
									<div>
										<dt>{f.label}</dt>
										<dd>{f.value}</dd>
									</div>
								{/each}
							</dl>
						{/if}
					</div>
				</li>
			{/each}
		</ol>

		<div class="cols">
			<div>
				<h3 class="minor">Studied</h3>
				<ul class="plain">
					{#each education as e}
						<li><strong>{e.what}</strong><span>{e.where}, {e.when}</span></li>
					{/each}
				</ul>
			</div>
			<div>
				<h3 class="minor">Recognition</h3>
				<ul class="plain">
					{#each recognition as r}
						<li>
							{#if r.href}<a href={r.href}>{r.what}</a>{:else}<strong>{r.what}</strong>{/if}
							<span>{r.by}, {r.year}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>

<style>
	.steps {
		margin-top: 2.5rem;
	}
	.steps li {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		gap: 0.25rem 1.5rem;
		padding-block: 1.4rem;
		border-top: 1px solid var(--line);
	}
	.when {
		font-size: var(--step--1);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		padding-top: 0.3rem;
	}
	.steps h3 {
		font-family: var(--display);
		font-weight: 600;
		font-size: var(--step-1);
	}
	.role {
		color: var(--ink-2);
		margin-top: 0.15rem;
	}
	.what {
		margin-top: 0.6rem;
		max-width: var(--measure);
		color: var(--ink-2);
	}
	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2.5rem;
		margin-top: 1rem;
	}
	.figures div {
		display: flex;
		flex-direction: column-reverse;
	}
	.figures dd {
		font-family: var(--display);
		font-size: var(--step-1);
		font-weight: 600;
	}
	.figures dt {
		font-size: var(--step--1);
		color: var(--muted);
	}
	.cols {
		display: grid;
		gap: 0 3rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--line);
	}
	@media (min-width: 46rem) {
		.cols {
			grid-template-columns: 1fr 1fr;
		}
	}
	.minor {
		margin-top: 1.5rem;
		font-size: var(--step--1);
		font-weight: 400;
		color: var(--muted);
	}
	.plain li {
		display: grid;
		padding-block: 0.6rem;
	}
	.plain span {
		font-size: var(--step--1);
		color: var(--ink-2);
	}
	@media (max-width: 40rem) {
		.steps li {
			grid-template-columns: 1fr;
		}
	}
</style>
