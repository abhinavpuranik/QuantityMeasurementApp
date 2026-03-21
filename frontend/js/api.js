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

        const data = await res.json(); // json-server always returns an array

        if (!data.length) throw new Error(`No conversion found for ${from} → ${to}`);

        return data[0]; // always grab first element

    } catch (err) {
        console.error("getConversion failed:", err);
        throw err; // re-throw so caller can show error to user
    }
}

