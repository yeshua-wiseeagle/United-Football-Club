// js/auth.js - Final Clean Version

console.log("Auth.js loaded");

const SUPABASE_URL = 'https://csxrqighkjkbwnjtsebq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeHJxaWdoa2prYnduanRzZWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTEzMDQsImV4cCI6MjA5MzI4NzMwNH0.DZWRv3WJWzBKffY2GcZ5YMyGlnYGO1zFfL0464Rrefs';

// Create client only once
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// ====================== PASSWORD STRENGTH ======================
function checkPasswordStrength(password) {
  return {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@#_\-!$%^&*]/.test(password)
  };
}

// ====================== REGISTER ======================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const passwordInput = document.getElementById("regPassword");
  const requirementsDiv = document.getElementById("passwordRequirements");

  passwordInput.addEventListener("focus", function () {
    requirementsDiv.style.display = "block";
  });

  passwordInput.addEventListener("input", function () {
    const strength = checkPasswordStrength(this.value);
    requirementsDiv.children[0].style.color = strength.length ? "green" : "#999";
    requirementsDiv.children[1].style.color = strength.uppercase ? "green" : "#999";
    requirementsDiv.children[2].style.color = strength.number ? "green" : "#999";
    requirementsDiv.children[3].style.color = strength.special ? "green" : "#999";
  });

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const strength = checkPasswordStrength(password);
    if (!Object.values(strength).every(v => v)) {
      alert("Password does not meet all the requirements.");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      alert("❌ " + error.message);
      return;
    }

    if (data.user) {
      currentUser = data.user;
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      alert("✅ Account created successfully!");
      window.location.href = "home.html";
    }
  });
}

// ====================== LOGIN ======================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      alert("❌ " + error.message);
      return;
    }

    currentUser = data.user;
    localStorage.setItem("currentUser", JSON.stringify(data.user));
    alert("✅ Login successful!");
    window.location.href = "home.html";
  });
}

// ====================== LOGOUT ======================
window.logout = async function () {
  await supabaseClient.auth.signOut();
  localStorage.removeItem("currentUser");
  currentUser = null;
  alert("You have been logged out.");
  window.location.href = "home.html";
};

// ====================== UI UPDATE ======================
function isLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

function updateProfileUI() {
  const profile = document.getElementById("userProfile");
  const authButtons = document.querySelector(".auth-buttons");

  if (isLoggedIn()) {
    // Show profile icon
    if (profile) {
      profile.style.display = "block";
    }
    // Hide Register / Login buttons
    if (authButtons) {
      authButtons.style.display = "none";
    }

    // Set greeting name
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const name = user.user_metadata?.name || user.email || "User";
    const greeting = document.getElementById("userGreeting");
    if (greeting) {
      greeting.textContent = `Hi, ${name.split(" ")[0]}`;
    }
  } else {
    // Show Register / Login
    if (profile) {
      profile.style.display = "none";
    }
    if (authButtons) {
      authButtons.style.display = "flex";
    }
  }
}

// Run on every page
document.addEventListener("DOMContentLoaded", function () {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
  updateProfileUI();
});
















// ====================== PROFILE DROPDOWN ======================
window.toggleProfileDropdown = function () {
  const dropdown = document.getElementById("profileDropdown");
  if (dropdown) {
    if (dropdown.style.display === "block") {
      dropdown.style.display = "none";
    } else {
      dropdown.style.display = "block";
    }
  }
};

// Close dropdown when clicking outside
document.addEventListener("click", function (e) {
  const profile = document.getElementById("userProfile");
  const dropdown = document.getElementById("profileDropdown");

  if (profile && dropdown && !profile.contains(e.target)) {
    dropdown.style.display = "none";
  }
});