const SUPABASE_URL = "https://cmifqpymsmbjthqnkebg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtaWZxcHltc21ianRocW5rZWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODk4MzEsImV4cCI6MjEwMjI2NTgzMX0.mGIApYxhrexUnlQpADZ2XMP0L3uFTGNSzMGD0u_4OR8";

document.addEventListener("DOMContentLoaded", async () => {
    const loginScreen = document.getElementById("login-screen");
    const profileScreen = document.getElementById("profile-screen");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const errorMsg = document.getElementById("error-msg");

    // Check if user is already logged in
    chrome.storage.local.get(["userProfile"], (result) => {
        if (result.userProfile) {
            showProfile(result.userProfile);
        } else {
            loginScreen.classList.add("active");
            profileScreen.classList.remove("active");
        }
    });

    // Handle Login
    loginBtn.addEventListener("click", async () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            errorMsg.innerText = "Please enter email and password.";
            return;
        }

        loginBtn.disabled = true;
        loginBtn.innerText = "Authenticating...";
        errorMsg.innerText = "";

        try {
            // 1. Authenticate with Supabase
            const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY
                },
                body: JSON.stringify({ email, password })
            });

            const authData = await authResponse.json();

            if (!authResponse.ok) {
                throw new Error(authData.error_description || "Authentication failed");
            }

            const token = authData.access_token;
            const userId = authData.user.id;

            // 2. Fetch User Profile from public.users table
            const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${token}`
                }
            });

            const profileData = await profileResponse.json();

            if (!profileResponse.ok || profileData.length === 0) {
                throw new Error("Could not fetch profile details.");
            }

            const userProfile = profileData[0];

            // 3. Save to Chrome Local Storage
            chrome.storage.local.set({ userProfile }, () => {
                showProfile(userProfile);
            });

        } catch (error) {
            errorMsg.innerText = error.message;
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerText = "Login to SchemeFit";
        }
    });

    // Handle Logout
    logoutBtn.addEventListener("click", () => {
        chrome.storage.local.remove(["userProfile"], () => {
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
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
