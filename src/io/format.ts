import type { SheetData } from '../grid/types';
import { matrixToSheet, sheetToMatrix, type SheetMatrix } from './matrix';

export const EASY_SHEET_FILE_VERSION = 1;

export interface EasySheetFile {
  version: typeof EASY_SHEET_FILE_VERSION;
  metadata: {
    createdAt: string;
    title: string;
  };
  sheets: [
    {
      id: string;
      name: string;
      cells: SheetMatrix;
    },
  ];
  charts: unknown[];
  pictureGraphs: unknown[];
}

export function createNativeFile(sheet: SheetData): EasySheetFile {
  return {
    version: EASY_SHEET_FILE_VERSION,
    metadata: {
      createdAt: new Date().toISOString(),
      title: 'EasySheet',
    },
    sheets: [
      {
        id: 'sheet-1',
        name: 'Sheet 1',
        cells: sheetToMatrix(sheet),
      },
    ],
    charts: [],
    pictureGraphs: [],
  };
}

export function sheetFromNativeFile(file: EasySheetFile): SheetData {
  validateNativeFile(file);

  return matrixToSheet(file.sheets[0].cells);
}

export function validateNativeFile(
  value: unknown,
): asserts value is EasySheetFile {
  if (!value || typeof value !== 'object') {
    throw new Error('The file is not a readable EasySheet file.');
  }

  const candidate = value as {
    sheets?: unknown;
    version?: unknown;
  };

  if (candidate.version !== EASY_SHEET_FILE_VERSION) {
    throw new Error(
      'This EasySheet file uses a version this app cannot open yet.',
    );
  }

  if (!Array.isArray(candidate.sheets) || candidate.sheets.length === 0) {
    throw new Error('This EasySheet file does not contain a sheet.');
  }

  const firstSheet = candidate.sheets[0] as { cells?: unknown } | undefined;

  if (!firstSheet || !Array.isArray(firstSheet.cells)) {
    throw new Error(
      'This EasySheet file has sheet data EasySheet cannot read.',
    );
  }
}
