# AI Context

This folder contains structured documentation for AI agents working on the FitCoach codebase. It provides the context needed to understand the project, avoid common mistakes, and follow established patterns.

## File tree

```
ai-context/
├── README.md                              ← You are here
├── AGENT_INDEX.md                         ← Start here every session. Routing tables for what to load.
├── CONTEXT.md                             ← Product overview, stack, folder structure, domain vocabulary, business rules
├── LANDMINES.md                           ← Dangerous patterns — read before modifying existing code
├── coding-standards/
│   ├── correct-patterns.md                ← 15 patterns extracted from the actual codebase
│   └── anti-patterns.md                   ← 15 things that look fine but break something here
├── integrations/
│   ├── supabase.md                        ← Database, auth, storage — all operations documented
│   ├── whatsapp.md                        ← WhatsApp deep link integration
│   └── upi-payments.md                    ← UPI payment flow (manual, no gateway)
└── concepts/
    ├── auth-and-roles.md                  ← Authentication, roles, guards, demo mode
    ├── diet-plans.md                      ← Diet plan creation, food database, macros
    ├── workout-plans.md                   ← Workout plan creation, exercise database
    ├── check-ins.md                       ← Weekly check-ins, photos, coach feedback
    ├── leads-and-pricing.md               ← Lead capture, pricing flow, checkout
    ├── demo-mode.md                       ← Demo mode bypass and mock data
    ├── habits.md                          ← Daily habit tracking
    └── measurements.md                    ← Body measurement logging and charts
```

## Starter prompt

Use this at the start of every session:

> Read `ai-context/AGENT_INDEX.md`. Then read `ai-context/CONTEXT.md` and `ai-context/LANDMINES.md`. [Add relevant concept or integration files based on the task.] Here's what I need: [task]
