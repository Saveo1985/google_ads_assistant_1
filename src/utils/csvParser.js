import Papa from 'papaparse';

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const formatCSVDataForAI = (data) => {
    // Convert parsed JSON to a readable string summary for the AI
    if (!data || data.length === 0) return "Empty CSV file.";

    // Limit to first 50 rows to avoid token limits in a real scenario
    const limitedData = data.slice(0, 50);
    const headers = Object.keys(limitedData[0]).join(", ");
    const rows = limitedData.map(row => Object.values(row).join(", ")).join("\n");

    return `CSV Data Summary:\nHeaders: ${headers}\nRows (First 50):\n${rows}`;
};
