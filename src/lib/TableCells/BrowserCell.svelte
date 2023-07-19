<script lang="ts">
	import type { Browser } from '../../types';

	export let value: string;

	interface BrowserLogos {
		[key: string]: string;
	}

	const browsers: BrowserLogos = {
		Brave: 'https://seeklogo.com/images/B/brave-logo-F5E1D99D9E-seeklogo.com.png',
		Chrome:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/2048px-Google_Chrome_icon_%28February_2022%29.svg.png',
		'Chrome Beta':
			'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/2048px-Google_Chrome_icon_%28February_2022%29.svg.png',
		Edge: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Microsoft_Edge_logo_%282019%29.png'
	};
</script>

<img width="20px" alt={value} src={browsers[value]} />

<style>
	img {
		vertical-align: middle;
	}
</style>
