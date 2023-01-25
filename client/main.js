// Copyright 2022 Google LLC.
// SPDX-License-Identifier: Apache-2.0

// This file runs at client runtime
const apiURL = "http://localhost:3001/api/long-text";

function getPageWithDynamicRoute(pathname) {
	const pathSegments = pathname.split("/");
	const lastPathSegment = pathSegments.pop();
	pathSegments.push(":");
	const dynamicPathname = pathSegments.join("/");
	const template = document.querySelector(`[data-url^="${dynamicPathname}"]`);

	if (!template) return;

	const templateRoute = template.dataset.url;
	const templateRouteSegments = templateRoute.split(":");
	const dynamicSegmentName =
		templateRouteSegments[templateRouteSegments.length - 1];
	return {
		template,
		parameter: dynamicSegmentName.toLowerCase(),
		parameterValue: lastPathSegment,
	};
}

function getPage(pathname) {
	const template = document.querySelector(`[data-url="${pathname}"]`);

	if (template) {
		return { template };
	} else {
		return getPageWithDynamicRoute(pathname);
	}
}

async function renderTemplate(pathname, href) {
	const page = getPage(pathname);
	if (!page) {
		if (!href) {
			return renderTemplate("/client/error");
		}

		location.href = href;
		return;
	}
	const clonedTemplate = page.template.content.cloneNode(true);

	if (page.parameter) {
		const targetElementForData = clonedTemplate.querySelector(
			`[data-${page.parameter}]`
		);

		if (targetElementForData) {
			targetElementForData.dataset[page.parameter] = page.parameterValue;
		}
	}

	const container = document.querySelector(".container");
	container.replaceChildren(clonedTemplate);
	if (href) {
		history.pushState({}, "new title", href);
	}
}

function handleAllClicks(el) {
	document.body.addEventListener("click", async (event) => {
		const { href, tagName } = event.target;
		if (tagName !== "A") {
			return;
		}

		event.preventDefault();
		const { pathname } = new URL(href);
		await renderTemplate(pathname, href);
	});
}

async function start() {
	handleAllClicks();
	const { pathname } = new URL(location);
	await renderTemplate(pathname);
}

start();
