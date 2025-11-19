import Papa from 'papaparse';
import { z } from 'zod';

// Schema for validating CSV rows
const DebtRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  debtSubject: z.string().min(1, 'Debt subject is required'),
  debtAmount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'Debt amount must be a positive number' }
  ),
});

export type DebtRow = z.infer<typeof DebtRowSchema>;

export interface ParsedDebt {
  name: string;
  email: string;
  debtSubject: string;
  debtAmount: number;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedDebt[];
  errors: string[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

/**
 * Validates that CSV has required columns
 */
function validateCSVHeaders(headers: string[]): { valid: boolean; missing: string[] } {
  const requiredColumns = ['name', 'email', 'debtSubject', 'debtAmount'];
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  const missing = requiredColumns.filter(
    (col) => !normalizedHeaders.includes(col.toLowerCase())
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Normalizes CSV headers to match our schema
 */
function normalizeHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const normalized = headers.map((h) => h.trim().toLowerCase());

  // Map common variations
  const headerMap: Record<string, string> = {
    name: 'name',
    email: 'email',
    'debt subject': 'debtSubject',
    'debtsubject': 'debtSubject',
    'debt_subject': 'debtSubject',
    'debt amount': 'debtAmount',
    'debtamount': 'debtAmount',
    'debt_amount': 'debtAmount',
  };

  headers.forEach((header, index) => {
    const normalized = header.trim().toLowerCase();
    const mappedKey = headerMap[normalized] || normalized;
    mapping[mappedKey] = header; // Keep original header for PapaParse
  });

  return mapping;
}

/**
 * Parses CSV file and validates data
 */
export async function parseCSVFile(filePath: string): Promise<ParseResult> {
  const result: ParseResult = {
    success: false,
    errors: [],
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
  };

  try {
    // Read file (Node.js fs)
    const fs = await import('fs/promises');
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Parse CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      result.errors.push(
        ...parseResult.errors.map((err) => `Parse error at row ${err.row}: ${err.message}`)
      );
    }

    const rows = parseResult.data as Record<string, string>[];
    result.totalRows = rows.length;

    if (rows.length === 0) {
      result.errors.push('CSV file is empty or contains no data rows');
      return result;
    }

    // Validate headers
    const headers = Object.keys(rows[0]);
    const headerValidation = validateCSVHeaders(headers);

    if (!headerValidation.valid) {
      result.errors.push(
        `Missing required columns: ${headerValidation.missing.join(', ')}`
      );
      return result;
    }

    // Normalize headers
    const headerMapping = normalizeHeaders(headers);

    // Validate and parse each row
    const parsedData: ParsedDebt[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because: 1 for header, 1 for 0-index

      try {
        // Map row data using normalized headers
        const mappedRow: Record<string, string> = {};
        Object.keys(headerMapping).forEach((normalizedKey) => {
          const originalHeader = headerMapping[normalizedKey];
          mappedRow[normalizedKey] = row[originalHeader]?.trim() || '';
        });

        // Validate row data
        const validatedRow = DebtRowSchema.parse(mappedRow);

        // Convert debtAmount to number
        const parsedDebt: ParsedDebt = {
          name: validatedRow.name,
          email: validatedRow.email.toLowerCase().trim(),
          debtSubject: validatedRow.debtSubject,
          debtAmount: parseFloat(validatedRow.debtAmount),
        };

        parsedData.push(parsedDebt);
        result.validRows++;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
          result.errors.push(`Row ${rowNumber}: ${errorMessages.join(', ')}`);
        } else {
          result.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        result.invalidRows++;
      }
    }

    if (parsedData.length > 0) {
      result.success = true;
      result.data = parsedData;
    } else {
      result.errors.unshift('No valid rows found in CSV file');
    }
  } catch (error) {
    result.errors.push(
      `Failed to read or parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return result;
}

/**
 * Parses CSV content from string
 */
export function parseCSVContent(csvContent: string): ParseResult {
  const result: ParseResult = {
    success: false,
    errors: [],
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
  };

  try {
    // Parse CSV
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      result.errors.push(
        ...parseResult.errors.map((err) => `Parse error at row ${err.row}: ${err.message}`)
      );
    }

    const rows = parseResult.data as Record<string, string>[];
    result.totalRows = rows.length;

    if (rows.length === 0) {
      result.errors.push('CSV content is empty or contains no data rows');
      return result;
    }

    // Validate headers
    const headers = Object.keys(rows[0]);
    const headerValidation = validateCSVHeaders(headers);

    if (!headerValidation.valid) {
      result.errors.push(
        `Missing required columns: ${headerValidation.missing.join(', ')}`
      );
      return result;
    }

    // Normalize headers
    const headerMapping = normalizeHeaders(headers);

    // Validate and parse each row
    const parsedData: ParsedDebt[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +2 because: 1 for header, 1 for 0-index

      try {
        // Map row data using normalized headers
        const mappedRow: Record<string, string> = {};
        Object.keys(headerMapping).forEach((normalizedKey) => {
          const originalHeader = headerMapping[normalizedKey];
          mappedRow[normalizedKey] = row[originalHeader]?.trim() || '';
        });

        // Validate row data
        const validatedRow = DebtRowSchema.parse(mappedRow);

        // Convert debtAmount to number
        const parsedDebt: ParsedDebt = {
          name: validatedRow.name,
          email: validatedRow.email.toLowerCase().trim(),
          debtSubject: validatedRow.debtSubject,
          debtAmount: parseFloat(validatedRow.debtAmount),
        };

        parsedData.push(parsedDebt);
        result.validRows++;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
          result.errors.push(`Row ${rowNumber}: ${errorMessages.join(', ')}`);
        } else {
          result.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        result.invalidRows++;
      }
    }

    if (parsedData.length > 0) {
      result.success = true;
      result.data = parsedData;
    } else {
      result.errors.unshift('No valid rows found in CSV content');
    }
  } catch (error) {
    result.errors.push(
      `Failed to parse CSV content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return result;
}

