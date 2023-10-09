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
		faArrowRight,
		faEyeSlash,
		faEye
	} from '@fortawesome/free-solid-svg-icons';
	import SidebarElement from './SidebarElement.svelte';
	import { privacy, server, sidebarCollapsed } from '../datastore';
	import { page } from '$app/stores';

	export let toggle = () => {
		sidebarCollapsed.set(!$sidebarCollapsed);
	};

	export let togglePrivacy = () => {
		privacy.set(!$privacy);
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
			disabled: false
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
			disabled: false
		},
		{
			page: 'schedules',
			text: 'Schedules',
			icon: faClock,
			disabled: false
		},
		{
			page: 'winTracker',
			text: 'Win Tracker',
			icon: faTrophy,
			disabled: false
		},
		{
			page: 'dashboard',
			text: 'Dashboard',
			icon: faKey,
			disabled: false
		},
		{
			page: 'settings',
			text: 'Settings',
			icon: faGear,
			disabled: false
		}
	];
</script>

<div
	style="view-transition-name: nav ;"
	class={$sidebarCollapsed ? 'sidebar collapsed' : 'sidebar full'}
>
	<ul>
		<li style="margin-top: 20px; margin-bottom: 20px;">
			<SidebarElement
				icon={null}
				collapsed={$sidebarCollapsed}
				page=""
				image_src="../purplelogo.png"
				style="justify-content: center; !important"
				disabled={false}
			/>
		</li>
		{#each sidebar as item}
			<li
				aria-current={url.includes(item.page) ? 'page' : undefined}
				class={url.includes(item.page) ? 'active' : ''}
			>
				<SidebarElement
					text={item.text}
					page={item.page}
					icon={item.icon}
					collapsed={$sidebarCollapsed}
					disabled={item.disabled}
				/>
			</li>
		{/each}
	</ul>
	<div>
		<SidebarElement
			text={$server.version}
			icon={null}
			style={'settings'}
			collapsed={$sidebarCollapsed}
			page={null}
			disabled={false}
		/>
		<SidebarElement
			text={'Privacy'}
			icon={$privacy ? faEyeSlash : faEye}
			style={'settings'}
			collapsed={$sidebarCollapsed}
			page={null}
			onclick={togglePrivacy}
			disabled={false}
		/>
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
</div>

<style>
	.sidebar {
		text-decoration: none;
		background-color: var(--sidebar-background);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100vh;
		top: 0;
		left: 0;
		position: fixed;
		border-right: 1px solid var(--light-gray-2);
		background-color: var(--sidebar-background);
		z-index: 6;
	}
	.full {
		width: 170px;
	}

	.collapsed {
		width: 50px;
	}

	::-webkit-scrollbar {
		width: 0px;
		background: transparent; /* make scrollbar transparent */
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background-size: contain;
		flex-direction: column;
	}

	li {
		position: relative;
		height: 100%;
		width: 100%;
		margin: 2px 0;
	}

	li[aria-current='page']::before {
		content: '';
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0px;
		outline: 2px solid var(--primary);
		view-transition-name: active-page;
		border-radius: 0 6px 6px 0;
		z-index: -1;
		pointer-events: none;
	}
</style>
