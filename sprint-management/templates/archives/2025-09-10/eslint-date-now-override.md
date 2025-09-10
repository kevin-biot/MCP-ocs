# ESLint Override Pattern for Date.now() (D-009)

Use this override only for legitimate numeric-time calculations (durations/cutoffs), not for persisted timestamps.

Example:

```ts
// eslint-disable-next-line no-restricted-properties -- Using Date.now() to compute cutoff; not persisted as a timestamp
const cutoff = Date.now() - (60 * 60 * 1000);
```

Justification must state why numeric epoch is required and confirm the value is not stored as a timestamp field.

