import { getUnits, getConversion, saveHistory, getHistory } from "./js/api.js";
import { populateDropdown, setActive, showResult, toggleOperators, renderHistory } from "./js/ui.js";

const state = {
    type: "length",
    action: "Conversion",
    fromVal: null,
    fromUnit: "",
    toVal: null,
    toUnit: "",
    operator: "+"
};
window.appState = state;

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
}

async function loadUnits(type) {
    const units = await getUnits(type.toLowerCase());

    if (units.length === 0) {
        showError("No units found for this type.");
        return;
    }

    populateDropdown(fromSelect, units);
    populateDropdown(toSelect, units);
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