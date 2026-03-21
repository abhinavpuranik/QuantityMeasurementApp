// js/api.js

const BASE_URL = "http://localhost:3000";

export async function getUnits(type) {
    try {
        const res = await fetch(`${BASE_URL}/units?type=${type}`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        return await res.json();

    } catch (err) {
        console.error("getUnits failed:", err);
        return [];
    }
}

export async function getConversion(from, to) {
    // Alternate flow: same unit selected, no API call needed
    if (from === to) return { from, to, factor: 1, formula: null };

    try {
        const res = await fetch(`${BASE_URL}/conversions?from=${from}&to=${to}`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json(); 

        if (!data.length) throw new Error(`No conversion found for ${from} → ${to}`);

        return data[0]; // always grab first element

    } catch (err) {
        console.error("getConversion failed:", err);
        throw err; // re-throw so caller can show error to user
    }
}


export async function saveHistory(record) {
    try{
        const res = await fetch(`${BASE_URL}/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch(err) {
        console.error("saveHistory failed:", err);
        return null;
    }
}

export async function getHistory() {
    try {
        const res = await fetch(`${BASE_URL}/history`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Sort newest-first in JS instead of relying on json-server params
        return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    } catch (err) {
        console.error("getHistory failed:", err);
        return [];
    }
}


