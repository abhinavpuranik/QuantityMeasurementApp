import { getUnits, getConversion, saveHistory, getHistory } from "./js/api.js";
import { populateDropdown, setActive, showResult, toggleOperators, renderHistory } from "./js/ui.js";
import { applyConversion, compareValues, performArithmetic } from "./js/conversion.js";;

const state = {
    type: "length",
    action: "Conversion",
    fromVal: null,
    fromUnit: "",
    toVal: null,
    toUnit: "",
    operator: "+"
};
// window.appState = state;
// window.calculate = calculate;

// ✅ Cache DOM references once
const typeSelector = document.querySelector("#categoryGrid");
const actionSelector = document.querySelector(".action-section");
const fromInput = document.querySelector("#fromValue");
const toInput = document.querySelector("#toValue");
const fromSelect = document.querySelectorAll(".dropdown-options")[0];
const toSelect = document.querySelectorAll(".dropdown-options")[1];

document.addEventListener("DOMContentLoaded", async () => {
    attachEventListeners();
    setDefaultActive();
    await loadUnits("length");
    toggleOperators(false);
    await loadHistory();
    window.appState = state;   // ✅ move here
    window.calculate = calculate;
    units: []
});

function attachEventListeners() {
    document.querySelectorAll(".dropdown-header").forEach(header => {
        header.addEventListener("click", (e) => {
            e.stopPropagation();
            const options = header.nextElementSibling;
            const isOpen = options.classList.contains("show");
            document.querySelectorAll(".dropdown-options").forEach(d => d.classList.remove("show"));
            if (!isOpen) options.classList.add("show");
        });
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-options").forEach(d => d.classList.remove("show"));
    });

    // ✅ UC-JS-15: Handle type card click
    document.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", async () => {
            setActive(typeSelector, card, ".category-card");

            // Clear inputs and result
            fromInput.value = "";
            toInput.value = "";
            showResult(null, "");

            // Update state
            state.type = card.dataset.category;
            state.fromUnit = "";
            state.toUnit = "";

            // Reload units — exception flow: keep existing dropdowns on failure
            const units = await getUnits(state.type);
            if (units.length === 0) {
                showError("Could not load units for this type.");
                return;
            }

            populateDropdown(fromSelect, units);
            populateDropdown(toSelect, units);
        });
    });

    document.querySelectorAll(".action-button").forEach(button => {
        button.addEventListener("click", () => {
            setActive(actionSelector, button, ".action-button");
            state.action = button.innerText;
            toggleOperators(state.action === "Arithmetic");
            showResult(null, "");
        });
    });

    document.querySelectorAll(".operator-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            setActive(document.querySelector("#operator-selector"), btn, ".operator-btn");
            state.operator = btn.dataset.op;
        });
    });

    // Trigger calculate on input change
    fromInput.addEventListener("input", () => {
        state.fromVal = parseFloat(fromInput.value);
        calculate();
});

    toInput.addEventListener("input", () => {
        state.toVal = parseFloat(toInput.value);
        calculate();
});
}

async function loadUnits(type) {
    const units = await getUnits(type.toLowerCase());

    if (units.length === 0) {
        showError("No units found for this type.");
        return;
    }
    state.units = units;
    populateDropdown(fromSelect, units);
    populateDropdown(toSelect, units);
    state.fromUnit = units[0].symbol;
    state.toUnit = units[1] ? units[1].symbol : units[0].symbol;
}

function setDefaultActive() {
    const firstCard = document.querySelector(".category-card");
    const firstButton = document.querySelector(".action-button");
    if (firstCard) setActive(typeSelector, firstCard, ".category-card");
    if (firstButton) setActive(actionSelector, firstButton, ".action-button");
}

async function loadHistory() {
    const history = await getHistory();
    renderHistory(history);
}

function showError(msg) {
    alert(msg);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function calculate() {
    console.log("calculate called", state);
    // Alternate flow: return early if required fields missing

    if (!state.fromVal || !state.fromUnit) return;
    if (state.action !== "Comparison" && !state.toUnit) return;

    try {
        let result, expression;

        if (state.action === "Conversion") {
            const conv = await getConversion(state.fromUnit, state.toUnit);
            result = applyConversion(state.fromVal, conv);
            expression = `${state.fromVal} ${state.fromUnit} → ${state.toUnit}`;
            showResult(result, state.toUnit);

       } else if (state.action === "Comparison") {
            if (!state.toVal || !state.toUnit) return;

            let base1, base2;

            if (state.fromUnit === state.toUnit) {
                base1 = state.fromVal;
                base2 = state.toVal;
            } else {
        // Convert both to fromUnit as common base
                const conv2 = await getConversion(state.toUnit, state.fromUnit);
                base1 = state.fromVal;
                base2 = applyConversion(state.toVal, conv2);
            }

            result = compareValues(state.fromVal, state.fromUnit, state.toVal, state.toUnit, base1, base2);
            expression = `${state.fromVal} ${state.fromUnit} vs ${state.toVal} ${state.toUnit}`;
            showResult(result, "");

        } else {
            // Arithmetic
            if (!state.toVal || !state.toUnit) return;
            if (!state.operator) return;

            // Normalise toVal to fromUnit first
            const conv = await getConversion(state.toUnit, state.fromUnit);
            const toValNormalised = applyConversion(state.toVal, conv);

            result = performArithmetic(state.fromVal, toValNormalised, state.operator);
            expression = `${state.fromVal} ${state.fromUnit} ${state.operator} ${state.toVal} ${state.toUnit}`;
            showResult(result, state.fromUnit);
        }

        // Save and refresh history
        const record = {
            type: state.type,
            action: state.action,
            expression,
            result,
            timestamp: new Date().toISOString()
        };

        await saveHistory(record);
        renderHistory(await getHistory());

    } catch (e) {
        console.error("calculate failed:", e);
        showResult("Error: " + e.message, "");
    }
}