export type Task = {
	id: number;
	account_id: number;
	schedule_id: number;
	product: Product;
	result: string;
	created_at: string;
	updated_at: string;
	state: State;
	status: string;
	headless: boolean;
	enable_images: boolean;
	release_datetime: string;
	max_expedited_shipping_price: number;
	browser_type: string;
	nike_module_type: string;
	account: Account | ShortAccount;
	schedule: Schedule;
	metadata: object;
	retry_mode: string;
	tags: Tag[];
	experimental_mode: boolean;
	cache_enabled: boolean;
	retry_non_winner: boolean;
	retry_on_decline: boolean;
};

export type Product = {
	product_uri: string;
	size: string;
	allowed_random_sizes: string[];
	enable_random_sizing: boolean;
	product_id: string;
	properties: object;
};

export type Account = {
	id: number;
	profile_id: number;
	proxy_list_id: number;
	proxy: string;
	profile: Profile | ShortProfile;
	proxy_list: object;
	username: string;
	password: string;
	creation_method: string;
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
	metadata: object;
	tags: Tag[];
	previous_wins: PreviousWins;
	use_account_name: boolean;
	archived: boolean;
	status: string;
	analytics_properties: object;
};

export type ShortAccount = {
	id: number;
	username: string;
	proxy: string;
	profile: ShortProfile;
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
};

export type PreviousWins = {
	last_win: string | undefined;
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
		state: State;
		status: string;
	};
};

export type State =
	| 'Ready'
	| 'Queued'
	| 'Starting'
	| 'Running'
	| 'Waiting'
	| 'Error'
	| 'Entered'
	| 'Winning';

export type TableRowType = Record<string, string>;
