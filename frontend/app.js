import { getUnits } from "./js/api.js";
// Global state


const state = {
    type: "Length",
    action: "Conversion",
    fromVal: null,
    fromUnit: "",
    toVal: null,
    toUnit: "",
    operator: "+"
};

document.addEventListener("DOMContentLoaded", async () => {
    attachEventListeners();
    setDefaultActive();
    await loadUnits("length");
    toggleOperators(false);
    await loadHistory();
});

function attachEventListeners() {
    // ✅ FIX 1: Toggle dropdowns open/close on header click
    document.querySelectorAll(".dropdown-header").forEach(header => {
        header.addEventListener("click", (e) => {
            e.stopPropagation();
            const options = header.nextElementSibling; // .dropdown-options
            const isOpen = options.classList.contains("show");

            // Close all dropdowns first
            document.querySelectorAll(".dropdown-options").forEach(d => d.classList.remove("show"));

            // Then open this one if it was closed
            if (!isOpen) options.classList.add("show");
        });
    });

    // ✅ FIX 2: Click anywhere outside to close all dropdowns
    document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-options").forEach(d => d.classList.remove("show"));
    });

    document.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", async () => {
            document.querySelectorAll(".category-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            const selectedType = card.dataset.category;
            state.type = capitalize(selectedType);
            await loadUnits(state.type.toLowerCase());
        });
    });

    document.querySelectorAll(".action-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".action-button").forEach(b => b.classList.remove("action-active"));
            button.classList.add("action-active");

            state.action = button.innerText;
            toggleOperators(state.action === "Arithmetic");
        });
    });
}

async function loadUnits(type) {
    const units = await getUnits(type.toLowerCase());

    if (units.length === 0) {
        showError("No units found for this type.");
        return;
    }

    populateDropdown(units);
}

function populateDropdown(units) {
    const dropdowns = document.querySelectorAll(".dropdown-options");
    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = "";

        units.forEach(unit => {
            const div = document.createElement("div");
            div.className = "option-item";
            div.innerText = unit.label;
            div.dataset.symbol = unit.symbol;

            div.addEventListener("click", (e) => {
                e.stopPropagation(); // prevent closing before state updates
                // Update the visible header label
                dropdown.previousElementSibling.querySelector("span").innerText = unit.label;

                const label = dropdown.closest(".conversion-section").querySelector("label").innerText;
                if (label === "FROM") {
                    state.fromUnit = unit.symbol;
                } else {
                    state.toUnit = unit.symbol;
                }

                dropdown.classList.remove("show");
            });

            dropdown.appendChild(div);
        });
    });
}

function setDefaultActive() {
    const firstCard = document.querySelector(".category-card");
    const firstButton = document.querySelector(".action-button");
    if (firstCard) firstCard.classList.add("active");
    if (firstButton) firstButton.classList.add("action-active"); // ✅ FIX 3: was "active"
}

function toggleOperators(show) {
    const operatorRow = document.querySelector(".operator-row");
    if (!operatorRow) return;
    operatorRow.style.display = show ? "flex" : "none";
}

async function loadHistory() {
    try {
        const res = await fetch("http://localhost:3000/history");
        const history = await res.json();
        console.log("History:", history);
    } catch (err) {
        console.error("History load failed:", err);
    }
}

function showError(msg) {
    alert(msg);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}