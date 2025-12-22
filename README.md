# Quickfood

Monorepo for **Quickfood**, built with:

- Backend: NestJS + Prisma  
- Frontend: Angular  
- Node.js: 24.x (LTS)

---

## Repository structure

    repo/
      apps/
        api/        # NestJS backend
        web/        # Angular frontend
      docs/         # Documentation as code
      package.json  # Workspace root
      .gitignore
      README.md

- `apps/` contains runnable applications  
- `docs/` contains architecture notes, decisions, and documentation  

---

## Requirements

- Node.js 24.x (LTS)
- npm (comes with Node)

Linux/macOS users may use nvm.  
Windows users can install Node directly or use a version manager like Volta (optional).

---

## Getting started

### Install dependencies (once)

From the repository root, run:

    npm install

This installs dependencies for **all apps** via npm workspaces.

---

### Run the project (when implemented)

    npm run dev

The `setup` and `dev` scripts will be implemented as the project evolves.

---