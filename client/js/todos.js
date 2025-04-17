/**
 * Fetch the tasks from the server.
 * @returns {Promise<Array<Object>>} The list of tasks stored on the server.
 */
async function fetchTasks() {
    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: sessionStorage.getItem("user")
    }
    let response = await fetch("/api/get-todos", request);
    let data = await response.json();
    if (data["error"]) throw data["message"];
    return data["todos"];
}
/**
 * Get the tasks stored locally on the session storage.
 * @returns {Array<Object>} The list of tasks stored on the session storage.
 */
function loadTasks() {
    if (sessionStorage.getItem("todos") === null) {
        sessionStorage.setItem("todos", JSON.stringify([]));
    }
    return JSON.parse(sessionStorage.getItem("todos"));
}
/**
 * Save the tasks object to the session storage.
 * @param {Array<Object>} tasks - The list of tasks to save.
 */
function saveTasks(tasks) {
    sessionStorage.setItem("todos", JSON.stringify(tasks));
}
/**
 * Create a Task element.
 * @param {Object} task - The task from which to build the element.
 * @param {number} index - The task's index.
 * @param {function(number)} taskDelete - A function that deletes the task.
 * @returns {HTMLDivElement} The created element.
 */
function createToDoElement(task, index, taskDelete) {
    let element = document.createElement("div");
    element.classList.add("todo");
    element.setAttribute("data-index", `${index}`);
    let check = document.createElement("input");
    check.type = "checkbox";
    check.classList.add("form-check-input");
    check.checked = task["done"];
    element.appendChild(check);
    let description = document.createElement("span");
    description.innerText = task["description"];
    if (task["done"]) {
        description.classList.add("done");
    }
    element.appendChild(description);
    let editDescription = document.createElement("input");
    editDescription.type = "text";
    editDescription.hidden = true;
    editDescription.value = description.innerText;
    element.appendChild(editDescription);
    let save = document.createElement("img");
    save.hidden = true;
    save.src = "/assets/images/save.png";
    element.appendChild(save);
    let cancel = document.createElement("img");
    cancel.hidden = true;
    cancel.src = "/assets/images/cancel.png";
    element.appendChild(cancel);
    let spacer = document.createElement("span");
    spacer.classList.add("spacer");
    element.appendChild(spacer);
    let edit = document.createElement("img");
    edit.src = "/assets/images/edit.png";
    element.appendChild(edit);
    let deleter = document.createElement("img");
    deleter.src = "/assets/images/delete.png";
    element.appendChild(deleter);
    edit.addEventListener("click", () => {
        cancel.addEventListener("click", () => {
            description.hidden = false;
            editDescription.hidden = true;
            editDescription.value = description.innerText;
            save.hidden = true;
            cancel.hidden = true;
        })
        save.addEventListener("click", () => {
            description.hidden = false;
            editDescription.hidden = true;
            save.hidden = true;
            cancel.hidden = true;
            let modifiedTasks = loadTasks();
            modifiedTasks[index]["description"] = editDescription.value;
            saveTasks(modifiedTasks);
            description.innerText = editDescription.value;
        })
        description.hidden = true;
        editDescription.hidden = false;
        save.hidden = false;
        cancel.hidden = false;
    });
    deleter.addEventListener("click", () => {
        taskDelete(index);
    });
    check.addEventListener("change", async () => {
        let modifiedTasks = loadTasks();
        modifiedTasks[index]["done"] = check.checked;
        if (check.checked) {
            description.classList.add("done");
            let audio = new Audio("/assets/sounds/completed.ogg");
            try {
                await audio.play();
            } catch (error) {
                console.log("Error playing sound.");
            }
        } else {
            description.classList.remove("done");
        }
        saveTasks(modifiedTasks);
    });
    return element;
}
/**
 * Show the tasks to the user.
 * @param {HTMLElement} list - A container element for the tasks.
 * @param {Array<Object>} tasks - The list of tasks to show.
 */
function showTasks(list, tasks) {
    let deleter = (index) => {
        tasks = loadTasks();
        tasks.splice(index, 1);
        saveTasks(tasks);
        showTasks(list, tasks);
    }
    list.hidden = true;
    let first = document.getElementById("inserter");
    removeAllChildren(list);
    list.appendChild(first);
    tasks.forEach((task, index) => {
        list.appendChild(createToDoElement(task, index, deleter));
    });
    list.hidden = false;
}
/**
 * A function for the document loaded listener.
 * @returns {Promise<void>} Nothing
 */
async function onLoad() {
    if (!isLoggedIn()) {
        window.location.href = "/login";
    }
    const welcome = document.getElementById("welcome");
    const description = document.getElementById("insert-description");
    const insert = document.getElementById("insert")
    const list = document.getElementById("list");
    const error = document.getElementById("error");
    const loading = document.getElementById("loading");
    const save = document.getElementById("save");
    const logout = document.getElementById("logout");
    const user = loadUser();
    welcome.innerText = `Welcome back, ${user["username"]}!`;
    try {
        saveTasks(await fetchTasks());
    } catch (e) {
        showError(error, "Failed to connect to the server.");
    }
    let tasks = loadTasks();
    showTasks(list, tasks);
    loading.hidden = true;
    insert.addEventListener("click", () => {
        let value = description.value;
        let task = {
            description: value,
            done: false
        }
        tasks = loadTasks();
        tasks.unshift(task);
        saveTasks(tasks);
        showTasks(list, tasks)
    });
    save.addEventListener("click", async () => {
        let user = JSON.parse(sessionStorage.getItem("user"));
        loading.hidden = false;
        try {
            let response = await fetch("/api/set-todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: user["email"],
                    password: user["password"],
                    todos: loadTasks()
                })
            });
            let data = await response.json();
            if (data["error"]) {
                showError(error, data["message"]);
            }
        } catch (e) {
            showError(error, "Failed to connect to the server.");
        }
        loading.hidden = true;
    })
    logout.addEventListener("click", () => {
        sessionStorage.clear()
        window.location.href = "/login"
    });
}

document.addEventListener("DOMContentLoaded", onLoad);
