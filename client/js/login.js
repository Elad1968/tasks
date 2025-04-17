function onLoad() {
    if (isLoggedIn()) {
        window.location.href = "/todos"
    }
    let login = document.getElementById("login");
    let register = document.getElementById("register");
    let error = document.getElementById("error");
    let loading = document.getElementById("loading");
    login.addEventListener("click", async () => {
        hideError(error);
        let email = document.getElementById("email")
        email.addEventListener("click", hideErrorLambda(error));
        let password = document.getElementById("password")
        password.addEventListener("click", hideErrorLambda(error));
        if (email.value.length === 0) {
            showError(error, "You have to provide an email to log in.");
            return;
        }
        if (password.value.length === 0) {
            showError(error, "You have to provide a password to log in.");
            return;
        }
        let userCred = {
            email: email.value,
            password: password.value
        }
        loading.hidden = false;
        const request = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userCred)
        }
        try {
            let response = await fetch("/api/login", request);
            let data = await response.json()
            if (data["error"]) {
                showError(error, data["message"]);
            } else {
                userCred["username"] = data["username"];
                sessionStorage.setItem("user", JSON.stringify(userCred));
                window.location.href = "/todos"
            }
        } catch (e) {
            showError(error, "Failed to connect to the server.");
        }
        loading.hidden = true;
    });
    register.addEventListener("click", () => {
        window.location.href = "register";
    });
}

document.addEventListener("DOMContentLoaded", onLoad);
