<script>
	import { site } from '#lib/content.js';
	import Hero from '#lib/components/Hero.svelte';
	import Approach from '#lib/components/Approach.svelte';
	import Work from '#lib/components/Work.svelte';
	import Lab from '#lib/components/Lab.svelte';
	import Sides from '#lib/components/Sides.svelte';
	import Strata from '#lib/components/Strata.svelte';
	import Clock from '#lib/components/Clock.svelte';
	import Writing from '#lib/components/Writing.svelte';
	import Path from '#lib/components/Path.svelte';
	import Footer from '#lib/components/Footer.svelte';

	const person = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: site.name,
		url: site.url,
		description: site.description,
		address: { '@type': 'PostalAddress', addressCountry: 'CL' },
		sameAs: site.links.map((l) => l.href)
	};
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<link rel="canonical" href={site.url} />
	<meta property="og:type" content="profile" />
	<meta property="og:title" content={site.title} />
	<meta property="og:description" content={site.description} />
	<meta property="og:url" content={site.url} />
	<meta property="og:image" content="{site.url}/avatar.jpg" />
	<meta name="twitter:card" content="summary" />
	{@html `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</` + `script>`}
</svelte:head>

<Hero />
<Approach />
<Work />
<Lab />
<Sides />

<section id="data" class="wrap band">
	<h2>Field data</h2>
	<div class="band-body">
		<p class="lead">
			My own commit history, collected by a script and redrawn every day. Only counts are stored:
			no repository names and no messages.
		</p>
		<div class="figs">
			<Strata />
			<Clock />
		</div>
	</div>
</section>

<Writing />
<Path />
<Footer />

<style>
	.figs {
		margin-top: 2rem;
	}
</style>
