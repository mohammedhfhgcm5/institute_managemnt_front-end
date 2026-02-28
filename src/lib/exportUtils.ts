import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  [key: string]: any;
}

/**
 * Detect if data is tabular (array of objects) or key-value pairs
 */
function detectStructure(data: any): 'table' | 'keyvalue' {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    return 'table';
  }
  return 'keyvalue';
}

/**
 * Flatten nested objects into readable key-value pairs
 */
function flattenData(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const newKey = prefix ? `${prefix} > ${key}` : key;
    const value = obj[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Nested object - recurse
      Object.assign(result, flattenData(value, newKey));
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result[newKey] = '[]';
      } else if (value.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
        // Array of objects - flatten each item with index
        value.forEach((item, index) => {
          Object.assign(result, flattenData(item, `${newKey}[${index}]`));
        });
      } else {
        // Array of primitives or mixed - show as JSON string
        result[newKey] = JSON.stringify(value);
      }
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Format field names to be more readable
 */
function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Export JSON data to a beautifully formatted Excel file
 */
export async function exportJsonToExcel(
  data: ReportData,
  fileBaseName: string
): Promise<void> {
  const workbook = XLSX.utils.book_new();
  const structure = detectStructure(data);

  let worksheetData: any[][] = [];

  if (structure === 'table') {
    // Tabular data - create beautiful table
    const tableData = data as any[];
    const headers = Object.keys(tableData[0]);
    
    // Add title row
    worksheetData.push([fileBaseName]);
    worksheetData.push([]); // Empty row
    worksheetData.push([`Generated: ${new Date().toLocaleString()}`]);
    worksheetData.push([]); // Empty row
    
    // Add headers
    worksheetData.push(headers.map(formatFieldName));
    
    // Add data rows
    tableData.forEach((row) => {
      const rowData = headers.map((header) => row[header] ?? '');
      worksheetData.push(rowData);
    });
  } else {
    // Key-value pairs - create summary table
    const flatData = flattenData(data);
    
    // Add title
    worksheetData.push([fileBaseName]);
    worksheetData.push([]); // Empty row
    worksheetData.push([`Generated: ${new Date().toLocaleString()}`]);
    worksheetData.push([]); // Empty row
    
    // Add headers
    worksheetData.push(['Field', 'Value']);
    
    // Add data
    Object.entries(flatData).forEach(([key, value]) => {
      worksheetData.push([formatFieldName(key), value ?? '']);
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Apply column widths
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const colWidths: any[] = [];
  
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 10;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && cell.v) {
        const cellLength = String(cell.v).length;
        maxWidth = Math.max(maxWidth, Math.min(cellLength + 2, 50));
      }
    }
    colWidths.push({ wch: maxWidth });
  }
  worksheet['!cols'] = colWidths;

  // Apply cell styling
  const headerRow = 4; // Row 5 (0-indexed as 4)
  
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;

      // Title styling (row 0)
      if (R === 0) {
        worksheet[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: '1F4E78' } },
          alignment: { horizontal: 'left', vertical: 'center' },
        };
      }
      // Timestamp styling (row 2)
      else if (R === 2) {
        worksheet[cellAddress].s = {
          font: { italic: true, sz: 9, color: { rgb: '666666' } },
        };
      }
      // Header row styling (row 4)
      else if (R === headerRow) {
        worksheet[cellAddress].s = {
          font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '366092' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'D3D3D3' } },
            bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
            left: { style: 'thin', color: { rgb: 'D3D3D3' } },
            right: { style: 'thin', color: { rgb: 'D3D3D3' } },
          },
        };
      }
      // Data rows styling
      else if (R > headerRow) {
        const isAlternateRow = R % 2 === 0;
        const isFirstColumn = C === 0 && structure === 'keyvalue';
        
        worksheet[cellAddress].s = {
          font: { 
            sz: 10,
            bold: isFirstColumn,
            color: { rgb: isFirstColumn ? '1F4E78' : '000000' }
          },
          fill: { 
            fgColor: { 
              rgb: isFirstColumn ? 'F2F2F2' : (isAlternateRow ? 'F2F2F2' : 'FFFFFF')
            } 
          },
          alignment: { horizontal: 'left', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'D3D3D3' } },
            bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
            left: { style: 'thin', color: { rgb: 'D3D3D3' } },
            right: { style: 'thin', color: { rgb: 'D3D3D3' } },
          },
        };
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  // Generate file and download
  XLSX.writeFile(workbook, `${fileBaseName}.xlsx`, { 
    bookType: 'xlsx',
    cellStyles: true 
  });
}

/**
 * Export JSON data to a beautifully formatted PDF report
 */
export async function exportJsonToPdf(
  title: string,
  data: ReportData,
  fileBaseName: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(31, 78, 120); // #1F4E78
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, 20);

  // Timestamp
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102); // #666666
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 28);

  const structure = detectStructure(data);

  if (structure === 'table') {
    // Tabular data
    const tableData = data as any[];
    const headers = Object.keys(tableData[0]).map(formatFieldName);
    const rows = tableData.map((row) =>
      Object.keys(tableData[0]).map((key) => row[key] ?? '')
    );

    doc.setFontSize(14);
    doc.setTextColor(31, 78, 120);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Data', margin, 40);

    autoTable(doc, {
      startY: 45,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [54, 96, 146], // #366092
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249], // #F9F9F9
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
    });
  } else {
    // Key-value pairs
    const flatData = flattenData(data);
    const rows = Object.entries(flatData).map(([key, value]) => [
      formatFieldName(key),
      value ?? '',
    ]);

    doc.setFontSize(14);
    doc.setTextColor(31, 78, 120);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Summary', margin, 40);

    autoTable(doc, {
      startY: 45,
      head: [['Field', 'Value']],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [54, 96, 146], // #366092
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { 
          cellWidth: 75,
          fontStyle: 'bold',
          textColor: [31, 78, 120],
          fillColor: [242, 242, 242],
        },
        1: { 
          cellWidth: 'auto',
        },
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249],
      },
      margin: { left: margin, right: margin },
    });
  }

  // Save PDF
  doc.save(`${fileBaseName}.pdf`);
}