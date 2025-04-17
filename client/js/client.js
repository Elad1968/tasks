/**
 * Stop showing error on an error element.
 * @param {HTMLElement} error - The element on which to stop showing the error.
 */
function hideError(error) {
    error.innerText = ""
    error.hidden = true;
}
/**
 * Display an error to an error element.
 * @param {HTMLElement} error - The element on which to display the error.
 * @param {string} message - The message to display.
 */
function showError(error, message) {
    error.innerText = message
    error.hidden = false;
}
/**
 * Create a function that hides an error on a specific error element.
 * @param {HTMLElement} error - The element on which to hide.
 * @returns {function(): void} The function that hides the error.
 */
function hideErrorLambda(error) {
    return () => {
        hideError(error);
    }
}
/**
 * Check if the user is logged in.
 * @returns {boolean} true if the user is logged in false otherwise.
 */
function isLoggedIn() {
    return sessionStorage.getItem("user") !== null;
}
/**
 * Remove all the children of an element.
 * @param {HTMLElement} element - the element whose children will be removed.
 */
function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}
/**
 * Get an object representing the current user from the session storage.
 * @returns {Object} The user object.
 */
function loadUser() {
    if (!isLoggedIn()) throw "Not logged in!";
    return JSON.parse(sessionStorage.getItem("user"));
}
