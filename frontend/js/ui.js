// js/ui.js

export function populateDropdown(selectEl, units) {
    // Exception flow: null element
    if (!selectEl) {
        console.warn("populateDropdown: selectEl is null");
        return;
    }

    // Clear existing options
    selectEl.innerHTML = "";

    // Default disabled prompt
    const defaultOpt = document.createElement("div");
    defaultOpt.className = "option-item disabled";
    defaultOpt.textContent = "-- Select Unit --";
    selectEl.appendChild(defaultOpt);

    // Alternate flow: empty array — only default prompt shown
    if (!units.length) return;

    // Populate options
    units.forEach(u => {
        const div = document.createElement("div");
        div.className = "option-item";
        div.textContent = `${u.label} (${u.symbol})`;
        div.dataset.symbol = u.symbol;

        div.addEventListener("click", (e) => {
            e.stopPropagation();

            // Update header label
            selectEl.previousElementSibling.querySelector("span").innerText = u.label;

            // Update state based on FROM or TO
            const label = selectEl.closest(".conversion-section").querySelector("label").innerText;
            if (label === "FROM") {
                window.appState.fromUnit = u.symbol;
            } else {
                window.appState.toUnit = u.symbol;
            }

            selectEl.classList.remove("show");
        });

        selectEl.appendChild(div);
    });
}

export function setActive(parentEl, clickedEl, childSelector) {
    // Exception flow: null parent
    if (!parentEl) {
        console.warn("setActive: parentEl is null");
        return;
    }

    // Remove active from all siblings
    parentEl.querySelectorAll(childSelector).forEach(el => el.classList.remove("active"));

    // Set active on clicked
    clickedEl.classList.add("active");
}