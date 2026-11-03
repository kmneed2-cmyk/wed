# Security Specification - Shahi Shadiama

## Data Invariants
1. `settings/weddingConfig` is a singleton document.
2. Only the admin (`km@gmail.com`) can update `settings/weddingConfig`.
3. RSVPs can be created by anyone but never read, updated, or deleted by guests.
4. The admin can read all RSVPs.

## The "Dirty Dozen" Payloads (Denial Expected)
1. Guest attempts to update `settings/weddingConfig` theme.
2. Guest attempts to update `settings/weddingConfig` groom name.
3. Unauthenticated user attempts to read RSVP collection.
4. Authenticated non-admin attempts to update `settings/weddingConfig`.
5. Guest attempts to delete a document in `settings/weddingConfig`.
6. Attacker attempts to inject a large string into `groomName`.
7. Attacker attempts to set `updatedAt` to a future date manually.
8. Guest attempts to read another guest's RSVP.
9. Guest attempts to delete their own RSVP after submission.
10. Attacker attempts to create an RSVP with a 1MB name string.
11. Attacker attempts to spoof admin by setting a custom claim (blocked by rules).
12. Attacker attempts to write to a collection not defined in the blueprint.

## Test Runner Logic
- `admin_uid` for `km@gmail.com` (to be determined during implementation/auth).
- Guest `uid` is null or any other UID.
- Tests will verify `PERMISSION_DENIED` for all above cases.
