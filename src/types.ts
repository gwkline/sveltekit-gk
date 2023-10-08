export type Task = {
	id: number;
	account_id: number;
	schedule_id: number;
	product: Product;
	result: string;
	created_at: string;
	updated_at: string;
	state: CheckoutState;
	status: string;
	headless: boolean;
	enable_images: boolean;
	release_datetime: string;
	max_expedited_shipping_price: number;
	browser_type: string;
	nike_module_type: string;
	account: Account | ShortAccount;
	schedule: Schedule | ShortSchedule;
	metadata: object | null;
	retry_mode: string;
	tags: Tag[];
	experimental_mode: boolean;
	cache_enabled: boolean;
	retry_non_winner: boolean;
	retry_on_decline: boolean;
};

export type ActivityTask = {
	id: number;
	account_id: number;
	schedule_id: number;
	created_at: string;
	updated_at: string;
	state: ActivityState;
	status: string;
	headless: boolean;
	enable_images: boolean;
	browser_type: string;
	mode: ActivityMode;
	account: Account | ShortAccount;
	schedule: Schedule | ShortSchedule;
	metadata: object | null;
	retry_mode: string;
	experimental_mode: boolean;
	cache_enabled: boolean;
	sms_configuration: SMSProvider;
};

export type ActivityMode =
	| 'login'
	| 'bp'
	| 'stories'
	| 'browse'
	| 'passwordreset'
	| 'addverifiednumber'
	| 'manual';

export type OutboundTask = {
	id: number;
	account_id: number;
	schedule_id: number;
	product: Product;
	result: string;
	created_at: string;
	updated_at: string;
	state: CheckoutState;
	status: string;
	headless: boolean;
	enable_images: boolean;
	release_datetime: string;
	max_expedited_shipping_price: number;
	browser_type: string;
	nike_module_type: string;
	account: Account | ShortAccount | null;
	schedule: Schedule | ShortSchedule;
	metadata: object | null;
	retry_mode: string;
	tags: Tag[];
	experimental_mode: boolean;
	cache_enabled: boolean;
	retry_non_winner: boolean;
	retry_on_decline: boolean;
};

export type NacTask = {
	id: number;
	account_id: number;
	created_at: null;
	updated_at: null;
	username: string;
	password: string;
	email: string;
	email_password: string;
	email_provider: string;
	email_folder: string | undefined;
	proxy: string;
	proxy_list_id: number;
	proxy_list: ProxyList;
	state: NacState;
	status: string;
	headless: boolean;
	enable_images: boolean;
	browser_type: string;
	account: Account;
	metadata: null;
	retry_mode: string;
	experimental_mode: boolean;
	profile_name_prefix: string;
	profile_tags: null;
	account_tags: Tag[];
	tags: Tag[];
	cache_enabled: boolean;
};

export type VerboseTask = Task | ActivityTask | OutboundTask | NacTask;

export type Product = {
	product_uri: string;
	size: string;
	allowed_random_sizes: string[];
	enable_random_sizing: boolean;
	product_id: string;
	properties: object | null;
};

export type ServerInfo = {
	latest_version: string;
	max_starting_limit: number;
	timestamp: string;
	update: boolean;
	version: string;
};

export type Account = {
	id: number;
	profile_id: number;
	proxy_list_id: number;
	proxy: string;
	profile: Profile | ShortProfile;
	proxy_list: ProxyList;
	username: string;
	password: string;
	email: string;
	email_password: string;
	email_type: string;
	email_provider: string;
	login_after_reset: boolean;
	send_reset_only: boolean;
	email_login_only: boolean;
	user_provided_password: string;
	type: number;
	updated_at: string;
	created_at: string;
	creation_method: string;
	metadata: AccountMetadata;
	tags: Tag[];
	previous_wins: PreviousWins;
	use_account_name: boolean;
	archived: boolean;
	status: string;
	analytics_properties: object | null;
};

export type ShortAccount = {
	id: number;
	profile_id: number;
	proxy_list_id: number;
	proxy: string;
	profile: ShortProfile;
	proxy_list: ProxyList;
	username: string;
	password: string;
	email: string;
	email_password: string;
	email_type: string;
	email_provider: string;
	login_after_reset: boolean;
	send_reset_only: boolean;
	email_login_only: boolean;
	user_provided_password: string;
	type: number;
	updated_at: string;
	created_at: string;
	creation_method: string;
	metadata: AccountMetadata;
	tags: Tag[];
	previous_wins: PreviousWins;
	use_account_name: boolean;
	archived: boolean;
	status: string;
	analytics_properties: object | null;
};

export type AccountMetadata = {
	bp_solved_at?: string;
	has_exclusive_offer?: boolean;
	local_storage?: object;
	logged_in: boolean;
	network_request_headers?: string;
	raw_cookie?: string;
	user_details?: object;
	user_session?: object;
	watched_stories?: object;
};

export type ProxyList = {
	id: number;
	name: string;
	proxies?: string[];
	updated_at?: string;
	previous_wins: PreviousWins;
	archived: boolean;
};

export type Profile = {
	id: number;
	name: string;
	payment_id: number;
	shipping: Shipping;
	updated_at: string;
	tags: Tag[];
	creation_method: string;
	payment: Payment | ShortPayment;
	previous_wins: PreviousWins;
	archived: boolean;
	analytics_properties: object;
};

export type ShortProfile = {
	id: number;
	name: string;
	tags: Tag[];
	payment: ShortPayment;
};

export type Payment = {
	id: number;
	card_name: string;
	card_number: string;
	card_type: string;
	ccv: string;
	exp_month: string;
	exp_year: string;
	billing_address: BillingAddress;
	billing_same_as_shipping: boolean;
	created_at: string;
	updated_at: string;
	tags: Tag[];
	archived: boolean;
};

export type ShortPayment = {
	id: number;
	tags: Tag[];
	card_name: string;
	card_type: string;
};

export type Shipping = {
	first_name: string;
	last_name: string;
	address_1: string;
	address_2: string;
	city: string;
	zip: string;
	state: string;
	country: string;
	phone_number: string;
};

export type BillingAddress = {
	city: string;
	zip: string;
	state: string;
	country: string;
	phone_number: string;
};

export type Schedule = {
	id: number;
	name: string;
	start_time: string;
	interval_seconds: number;
	repeating: boolean;
	created_at: string;
	updated_at: string;
};

export type ShortSchedule = {
	id: number;
	name: string;
	start_time: string;
	interval_seconds: number;
	repeating: boolean;
};

export type PreviousWins = {
	last_win: string | null;
	number_of_wins: number;
};

export type Tag = {
	name: string;
};

export type WebhookFields = {
	profile_name: boolean;
	shipping_address: boolean;
	card_number: boolean;
	payment_name: boolean;
};

export type SMSProvider = {
	friendly_name: string;
	provider: string;
	credentials: string;
	country: string;
};

export type Settings = {
	id: number;
	discord_webhook: string;
	discord_decline_webhook: string;
	license_key: string;
	user_id: string;
	max_starting_tasks: number;
	max_active_tasks: number;
	max_starting_activity_tasks: number;
	override_max_starting_tasks: boolean;
	override_max_starting_activity_tasks: boolean;
	proxy_test_url: string;
	region: string;
	log_level: string;
	show_archived: boolean;
	show_sensitive_data: boolean;
	proxy_test_timeout_seconds: number;
	server_id: string;
	created_at: string;
	updated_at: string;
	webhook_fields: WebhookFields;
	browser: string;
	bypass_mode: string;
	resolution_bypass: boolean;
	requeue_on_error: boolean;
	sms_providers: SMSProvider[];
	max_retry_attempts: number;
	large_server: boolean;
	skip_bp: boolean;
};

export type EventData = {
	type: string;
	data: {
		id: number;
		state: CheckoutState;
		status: string;
	};
};

export type CheckoutState =
	| 'Ready'
	| 'Queued'
	| 'Starting'
	| 'Running'
	| 'Waiting'
	| 'Error'
	| 'AwaitingResults'
	| 'Winning'
	| 'Complete';

export type ActivityState =
	| 'Ready'
	| 'Queued'
	| 'Starting'
	| 'Running'
	| 'Waiting'
	| 'Error'
	| 'Complete';

export type NacState =
	| 'Ready'
	| 'Queued'
	| 'Starting'
	| 'Running'
	| 'Waiting'
	| 'Error'
	| 'Complete';

export type WhopMembershipStatusType =
	| 'trialing'
	| 'active'
	| 'past_due'
	| 'completed'
	| 'canceled'
	| 'expired'
	| 'unresolved';
export type WhopPaymentProcessorType = 'free' | 'stripe' | 'coinbase' | 'crypto' | 'paypal';

export type WhopDiscordObjectType = {
	id: string;
	username: string;
	image_url: string;
};

export type WhopSmartContractType = {
	contract_address: string;
	contract_name: string;
};
export type WhopNFTTokensObjectType = {
	token_id: string;
	current_holder: string;
	smart_contract: WhopSmartContractType;
	balance: number;
	metadata: Record<string, string | number | object>[];
};

export type WhopMembershipType = {
	id: string;
	product: string;
	user: string;
	plan: string;
	promo_code: string;
	email: string;
	stripe_subscription_id: string;
	stripe_customer_id: string;
	status: WhopMembershipStatusType;
	valid: boolean;
	cancel_at_period_end: boolean;
	payment_processor: WhopPaymentProcessorType;
	quantity: number;
	wallet_address: string;
	custom_fields_responses: string[];
	custom_fields_responses_v2: string[];
	discord: WhopDiscordObjectType;
	nft_tokens: WhopNFTTokensObjectType[];
	metadata: Record<string, string | number | object>;
	expires_at: number;
	license_key: string;
	renewal_period_start: number;
	renewal_period_end: number;
	created_at: number;
	manage_url: string;
	affiliate_page_url: string;
	checkout_session: string;
	access_pass: string;
	deliveries: Record<string, string>[];
	telegram_account_id: string;
};

export type WhopPaginationType = {
	current_page: number;
	total_page: number;
	total_count: number;
};

export type WhopResponseBodyType = {
	pagination: WhopPaginationType;
	data: WhopMembershipType[];
};

export type HeaderConfigType<T> = {
	[key: string]: (object: T) => string;
};

export interface TableRowType<T> {
	index: number;
	itemId: number;
	thisItem: T;
	[header: string]: any;
}

export type WhopApiLoad = {
	apiKey: string;
	clientId: string;
	secretId: string;
};

export type LaunchType = {
	product_id: string;
	name: string;
	uri: string;
	image_url: string;
	style_code: string;
	release_time: string;
	allowed_sizes: string[];
};

export type SizePresets = {
	mens: {
		[key: string]: string[];
	};
	womens: {
		[key: string]: string[];
	};
	youth: {
		[key: string]: string[];
	};
	toddler: {
		[key: string]: string[];
	};
	preschool: {
		[key: string]: string[];
	};
};

export type SortState = {
	column: string | null;
	direction: -1 | 0 | 1;
};

export type Browser = 'Chrome' | 'Chrome Beta' | 'Edge' | 'Brave';

export type states =
	| 'start'
	| 'stop'
	| 'delete'
	| 'duplicate'
	| 'edit'
	| 'create'
	| 'focus'
	| 'startIndiv'
	| 'stopIndiv'
	| 'deleteIndiv'
	| 'editActivity'
	| 'editSchedule';

export type SettingsKeys =
	| 'max_active_tasks'
	| 'max_starting_tasks'
	| 'max_starting_activity_tasks';

export type Win = {
	id: number;
	site: string;
	account_name: string;
	product_name: string;
	style_color_code: string;
	order_status: string;
	tracking_number: string;
	order_number: string;
	size: string;
	image_url: string;
	shipping_address: string;
	profile_name: string;
	browser_mode: string;
	declined: boolean;
	proxy: string;
	experimental_mode: boolean;
	browser_type: string;
	subtotal: number;
	taxtotal: number;
	total: number;
	tax_percentage: number;
	bypass_applied: boolean;
	checkout_date: string;
	last_modified: string;
	tags: Tag[];
	order_first_name: string;
	order_last_name: string;
};
