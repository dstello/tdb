import { s as getEventsUrl } from "./api-BtRJ_phB.js";
import { t as Route$2 } from "./issues._id-bGYcuepA.js";
import { useEffect, useRef } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRoute, createRouter, lazyRouteComponent } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
//#region src/lib/sse.ts
function useSSE() {
	const queryClient = useQueryClient();
	const esRef = useRef(null);
	useEffect(() => {
		let retryDelay = 1e3;
		function connect() {
			const es = new EventSource(getEventsUrl());
			esRef.current = es;
			es.addEventListener("refresh", () => {
				queryClient.invalidateQueries();
				retryDelay = 1e3;
			});
			es.addEventListener("ping", () => {
				retryDelay = 1e3;
			});
			es.onerror = () => {
				es.close();
				setTimeout(connect, retryDelay);
				retryDelay = Math.min(retryDelay * 2, 1e4);
			};
		}
		connect();
		return () => {
			esRef.current?.close();
		};
	}, [queryClient]);
}
//#endregion
//#region src/styles.css?url
var styles_default = "/assets/styles-BW1zYqtB.css";
//#endregion
//#region src/routes/__root.tsx
var queryClient = new QueryClient({ defaultOptions: { queries: {
	staleTime: 1e4,
	refetchOnWindowFocus: true
} } });
var Route$1 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "TD — Issue Tracker" }
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsxs(RootDocument, { children: [/* @__PURE__ */ jsx(SSEProvider, {}), /* @__PURE__ */ jsxs("div", {
			className: "min-h-screen bg-background text-foreground",
			children: [/* @__PURE__ */ jsx("nav", {
				className: "border-b bg-background/80 backdrop-blur sticky top-0 z-50",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center gap-6",
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "font-bold text-lg tracking-tight",
						children: "td"
					}), /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "text-sm text-muted-foreground hover:text-foreground transition-colors [&.active]:text-foreground",
						children: "Issues"
					})]
				})
			}), /* @__PURE__ */ jsx("main", {
				className: "max-w-7xl mx-auto px-4 sm:px-8 py-6",
				children: /* @__PURE__ */ jsx(Outlet, {})
			})]
		})] })
	});
}
function SSEProvider() {
	useSSE();
	return null;
}
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		className: "dark",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", {
			className: "bg-background font-sans",
			children: [children, /* @__PURE__ */ jsx(Scripts, {})]
		})]
	});
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter = () => import("./routes-BzgnnqsV.js");
//#endregion
//#region src/routeTree.gen.ts
var rootRouteChildren = {
	IndexRoute: createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") }).update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$1
	}),
	IssuesIdRoute: Route$2.update({
		id: "/issues/$id",
		path: "/issues/$id",
		getParentRoute: () => Route$1
	})
};
var routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true
	});
}
//#endregion
export { getRouter };
