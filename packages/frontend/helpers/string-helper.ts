/**
 * Returns up to two uppercase initials from first + last name.
 */
export function getInitials(firstName: string, lastName?: string | null): string {
  return [firstName[0], lastName?.[0]].filter(Boolean).join("").toUpperCase();
}
