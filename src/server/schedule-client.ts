import PDFParser from 'pdf2json';
import { parse } from 'node-html-parser';
import { getWeek } from 'date-fns';
const baseUrl = 'https://www.svenskalag.se';
const url = `${baseUrl}/iksturehov/dokument#folder=52570`;

export class ScheduleClient {
	public get = async (): Promise<Week[]> => {
		const weeks: Week[] = [];
		const weekNr = getWeek(new Date());

		const page = await fetch(url).then((x) => x.text());
		const root = parse(page);

		let addToDay = false;
		const divs = root.querySelectorAll('div.folder-52570');
		for (const div of divs) {
			let dayIndex = -1;
			const a = div.querySelector('a');
			const href = a?.attrs['href'];
			const title = div.text.trim().split('.pdf')[0];
			const weekNumber = +title.split(' ')[1].slice(1);

			if (!title.includes('Inomhus') && weekNumber >= weekNr) {
				const week: Week = {
					title,
					days: []
				};
				const res = await fetch(`${baseUrl}${href}`);
				const buffer = await res.arrayBuffer();
				const resultSchedule = await this.getPdfData(buffer).then((result) => {
					return {
						title,
						left: result.left.map((x) => x.items.map((y) => decodeURIComponent(y))),
						right: result.right.map((x) => x.items.map((y) => decodeURIComponent(y)))
					};
				});
				for (const row of resultSchedule.left) {
					if (row.some((x) => x.includes('dag'))) {
						addToDay = true;
						dayIndex++;
						week.days[dayIndex] = { title: row[0], hours: [], search: row.join() };
					} else if (addToDay && week.days[dayIndex]) {
						week.days[dayIndex].hours.push(row);
						week.days[dayIndex].search += row.join();
					}
				}
				for (const row of resultSchedule.right) {
					if (row.some((x) => x.includes('dag'))) {
						addToDay = true;
						dayIndex++;
						week.days[dayIndex] = { title: row[0], hours: [], search: row.join() };
					} else if (addToDay && week.days[dayIndex]) {
						week.days[dayIndex].hours.push(row);
						week.days[dayIndex].search += row.join();
					}
				}
				weeks.push(week);
			}
		}
		return weeks;
	};

	private getPdfData = async (buffer: ArrayBuffer): Promise<Schedule> => {
		return new Promise(async (resolve, reject) => {
			let left: IRow[] = [];
			let right: IRow[] = [];
			const pdfParser = new PDFParser();

			pdfParser.on('pdfParser_dataError', (err) => reject(err));
			pdfParser.on('data', (page) => {
				const items: PdfObject[] = (page?.Texts.map(this.mapTextsToPdfObjects) ?? []).sort(
					this.sortPdfObjectsByX
				);

				const leftColumn = items.filter((x) => x.x < 14).sort(this.sortPdfObjects);
				const rightColumn = items.filter((x) => x.x > 16).sort(this.sortPdfObjects);
				leftColumn.forEach((x) => {
					left = this.mapColumns(x, left);
				});
				rightColumn.forEach((x) => {
					right = this.mapColumns(x, right);
				});
				resolve({ title: '', left, right } as Schedule);
			});
			pdfParser.parseBuffer(buffer);
		});
	};
	private sortPdfObjects = (a: PdfObject, b: PdfObject) => {
		if (a.y === b.y) {
			return a.x - b.x;
		}
		return a.y - b.y;
	};
	private sortPdfObjectsByX = (a: PdfObject, b: PdfObject) => {
		return a.x > b.x ? 1 : -1;
	};

	private mapTextsToPdfObjects = (x: any): PdfObject => {
		return { x: Math.round(x.x * 10) / 10, y: Math.round(x.y * 10) / 10, text: x.R[0].T };
	};

	private mapColumns = (column: any, columns: IRow[]): IRow[] => {
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
}

export default new ScheduleClient();

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
export interface Week {
	title: string;
	days: Day[];
}
export interface Day {
	title: string;
	hours: string[][];
	search: string;
}
