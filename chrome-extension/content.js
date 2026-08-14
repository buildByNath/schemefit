// Inject the autofill button into the page
function injectAutofillButton(profile) {
    // Prevent multiple injections
    if (document.getElementById("schemefit-autofill-btn")) return;

    const btn = document.createElement("button");
    btn.id = "schemefit-autofill-btn";
    btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Autofill with SchemeFit
    `;

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        autofillForms(profile);
        
        // Show success state
        const originalText = btn.innerHTML;
        btn.innerHTML = "✓ Autofilled!";
        btn.style.backgroundColor = "#10b981";
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = "";
        }, 2000);
    });

    document.body.appendChild(btn);
}

// Map profile fields to common input names
function autofillForms(profile) {
    const inputs = document.querySelectorAll("input, select, textarea");
    
    inputs.forEach(input => {
        const name = (input.name || "").toLowerCase();
        const id = (input.id || "").toLowerCase();
        const placeholder = (input.placeholder || "").toLowerCase();
        
        const combinedString = `${name} ${id} ${placeholder}`;

        if (isMatch(combinedString, ["name", "first", "last", "full"])) {
            fillInput(input, profile.full_name);
        } else if (isMatch(combinedString, ["email", "mail"])) {
            fillInput(input, profile.email);
        } else if (isMatch(combinedString, ["income", "salary", "earning"])) {
            fillInput(input, profile.annual_income);
        } else if (isMatch(combinedString, ["caste", "category", "community"])) {
            fillInput(input, profile.caste_category);
        } else if (isMatch(combinedString, ["state", "province"])) {
            fillInput(input, profile.state);
        } else if (isMatch(combinedString, ["district", "city", "town"])) {
            fillInput(input, profile.district);
        } else if (isMatch(combinedString, ["education", "degree", "qualification"])) {
            fillInput(input, profile.education);
        } else if (isMatch(combinedString, ["occupation", "job", "profession"])) {
            fillInput(input, profile.occupation);
        }
    });
}

function isMatch(string, keywords) {
    return keywords.some(keyword => string.includes(keyword));
}

function fillInput(input, value) {
    if (!value) return;

    if (input.tagName === "SELECT") {
        // Try to match dropdown options
        Array.from(input.options).forEach(option => {
            if (option.text.toLowerCase().includes(value.toString().toLowerCase()) || 
                option.value.toLowerCase().includes(value.toString().toLowerCase())) {
                input.value = option.value;
            }
        });
    } else {
        input.value = value;
    }
    
    // Dispatch events so frontend frameworks (React/Vue/Angular) detect the change
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
}

// Check if we have forms and user is logged in
function init() {
    // 1. Sync Profile Data if on SchemeFit Dashboard
    const syncElement = document.getElementById("schemefit-extension-sync-data");
    if (syncElement) {
        try {
            const profileData = JSON.parse(syncElement.getAttribute("data-profile"));
            chrome.storage.local.set({ userProfile: profileData }, () => {
                console.log("SchemeFit Autofill: Profile synced successfully from dashboard!");
            });
        } catch (e) {
            console.error("SchemeFit Autofill: Failed to parse sync data.", e);
        }
    }

    // 2. Only inject if there are significant form inputs on the page
    const inputs = document.querySelectorAll("input[type='text'], input[type='email'], input[type='number'], select");
    
    if (inputs.length >= 3) {
        chrome.storage.local.get(["userProfile"], (result) => {
            if (result.userProfile) {
                injectAutofillButton(result.userProfile);
            }
        });
    }
}

// Initialize slightly after load to ensure dynamic forms render
setTimeout(init, 1000);
