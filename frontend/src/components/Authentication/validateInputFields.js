export function validateName(fullName) {
    if (fullName.length < 6) {
        return "Full name must be at least 6 characters";
    }

    return true;
}

export function validateEmail(email) {
    const regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!regex.test(email)) {
        return "A valid email address must be provided";
    }

    if (email.length < 6) {
        return "Email must be at least 6 characters";
    }

    return true;
}

export function validatePassword(password) {
    if (password.length < 6) {
        return "Password must be at least 6 characters";
    }

    return true;
}
