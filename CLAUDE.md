# Rules

- No ternaries. Use small functions, early returns, or `if`.
- Prefer `as` over `any`. Evaluate `as` case by case, never `any`.
- Top-level functions: always `function` declarations, not arrow consts.
- zod: use as-is, no explanations.
- pnpm only. Never npm, npx, yarn.
- moon: use it for tasks.
- Review every change with user: copy the file to a temp dir (cp), user reviews it by hand, then apply via patch or similar CLI. Never apply edits in the temp copy and copy them back yourself.
- After applying a patch to a file, run `pnpm exec prettier --write <file>` then `pnpm exec eslint --fix <file>`, from the package dir that owns the file. Scope: `.prettierrc` sits at repo root. The command works only where it is installed.
- Caveman style for replies. Keep code and identifiers exact.
