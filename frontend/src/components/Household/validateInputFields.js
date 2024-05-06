export function validateHouseholdName(householdName) {
    if (householdName.length < 6) {
        return "Household name must be at least 6 characters";
    }

    return true;
}

export function validateHouseholdId(id) {
    if (id.length != 24) {
        return "Invalid unique ID";
    }

    return true;
}