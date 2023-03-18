import type { PageServerLoad } from './$types';
import PDFParser from 'pdf2json';
import { parse } from 'node-html-parser';
import { getWeek } from 'date-fns';
const baseUrl = 'https://www.svenskalag.se';
const url = `${baseUrl}/iksturehov/dokument#folder=52570`;
export const load = (async ({ fetch, setHeaders }) => {
	const schedule: any[] = [];
	const weekNr = getWeek(new Date());

	const page = await fetch(url).then((x) => x.text());
	const root = parse(page);

	const divs = root.querySelectorAll('div.folder-52570');
	for (const div of divs) {
		const a = div.querySelector('a');
		const href = a?.attrs['href'];
		const title = div.text.trim().split('.pdf')[0];
		const weekNumber = +title.split(' ')[1].slice(1);

		if (!title.includes('Inomhus') && weekNumber >= weekNr) {
			const res = await fetch(`${baseUrl}${href}`);
			const buffer = await res.arrayBuffer();
			const resultSchedule = await getPdfData(buffer).then((result) => {
				return {
					title,
					left: result.left.map((x) => x.items.map((y) => decodeURIComponent(y))),
					right: result.right.map((x) => x.items.map((y) => decodeURIComponent(y)))
				};
			});
			schedule.push(resultSchedule);
		}
	}

	setHeaders({
		'cache-control': 'public, max-age=300'
	});
	return { schedule };
}) satisfies PageServerLoad;

const getPdfData = async (buffer: ArrayBuffer): Promise<Schedule> => {
	return new Promise(async (resolve, reject) => {
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
			resolve({ title: '', left, right } as Schedule);
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
