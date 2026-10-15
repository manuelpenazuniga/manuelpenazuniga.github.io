// Everything the page says about me lives here, so copy changes never touch markup.

export const site = {
	name: 'Manuel Peña',
	url: 'https://manuelpenazuniga.github.io',
	title: 'Manuel Peña · AI safety engineering, in Rust',
	description:
		'I build the layer under AI agents that cannot be talked out of its job: kernel sandboxes, hard budget caps, escalate-only clinical rails and contracts that verify proofs. Mostly in Rust, from Chile.',
	github: 'https://github.com/manuelpenazuniga',
	links: [
		{ label: 'GitHub', href: 'https://github.com/manuelpenazuniga' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/manuelpz-dev/' },
		{ label: 'Telegram', href: 'https://t.me/manuelpenazuniga' },
		{ label: 'X', href: 'https://x.com/manuelpz_dev' },
		{ label: 'Medium', href: 'https://medium.com/@manuelpz.dev' }
	]
};

// The three rules every project below follows.
export const principles = [
	{
		title: 'Enforce outside the model',
		text: 'A system prompt is a request. A kernel sandbox, a proxy or a smart contract is a rule. The controls that matter sit where the model cannot reach them.',
		seen: 'ClawCrate, PennyPrompt, Ohu'
	},
	{
		title: 'Fail closed',
		text: 'When the budget is spent or the check cannot run, the answer is no. In triage the model may raise urgency by one level and never lower it.',
		seen: 'PennyPrompt, Clinibrium'
	},
	{
		title: 'Leave evidence',
		text: 'Every decision writes something a third party can verify without trusting me: a signed receipt, an audit trail, a proof, a benchmark that either matches or does not.',
		seen: 'ClawCrate, CerberusGuard, HIPnosis, VeritasVoice'
	}
];

const gh = (repo) => `https://github.com/manuelpenazuniga/${repo}`;

// `lang` must be a key of `series` in #lib/series.js: the dot beside each
// project wears the same colour that language has in the charts.
export const veins = [
	{
		id: 'agents',
		title: 'Making agents safe to run',
		lead: 'An agent is a loop with shell access and a credit card. These put a hard stop under it.',
		projects: [
			{
				name: 'ClawCrate',
				href: gh('ClawCrate'),
				lang: 'rust',
				what: 'Sandbox for agent commands and MCP servers. No Docker, no root, one binary, and a signed receipt for everything it ran.',
				decides: 'The kernel: Landlock, seccomp, Seatbelt'
			},
			{
				name: 'PennyPrompt',
				href: gh('PennyPrompt'),
				lang: 'rust',
				what: 'Reverse proxy that prices every model call as it happens and pauses the agent when the money runs out.',
				decides: 'A budget cap, answered with HTTP 402'
			},
			{
				name: 'CerberusGuard',
				href: gh('CerberusGuard'),
				lang: 'python',
				what: 'Three heads for production agents (prompts, money, syscalls) writing to one audit trail.',
				decides: 'Three independent checks'
			}
		]
	},
	{
		id: 'llms',
		title: 'LLMs on a short leash',
		lead: 'The model does the reasoning. It never gets to grade its own homework.',
		projects: [
			{
				name: 'HIPnosis',
				href: gh('HIPnosis'),
				lang: 'python',
				what: 'Agent that ports CUDA code to ROCm and only keeps a port once the numbers match.',
				decides: 'Numerical parity on an AMD MI300X'
			},
			{
				name: 'Clinibrium',
				href: gh('Clinibrium'),
				lang: 'python',
				what: 'Vertigo triage co-pilot. Claude reasons and explains; it can raise urgency one level and never lower it. Built during Built with Claude: Life Sciences.',
				decides: 'An escalate-only clinical rail, then the physician'
			},
			{
				name: 'vertigoDx',
				href: gh('vertigoDx'),
				lang: 'ts',
				what: 'The same clinical problem, fully offline on Gemma 4 for clinics without reliable internet. Patient data never leaves the laptop.',
				decides: ''
			},
			{
				name: 'LaForja',
				href: gh('LaForja'),
				lang: 'ts',
				what: 'Students write math exam problems, and LLM reviewers try to break them.',
				decides: ''
			}
		]
	},
	{
		id: 'contracts',
		title: 'Contracts that say no',
		lead: 'When the thing being decided is money or a vote, the last word belongs on-chain.',
		projects: [
			{
				name: 'Ohu',
				href: gh('ohu'),
				lang: 'rust',
				what: 'Cooperative procurement where an LLM swarm runs the season and never touches the funds.',
				decides: 'A Casper contract: escrow, bonds, settlement'
			},
			{
				name: 'VeritasVoice',
				href: gh('veritasvoice'),
				lang: 'ts',
				what: 'Anonymous feedback that still proves the author belongs to the group.',
				decides: 'Groth16 verified inside a Soroban contract'
			},
			{
				name: 'HollyWars',
				href: gh('HollyWars-SolanaZK-edition'),
				lang: 'ts',
				what: 'Anonymous, sybil-resistant voting on Solana. Your indentation style decides your vote weight.',
				decides: 'ZK ballots checked on-chain'
			},
			{
				name: 'chainSentinel',
				href: gh('chainSentinel'),
				lang: 'solidity',
				what: 'Watches Polkadot DeFi transactions for exploit patterns and pulls the funds out before the exploit lands.',
				decides: 'Heuristics and an LLM, in two layers'
			}
		]
	}
];

export const path = [
	{
		when: '2025 to now',
		where: 'Open source',
		role: 'Rust, AI systems, zero-knowledge',
		what: 'Everything in the sections above, built in the open and mostly at hackathons: sandboxes and budget proxies for agents, clinical triage under hard rails, and contracts that verify proofs.'
	},
	{
		when: '2022 to 2023',
		where: 'ZK Blockchain Services',
		role: 'Web3 developer and smart contract analyst',
		what: 'Shipped four projects across NFTs, governance and asset tokenization: tokenomics analysis, gas optimization and contract audits with Foundry, Hardhat and Ethers.js.'
	},
	{
		when: '2022 to 2023',
		where: 'Kawésqar VC',
		role: 'Blockchain analyst, then advisor',
		what: 'Technical due diligence on the fund’s blockchain portfolio, mostly real-estate and asset tokenization. Wrote and deployed contracts on Polygon and led their first audits.'
	},
	{
		when: '2018 to 2022',
		where: 'The Brunch Company',
		role: 'R&D manager, then head of innovation',
		what: 'Formulated food with computational models instead of trial and error, and built a blockchain traceability platform for fair-trade suppliers, which is how I ended up in Web3.',
		figures: [
			{ value: '18 → 7 months', label: 'to develop a new product line' },
			{ value: '−43%', label: 'food waste' },
			{ value: '+27%', label: 'sales margin against earlier lines' }
		]
	},
	{
		when: '2015 to 2018',
		where: 'The Drying Factory',
		role: 'R&D engineer, then head of innovation',
		what: 'Heat and mass transfer models to optimize fruit dehydration: better nutrition and flavour for less energy.',
		figures: [{ value: '−65%', label: 'temperature peaks during drying' }]
	},
	{
		when: '2012 to 2014',
		where: 'Websurf',
		role: 'Backend developer',
		what: 'Java, JavaScript and PHP: web application performance, database integration and WordPress builds.'
	}
];

// `owner` is the key in data/sides.json, where the commit counts come from.
export const sides = [
	{
		owner: 'entrenatupaes',
		name: 'EntrenaTuPAES',
		href: 'https://entrenatupaes.cl/',
		role: 'Co-founder and sole developer',
		what: 'A prep academy for PAES, Chile’s university-entrance exam. I wrote its LMS and I am the only one who commits to it.'
	},
	{
		owner: 'fundacionrescatedemascotas',
		name: 'Fundación Rescate de Mascotas',
		href: 'https://fundacionrescatedemascotas.cl/en-memoria',
		role: 'Volunteer and sole developer',
		what: 'The foundation’s donation platform. A gift in someone’s memory funds a specific rescued dog, and you can follow it until it’s adopted.'
	}
];

export const education = [
	{ what: 'MSc in Engineering Sciences', where: 'Pontificia Universidad Católica de Chile', when: '2017 to 2019' },
	{ what: 'Biotechnology Engineering', where: 'Pontificia Universidad Católica de Chile', when: '2011 to 2016' },
	{ what: 'Diploma in Operations Management', where: 'Universidad Andrés Bello', when: '2023' },
	{ what: 'Diploma in Digital Product and Services Development', where: 'Pontificia Universidad Católica de Chile', when: '2014 to 2016' }
];

export const recognition = [
	{ what: 'National Social Impact Award', by: 'YouthActionNet Chile', year: 2022, href: 'https://premioimpactosocial.cl/fellows/manuel-pena/' },
	{ what: 'Best Food Innovations in the Chilean market', by: 'Transforma Alimentos', year: 2022 },
	{ what: 'Avonni National Innovation Award', by: 'Foro Innovación and Chile’s Ministry of Economy', year: 2021, href: 'https://avonni.cl/ganadores/hakari/' },
	{ what: 'Best Food Innovations in the Chilean market', by: 'Transforma Alimentos', year: 2020 },
	{ what: 'Top 100 young biotech leaders in Latin America', by: 'Allbiotech', year: 2017, href: 'https://allbiotech.org/project/manuel-pena-zuniga/' }
];
