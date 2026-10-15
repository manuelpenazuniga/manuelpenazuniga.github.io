<script>
	// Hidden things. None of them are needed to read the page.
	import { onMount } from 'svelte';

	const KONAMI = 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a';
	const FILM = 'p o r t r a';
	const DESERT = 'a t a c a m a';

	onMount(() => {
		console.log(
			'%c' +
				[
					'            /\\',
					'       /\\  /  \\      /\\',
					'  /\\  /  \\/    \\  /\\/  \\    /\\',
					' /  \\/          \\/      \\  /  \\',
					'/                        \\/    \\'
				].join('\n'),
			'color:#ffb547;font-family:monospace'
		);
		console.log(
			'You opened the console, so: press ` for a terminal, try the Konami code, or type the name of the Kodak film I shoot (six letters, starts with p), or name the driest desert on Earth.'
		);

		let keys = [];
		const onKey = (e) => {
			if (e.target.closest?.('input, textarea, [contenteditable]')) return;
			keys = [...keys, e.key].slice(-10);
			const typed = keys.join(' ');
			if (typed.endsWith(KONAMI)) {
				dispatchEvent(new CustomEvent('alpaca:walk'));
				document.querySelector('.ridge')?.scrollIntoView({ block: 'center' });
			}
			if (typed.endsWith(FILM)) document.documentElement.toggleAttribute('data-film');
			if (typed.endsWith(DESERT)) document.documentElement.toggleAttribute('data-stars');
		};
		addEventListener('keydown', onKey);

		// leave the tab and the agent is on its own
		let title = document.title;
		const onVisibility = () => {
			if (document.hidden) {
				title = document.title;
				document.title = 'The agent is unsupervised…';
			} else {
				document.title = title;
			}
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			removeEventListener('keydown', onKey);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});
</script>
