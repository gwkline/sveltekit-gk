<script lang="ts">
	import {
		faGear,
		faUsers,
		faCreditCard,
		faSignal,
		faAddressCard,
		faClock,
		faPersonRunning,
		faFlask,
		faTicket,
		faTrophy,
		faKey,
		faCamera,
		faArrowLeft,
		faArrowRight
	} from '@fortawesome/free-solid-svg-icons';
	import SidebarElement from './SidebarElement.svelte';
	import { sidebarCollapsed } from '../datastore';
	import { page } from '$app/stores';

	export let toggle = () => {
		sidebarCollapsed.set(!$sidebarCollapsed);
	};

	let url = ``;
	$: {
		url = $page.url.pathname;
	}

	let sidebar = [
		{
			page: 'checkout',
			text: 'Checkout Tasks',
			icon: faTicket,
			disabled: false
		},
		{
			page: 'accountActivity',
			text: 'Account Activity',
			icon: faPersonRunning,
			disabled: false
		},
		{
			page: 'accountCreation',
			text: 'Account Creation',
			icon: faFlask,
			disabled: true
		},
		{
			page: 'accounts',
			text: 'Accounts',
			icon: faUsers,
			disabled: false
		},
		{
			page: 'profiles',
			text: 'Profiles',
			icon: faAddressCard,
			disabled: false
		},
		{
			page: 'payments',
			text: 'Payments',
			icon: faCreditCard,
			disabled: false
		},
		{
			page: 'proxies',
			text: 'Proxies',
			icon: faSignal,
			disabled: true
		},
		{
			page: 'schedules',
			text: 'Schedules',
			icon: faClock,
			disabled: true
		},
		{
			page: 'winTracker',
			text: 'Win Tracker',
			icon: faTrophy,
			disabled: true
		},
		{
			page: 'dashboard',
			text: 'Dashboard',
			icon: faKey,
			disabled: false
		},
		{
			page: 'showcases',
			text: 'Showcases',
			icon: faCamera,
			disabled: false
		}
	];
</script>

<div class={$sidebarCollapsed ? 'collapsed' : 'sidebar'}>
	<ul>
		<li style="margin-top: 20px; margin-bottom: 20px;">
			<SidebarElement
				icon={null}
				collapsed={$sidebarCollapsed}
				page={''}
				image_src="../bluelogo.png"
				disabled={false}
			/>
		</li>
		{#each sidebar as item}
			<li>
				<div class={url.includes(item.page) ? 'active' : ''}>
					<SidebarElement
						text={item.text}
						page={item.page}
						icon={item.icon}
						collapsed={$sidebarCollapsed}
						disabled={item.disabled}
					/>
				</div>
			</li>
		{/each}
	</ul>
</div>
<div class={$sidebarCollapsed ? 'collapse-collapsed' : 'collapse'}>
	<SidebarElement
		text={'Collapse'}
		icon={$sidebarCollapsed ? faArrowRight : faArrowLeft}
		style={'settings'}
		collapsed={$sidebarCollapsed}
		page={null}
		onclick={toggle}
		disabled={false}
	/>
</div>

<div class={$sidebarCollapsed ? 'settings-collapsed' : 'settings'}>
	<div class={url.includes('settings') ? 'active' : ''}>
		<SidebarElement
			text={'Settings'}
			page={'settings'}
			icon={faGear}
			style={'settings'}
			collapsed={$sidebarCollapsed}
			disabled={true}
		/>
	</div>
</div>

<style>
	* {
		list-style: none;
		text-decoration: none;
		margin: 0;
		padding: 0;
		z-index: 4;
		background-color: var(--sidebar-background);
	}

	::-webkit-scrollbar {
		width: 0px;
		background: transparent; /* make scrollbar transparent */
	}

	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		width: 225px;
		height: 100vh;
		border-right: 1px solid var(--light-gray-1);
		background-color: var(--sidebar-background);
	}

	.collapsed {
		position: fixed;
		top: 0;
		left: 0;
		width: 50px;
		height: 100vh;
		border-right: 1px solid var(--light-gray-1);
	}

	.active::after,
	.active::before {
		height: 100%;
		content: ' ';
		position: absolute;
		top: 0;
		width: 4px;
		border-radius: 0px 6px 6px 0px;
		height: 100%;
	}

	.active::before {
		left: 0;
		background-color: var(--primary);
	}

	ul li div {
		display: block;
		position: relative;
	}

	ul {
		height: 80%;
	}

	.settings {
		bottom: 0;
		position: fixed;
		width: 224px;
	}
	.settings-collapsed {
		bottom: 0;
		position: fixed;
		width: 50px;
	}

	.collapse {
		bottom: 50px;
		position: fixed;
		width: 224px;
	}
	.collapse-collapsed {
		bottom: 50px;
		position: fixed;
		width: 50px;
	}
</style>
