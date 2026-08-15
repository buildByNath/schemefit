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

        // 1. Explicit matches for HP Unemployment Allowance Scheme form
        if (name === "fullname") {
            fillInput(input, profile.full_name);
        } else if (name === "dob") {
            let dob = profile.date_of_birth || "2001-01-17";
            if (dob && dob.includes('T')) dob = dob.split('T')[0];
            fillInput(input, dob);
        } else if (name === "gender") {
            let gender = "Male";
            if (profile.gender) {
                const g = profile.gender.toLowerCase();
                if (g === "female") gender = "Female";
                else if (g !== "male") gender = "Other";
            }
            fillInput(input, gender);
        } else if (name === "category") {
            let cat = "General";
            if (profile.caste_category) {
                const c = profile.caste_category.toUpperCase();
                if (["SC", "ST", "OBC", "GENERAL"].includes(c)) {
                    cat = c === "GENERAL" ? "General" : c;
                }
            }
            fillInput(input, cat);
        } else if (name === "mobile") {
            fillInput(input, profile.phone || "5698745621");
        } else if (name === "email") {
            fillInput(input, profile.email || "nathshaj20006@gmail.com");
        } else if (name === "district") {
            let district = "Shimla";
            if (profile.district) {
                const dist = profile.district.toLowerCase();
                const hpDistricts = ["bilaspur", "chamba", "hamirpur", "kangra", "kinnaur", "kullu", "lahaul and spiti", "mandi", "shimla", "sirmaur", "solan", "una"];
                const matched = hpDistricts.find(d => dist.includes(d));
                if (matched) {
                    district = matched.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                }
            }
            fillInput(input, district);
        } else if (name === "address") {
            fillInput(input, profile.address || "palakkad");
        } else if (name === "exchangereg") {
            fillInput(input, profile.exchange_reg || "EX-HP-40291");
        } else if (name === "education") {
            let edu = "Graduate";
            if (profile.education) {
                const e = profile.education.toLowerCase();
                if (e.includes("post")) edu = "Post graduate";
                else if (e.includes("grad") || e.includes("undergrad")) edu = "Graduate";
                else if (e.includes("diploma") || e.includes("iti")) edu = "Diploma / ITI";
                else if (e.includes("professional") || e.includes("degree") || e.includes("btech") || e.includes("b.tech")) edu = "Professional degree";
            }
            fillInput(input, edu);
        } else if (name === "disability") {
            fillInput(input, profile.is_differently_abled ? "yes" : "no");
        } else if (name === "familyincome") {
            fillInput(input, profile.annual_income || 250000);
        } else if (name === "aadhar") {
            fillInput(input, profile.aadhar || "587965458561");
        } else if (name === "bankaccount") {
            fillInput(input, profile.bank_account || "45620000125");
        } else if (name === "ifsccode") {
            fillInput(input, profile.ifsc_code || "SBIN0001234");
        } else if (name === "bankname") {
            fillInput(input, profile.bank_name || "SBI");
        } else if (name === "declaration") {
            fillInput(input, true);
        }
        
        // 2. Generic fallbacks for other forms
        else if (isMatch(combinedString, ["bank", "ifsc", "account"])) {
            if (isMatch(combinedString, ["name"])) {
                fillInput(input, profile.bank_name);
            } else if (isMatch(combinedString, ["ifsc"])) {
                fillInput(input, profile.ifsc_code);
            } else {
                fillInput(input, profile.bank_account);
            }
        } else if (isMatch(combinedString, ["father", "mother", "spouse"])) {
            // Ignore these so we don't accidentally fill the user's name
        } else if (isMatch(combinedString, ["name", "first", "last", "full"])) {
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
    if (value === undefined || value === null) return;

    if (input.tagName === "SELECT") {
        // Try to match dropdown options
        let matched = false;
        Array.from(input.options).forEach(option => {
            const optVal = (option.value || "").toLowerCase();
            const optText = (option.text || "").toLowerCase();
            const searchVal = value.toString().toLowerCase();
            
            // Special handling for family income range selection
            if (input.name === "familyIncome" && typeof value === "number") {
                if (value < 50000 && optText.includes("below")) {
                    input.value = option.value;
                    matched = true;
                } else if (value >= 50000 && value <= 100000 && optText.includes("50,001")) {
                    input.value = option.value;
                    matched = true;
                } else if (value > 100000 && optText.includes("1,00,001")) {
                    input.value = option.value;
                    matched = true;
                }
            } else if (optText.includes(searchVal) || optVal.includes(searchVal)) {
                input.value = option.value;
                matched = true;
            }
        });
    } else if (input.type === "checkbox") {
        input.checked = !!value;
    } else if (input.type === "radio") {
        if (input.value.toLowerCase() === value.toString().toLowerCase()) {
            input.checked = true;
        }
    } else {
        input.value = value;
    }
    
    // Add visual highlight
    if (input.type !== "hidden") {
        input.style.border = "2px solid #10b981";
        input.style.backgroundColor = "#ecfdf5";
        input.style.transition = "all 0.3s ease";
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
                autofillForms(result.userProfile);
            }
        });
    }
}

// Initialize slightly after load to ensure dynamic forms render
setTimeout(init, 1000);

