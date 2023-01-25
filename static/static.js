// Copyright 2022 Google LLC.
// SPDX-License-Identifier: Apache-2.0

// This file runs at build time!
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";

async function renderTemplate(data) {
	const templateFileName = new URL("template.html", import.meta.url);
	const rawTemplate = await readFile(templateFileName, "utf8");

	let newTemplateString = rawTemplate;
	for (const [key, value] of Object.entries(data)) {
		newTemplateString = newTemplateString.replaceAll(key, value);
	}
	return newTemplateString;
}

const distFolder = `dist`;

async function writeHTML(file, contents) {
	const outputFilename = new URL(`${distFolder}/${file}`, import.meta.url);

	const outputDirectory = new URL(".", outputFilename);
	await mkdir(outputDirectory, { recursive: true });
	await writeFile(outputFilename, contents);
}

async function generateLongText() {
	const response = await fetch("http://localhost:3001/api/long-text");
	const text = await response.text();

	const html = `
	<details open>
	<summary>Some long text...</summary>
	${text}
	</details>
	`;

	const finalTemplate = await renderTemplate({
		"{{title}}": "Long text - Client",
		"{{contents}}": html,
		"{{heading}}":
			"This page includes long text, generated statically at build time",
	});

	await writeHTML("long-text.html", finalTemplate);
}

async function generateProductPages() {
	const response = await fetch("http://localhost:3001/api/products");
	const products = await response.json();

	for (const product of products) {
		const productSlug = product.slug;

		const html = `
		<h2>${product.title}</h2>
		<h3>${product.price}</h3>
		<p>${product.description}</p>
	`;

		const finalTemplate = await renderTemplate({
			"{{title}}": `${product.title} - Static`,
			"{{contents}}": html,
			"{{heading}}": `This is a product page for ${product.title}. This page was generated statically, at build time.`,
		});

		await writeHTML(`products/${productSlug}.html`, finalTemplate);
	}
}

async function generateIndex() {
	const html = `
<p>You are browsing the statically generated pages. You can also browse the <a href="/client">client</a> or <a href="/server">server</a> pages.</p>

	`;
	const finalTemplate = await renderTemplate({
		"{{title}}": "Static",
		"{{contents}}": html,
		"{{heading}}": "This is the main static page",
	});

	// return finalTemplate;
	await writeHTML("index.html", finalTemplate);
}

async function generateManyAPICallsPage() {
	let textResponse = "";
	for (let i = 0; i < 4; i++) {
		const response = await fetch("http://localhost:3001/api/slow-api");
		textResponse += await response.text();
		textResponse += "<br />";
	}

	const finalTemplate = await renderTemplate({
		"{{title}}": "Many API calls - Server",
		"{{contents}}": textResponse,
		"{{heading}}":
			"Many sequential (serial) API calls were made before this page could be generated",
	});

	await writeHTML("many-api-calls.html", finalTemplate);
}

async function generateProductsListing() {
	const response = await fetch("http://localhost:3001/api/products");
	const json = await response.json();

	const html = `
	<ol>
		${json
			.map(
				(el) => `<li>
			<a href="/static/products/${el.slug}">${el.title}</a>
		</li>`
			)
			.join("")}
	</ol>
	`;

	const finalTemplate = await renderTemplate({
		"{{title}}": "Products listing - Static",
		"{{contents}}": html,
		"{{heading}}":
			"This page includes a list of products, generated statically",
	});

	// return finalTemplate;
	await writeHTML("products/index.html", finalTemplate);
}

console.time("Generated static files");

const distOutput = new URL(`${distFolder}`, import.meta.url);
await rm(distOutput, { recursive: true, force: true });

await Promise.all([
	generateIndex(),
	generateProductsListing(),
	generateLongText(),
	generateManyAPICallsPage(),
	generateProductPages(),
]);

console.timeEnd("Generated static files");
