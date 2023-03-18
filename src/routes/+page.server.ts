import type { PageServerLoad } from './$types';
import PDFParser from 'pdf2json';

import puppeteer from 'puppeteer';
const url = 'https://www.svenskalag.se/iksturehov/dokument#folder=52570';
export const load = (async () => {
	const schedule = [];
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto(url);
	const divs = await page.$$('div.folder-52570');
	for (const div of divs) {
		const a = await div.$('a');
		const href = await a?.evaluate((s) => s.href);
		const title = await div.evaluate((div) => div.innerText);
		if (!title.includes('Inomhus') && href) {
			const result = await getPdfData(title.split('.pdf')[0], href);
			schedule.push({
				...result,
				left: result.left.map((x) => x.items.map((y) => decodeURIComponent(y))),
				right: result.right.map((x) => x.items.map((y) => decodeURIComponent(y)))
			});
		}
	}

	setTimeout(() => {
		page.close();
		browser.close();
	}, 500);

	return { schedule };
}) satisfies PageServerLoad;

const getPdfData = async (title: string, url: string): Promise<Schedule> => {
	return new Promise(async (resolve, reject) => {
		const res = await fetch(url);
		const buffer = await res.arrayBuffer();
		let left: IRow[] = [];
		let right: IRow[] = [];
		const pdfParser = new PDFParser();

		pdfParser.on('pdfParser_dataError', (err) => reject(err));
		pdfParser.on('data', (page) => {
			const items: PdfObject[] = (page?.Texts.map(mapTextsToPdfObjects) ?? []).sort(
				sortPdfObjectsByX
			);

			const leftColumn = items.filter((x) => x.x < 14).sort(sortPdfObjects);
			const rightColumn = items.filter((x) => x.x > 16).sort(sortPdfObjects);
			leftColumn.forEach((x) => {
				left = mapColumns(x, left);
			});
			rightColumn.forEach((x) => {
				right = mapColumns(x, right);
			});
			resolve({ title, left, right } as Schedule);
		});
		pdfParser.parseBuffer(buffer);
	});
};
const sortPdfObjects = (a: PdfObject, b: PdfObject) => {
	if (a.y === b.y) {
		return a.x - b.x;
	}
	return a.y - b.y;
};
const sortPdfObjectsByX = (a: PdfObject, b: PdfObject) => {
	return a.x > b.x ? 1 : -1;
};

const mapTextsToPdfObjects = (x: any): PdfObject => {
	return { x: Math.round(x.x * 10) / 10, y: Math.round(x.y * 10) / 10, text: x.R[0].T };
};

const mapColumns = (column: any, columns: IRow[]): IRow[] => {
	const item = columns.find((z) => z.index == column.y);
	if (!item) {
		columns.push({ index: column.y, items: [column.text] });
	} else {
		columns = [
			...columns.filter((z) => z.index != item.index),
			{ ...item, items: [...item.items, column.text] }
		];
	}
	return columns;
};

export interface IRow {
	index: number;
	items: string[];
}

export interface PdfObject {
	x: number;
	y: number;
	text: string;
}

export interface Schedule {
	title: string;
	left: IRow[];
	right: IRow[];
}
