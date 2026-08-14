document.addEventListener("DOMContentLoaded", async () => {
    const loginScreen = document.getElementById("login-screen");
    const profileScreen = document.getElementById("profile-screen");
    const logoutBtn = document.getElementById("logout-btn");

    // Check if user profile was synced by content.js
    chrome.storage.local.get(["userProfile"], (result) => {
        if (result.userProfile) {
            showProfile(result.userProfile);
        } else {
            loginScreen.classList.add("active");
            profileScreen.classList.remove("active");
        }
    });

    // Handle Disconnect (Clear synced data)
    logoutBtn.addEventListener("click", () => {
        chrome.storage.local.remove(["userProfile"], () => {
            loginScreen.classList.add("active");
            profileScreen.classList.remove("active");
        });
    });

    function showProfile(profile) {
        loginScreen.classList.remove("active");
        profileScreen.classList.add("active");

        document.getElementById("user-name").innerText = profile.full_name || "Unknown User";
        document.getElementById("user-email").innerText = profile.email || "No Email";
        
        const casteEl = document.getElementById("user-caste");
        if (profile.caste_category) {
            casteEl.innerText = profile.caste_category;
            casteEl.style.display = "inline-block";
        } else {
            casteEl.style.display = "none";
        }

        const incomeEl = document.getElementById("user-income");
        if (profile.annual_income) {
            incomeEl.innerText = `₹${parseInt(profile.annual_income).toLocaleString("en-IN")}`;
            incomeEl.style.display = "inline-block";
        } else {
            incomeEl.style.display = "none";
        }
    }
});
