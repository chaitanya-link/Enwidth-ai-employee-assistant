export const EMPLOYEES = [
  { id: "EMP001", name: "Rahul", department: "Engineering" },
  { id: "EMP002", name: "Priya", department: "HR" },
  { id: "EMP003", name: "Sneha", department: "Finance" },
];

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}