# Development Workflow for Database Changes

## The Problem
On Windows, Prisma Client generation fails when the dev server is running because it locks the query engine DLL file.

## Easiest Solution: Use `prisma migrate dev`

### Standard Workflow:
1. **Stop your dev server** (Ctrl+C)
2. **Make changes to `prisma/schema.prisma`**
3. **Run:**
   ```bash
   npm run db:migrate
   ```
   This command:
   - Creates a migration automatically
   - Applies it to the database
   - Regenerates Prisma Client
   - All in one step!

4. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### What I Did vs What You Should Do:

**What I did (manual approach - more error-prone):**
- Manually created migration file ✅
- Manually ran SQL to add column ✅
- Tried to regenerate client ❌ (failed due to lock)

**What you should do (automated - recommended):**
- Just use `prisma migrate dev` and it does everything!

## Alternative: If You Must Keep Server Running

If you absolutely need to regenerate while the server is running:

1. Use a process manager that can restart services
2. Or configure Prisma to use a different approach (more complex)

## Quick Reference Commands

```bash
# For schema changes (USE THIS!)
npm run db:migrate

# Only if you need to regenerate without migration
npm run db:generate

# Seed database
npm run db:seed
```

