import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { afterEach, describe, it, expect, vi } from "vitest";
import worker from "../src/index";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("PatientPrep AI coach worker", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("rejects non-POST requests with a JSON 405 response", async () => {
		const request = new IncomingRequest("http://example.com");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(405);
		expect(await response.json()).toEqual({
			error: "Method not allowed. Use POST.",
		});
	});

	it("handles CORS preflight requests", async () => {
		const request = new IncomingRequest("http://example.com", {
			method: "OPTIONS",
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(204);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
		expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
			"POST"
		);
	});

	it("returns coach content from Groq for valid POST requests", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				Response.json({
					choices: [
						{
							message: {
								content: "Prepare a short symptom timeline for your doctor.",
							},
						},
					],
				})
			)
		);

		const request = new IncomingRequest("http://example.com", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messages: [
					{
						role: "user",
						content: "What should I ask my doctor?",
					},
				],
				symptomCategory: "general",
				medicationCount: 1,
				language: "English",
			}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(
			request,
			{ ...env, GROQ_API_KEY: "test-key" },
			ctx
		);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			content: "Prepare a short symptom timeline for your doctor.",
		});
	});

	it("rejects non-POST requests in integration style", async () => {
		const response = await SELF.fetch("https://example.com");

		expect(response.status).toBe(405);
		expect(await response.json()).toEqual({
			error: "Method not allowed. Use POST.",
		});
	});
});
