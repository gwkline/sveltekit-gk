import axios, { type AxiosResponse } from 'axios';
export const makeRequest = (
	method: string,
	url: string,
	data: object | null = null,
	callback: (response: AxiosResponse) => void = (response) => {
		if (response.status > 399) {
			console.log('Request Error:', response.status, response.data);
		}
	},
	headers = {}
) => {
	const defaultHeaders = {
		accept: '*/*',
		'accept-language': 'en-US,en;q=0.9',
		'content-type': 'text/plain;charset=UTF-8'
	};

	return axios
		.request({
			method: method,
			url: url,
			headers: { ...defaultHeaders, ...headers },
			data: data
		})
		.then((response) => {
			if (callback) {
				callback(response);
			}
			return response;
		})
		.catch((error) => {
			console.log('Request Error:', error);
		});
};
