async function onLoad() {
    if (isLoggedIn()) {
        window.location.href = "/todos"
    }
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let password2 = document.getElementById("password2");
    let username = document.getElementById("username");
    let register = document.getElementById("register");
    let error = document.getElementById("error");
    let loading = document.getElementById("loading");
    email.addEventListener("click", hideErrorLambda(error));
    password.addEventListener("click", hideErrorLambda(error));
    password2.addEventListener("click", hideErrorLambda(error));
    username.addEventListener("click", hideErrorLambda(error));
    register.addEventListener("click", async () => {
        if (email.value.length === 0) {
            showError(error, "Email cannot be empty.");
            return;
        }
        if (username.value.length === 0) {
            showError(error, "Username cannot be empty.");
            return;
        }
        if (password.value.length < 8) {
            showError(error, "Password has too be at least 8 characters.")
            return;
        }
        if (password.value !== password2.value) {
            showError(error, "Passwords did not match.");
            return;
        }
        let user = {
            email: email.value,
            password: password.value,
            username: username.value
        }
        loading.hidden = false;
        const request = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        }
        try {
            let response = await fetch("/api/register", request);
            let data = await response.json();
            if (!data["error"]) {
                sessionStorage.setItem("user", JSON.stringify(user));
                window.location.href = "/todos";
            } else {
                showError(error, data["message"]);
            }
        } catch (e) {
            showError(error, "Failed to connect to the server.");
        }
        loading.hidden = true;
    })
}

document.addEventListener("DOMContentLoaded", onLoad);
