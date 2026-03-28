//#region src/lib/api.ts
var API_BASE = "http://localhost:54321";
async function request(path, init) {
	const json = await (await fetch(`${API_BASE}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...init?.headers
		}
	})).json();
	if (!json.ok) throw new ApiError(json.error?.message ?? "Unknown error", json.error);
	return json.data;
}
var ApiError = class extends Error {
	constructor(message, details) {
		super(message);
		this.details = details;
		this.name = "ApiError";
	}
};
function fetchMonitor(params) {
	const sp = new URLSearchParams();
	if (params?.sort) sp.set("sort", params.sort);
	if (params?.search) sp.set("search", params.search);
	if (params?.include_closed) sp.set("include_closed", "true");
	const qs = sp.toString();
	return request(`/v1/monitor${qs ? `?${qs}` : ""}`);
}
function fetchIssue(id) {
	return request(`/v1/issues/${id}`);
}
function fetchStats() {
	return request("/v1/stats");
}
function createIssue(input) {
	return request("/v1/issues", {
		method: "POST",
		body: JSON.stringify(input)
	});
}
function deleteIssue(id) {
	return request(`/v1/issues/${id}`, { method: "DELETE" });
}
function transitionIssue(id, action, reason) {
	return request(`/v1/issues/${id}/${action}`, {
		method: "POST",
		body: JSON.stringify(reason ? { reason } : {})
	});
}
function addComment(issueId, text) {
	return request(`/v1/issues/${issueId}/comments`, {
		method: "POST",
		body: JSON.stringify({ text })
	});
}
function getEventsUrl() {
	return `${API_BASE}/v1/events`;
}
//#endregion
export { fetchMonitor as a, transitionIssue as c, fetchIssue as i, createIssue as n, fetchStats as o, deleteIssue as r, getEventsUrl as s, addComment as t };
