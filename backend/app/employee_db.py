# Mock employee database — simulates what would normally be a real HR database
EMPLOYEE_DB = {
    "EMP001": {
        "name": "Rahul",
        "department": "Engineering",
        "leave_balance": 12
    },
    "EMP002": {
        "name": "Priya",
        "department": "HR",
        "leave_balance": 8
    },
    "EMP003": {
        "name": "Sneha",
        "department": "Finance",
        "leave_balance": 15
    }
}

def get_employee_info(employee_id):
    """
    Looks up an employee's info by their ID.
    Returns the employee's data, or an error message if not found.
    """
    employee = EMPLOYEE_DB.get(employee_id)
    if employee is None:
        return {"error": f"No employee found with ID {employee_id}"}
    return {
        "employee_id": employee_id,
        "name": employee["name"],
        "department": employee["department"],
        "leave_balance": employee["leave_balance"]
    }

def apply_leave(employee_id, start_date, end_date, reason):
    """
    Mock leave application. Checks if employee exists, then
    'submits' the leave request (no real database write, just a
    simulated success/failure response, as required by the assessment).
    """
    employee = EMPLOYEE_DB.get(employee_id)
    if employee is None:
        return {
            "status": "failure",
            "message": f"No employee found with ID {employee_id}"
        }

    # Simple mock logic: assume every request needs at least 1 day of leave balance
    if employee["leave_balance"] <= 0:
        return {
            "status": "failure",
            "message": f"{employee['name']} has insufficient leave balance."
        }

    # Simulate deducting leave balance (mock only, not persisted after restart)
    employee["leave_balance"] -= 1

    return {
        "status": "success",
        "message": f"Leave application submitted successfully for {employee['name']} "
                    f"from {start_date} to {end_date}. Reason: {reason}.",
        "remaining_balance": employee["leave_balance"]
    }

if __name__ == "__main__":
    print("--- Test get_employee_info ---")
    print(get_employee_info("EMP001"))
    print(get_employee_info("EMP999"))  # should fail gracefully

    print("\n--- Test apply_leave ---")
    print(apply_leave("EMP001", "2026-09-20", "2026-09-22", "Travelling"))
    print(apply_leave("EMP999", "2026-09-20", "2026-09-22", "Travelling"))  # should fail gracefully