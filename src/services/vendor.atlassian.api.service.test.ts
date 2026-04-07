import { request } from './vendor.atlassian.api.service.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

const ORIGINAL_ENV = { ...process.env };
const TEMP_DIRECTORIES: string[] = [];

function setProfiles(): void {
	const tempDir = fs.mkdtempSync(
		path.join(os.tmpdir(), 'jira-service-profiles-'),
	);
	TEMP_DIRECTORIES.push(tempDir);

	const filePath = path.join(tempDir, 'jira-profiles.json');
	fs.writeFileSync(
		filePath,
		JSON.stringify({
			defaultProfile: 'client-a',
			profiles: {
				'client-a': {
					siteName: 'client-a',
					userEmail: 'a@example.com',
					apiToken: 'token-a',
				},
				'client-b': {
					siteName: 'client-b',
					userEmail: 'b@example.com',
					apiToken: 'token-b',
				},
			},
		}),
		'utf8',
	);

	process.env.ATLASSIAN_PROFILES_FILE = filePath;
}

describe('VendorAtlassianApiService', () => {
	beforeEach(() => {
		process.env = { ...ORIGINAL_ENV };
		delete process.env.ATLASSIAN_SITE_NAME;
		delete process.env.ATLASSIAN_USER_EMAIL;
		delete process.env.ATLASSIAN_API_TOKEN;
		delete process.env.ATLASSIAN_PROFILES_FILE;
		delete process.env.ATLASSIAN_PROFILES_JSON;
		delete process.env.ATLASSIAN_DEFAULT_PROFILE;

		Object.defineProperty(global, 'fetch', {
			value: jest.fn().mockResolvedValue({
				ok: true,
				status: 204,
				statusText: 'No Content',
				headers: new Headers(),
			}),
			writable: true,
		});
	});

	afterAll(() => {
		for (const tempDir of TEMP_DIRECTORIES) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
		process.env = ORIGINAL_ENV;
	});

	it('uses the explicitly requested profile for the Jira base URL', async () => {
		setProfiles();

		await request('/rest/api/3/project/search', {
			method: 'GET',
			profile: 'client-b',
		});

		expect(global.fetch).toHaveBeenCalledWith(
			'https://client-b.atlassian.net/rest/api/3/project/search',
			expect.any(Object),
		);
	});

	it('uses the default profile when the request omits profile', async () => {
		setProfiles();

		await request('/rest/api/3/project/search', {
			method: 'GET',
		});

		expect(global.fetch).toHaveBeenCalledWith(
			'https://client-a.atlassian.net/rest/api/3/project/search',
			expect.any(Object),
		);
	});

	it('fails before making a Jira call when the profile is unknown', async () => {
		setProfiles();

		await expect(
			request('/rest/api/3/project/search', {
				method: 'GET',
				profile: 'missing',
			}),
		).rejects.toThrow('Unknown Jira profile "missing"');

		expect(global.fetch).not.toHaveBeenCalled();
	});

	it('fails before making a Jira call when ATLASSIAN_PROFILES_JSON is configured', async () => {
		process.env.ATLASSIAN_PROFILES_JSON = '{"client-a":{}}';

		await expect(
			request('/rest/api/3/project/search', {
				method: 'GET',
			}),
		).rejects.toThrow('Unsupported ATLASSIAN_PROFILES_JSON configuration');

		expect(global.fetch).not.toHaveBeenCalled();
	});
});
