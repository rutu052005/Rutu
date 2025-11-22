// SHOW LOGIN PAGE
function showLogin() {
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("signupPage").style.display = "none";
    document.getElementById("dashboardPage").style.display = "none";
}

// SHOW SIGNUP PAGE
function showSignup() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("signupPage").style.display = "block";
    document.getElementById("dashboardPage").style.display = "none";
}

// SHOW DASHBOARD PAGE
function showDashboard() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("signupPage").style.display = "none";
    document.getElementById("dashboardPage").style.display = "flex";
}



// SIGNUP FUNCTION
function signup() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("signupEmail").value;
    let pass = document.getElementById("signupPassword").value;

    let msg = document.getElementById("signupMsg");

    if (!name || !email || !pass) {
        msg.innerHTML = "All fields are required!";
        msg.className = "error";
        return;
    }

    if (!email.includes("@")) {
        msg.innerHTML = "Invalid email!";
        msg.className = "error";
        return;
    }

    if (pass.length < 6) {
        msg.innerHTML = "Password too weak!";
        msg.className = "error";
        return;
    }

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPass", pass);

    msg.innerHTML = "Signup successful!";
    msg.className = "success";

    setTimeout(() => {
        showLogin();
    }, 1000);
}



// LOGIN FUNCTION
function login() {
    let email = document.getElementById("loginEmail").value;
    let pass = document.getElementById("loginPassword").value;

    let msg = document.getElementById("loginMsg");

    let savedEmail = localStorage.getItem("userEmail");
    let savedPass = localStorage.getItem("userPass");

    if (email === savedEmail && pass === savedPass) {
        msg.innerHTML = "Login Successful!";
        msg.className = "success";

        setTimeout(() => {
            showDashboard();
        }, 800);

    } else {
        msg.innerHTML = "Invalid email or password!";
        msg.className = "error";
    }
}



// LOGOUT FUNCTION
function logout() {
    alert("Logged out!");
    showLogin();
}
