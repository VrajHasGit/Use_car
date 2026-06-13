import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'export.xlsx') => {
  if (!data || data.length === 0) {
    alert("No data available to export");
    return;
  }
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  
  // Download file
  XLSX.writeFile(wb, filename);
};

export const exportMultipleToExcel = (sheetsMap, filename = 'full_export.xlsx') => {
  const wb = XLSX.utils.book_new();
  let hasData = false;
  
  for (const [sheetName, data] of Object.entries(sheetsMap)) {
    if (data && data.length > 0) {
      hasData = true;
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  }
  
  if (!hasData) {
    alert("No data available to export");
    return;
  }
  
  XLSX.writeFile(wb, filename);
};
