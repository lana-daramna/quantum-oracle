# Quantum Oracle  Birzeit University, Qiskit Fall Fest 2026
Visitor asks a question → quantum-inspired simulation (2-qubit H⊗H) → personality/energy → Gemini answer → stored → emailed. Simulated quantum only.

## Run
    cp .env.example .env     # fill in keys (never commit/share .env)
    npm install && npm start # Node 20.6+, http://localhost:3000
    npm test                 # offline, no API calls
    node --env-file=.env scripts/check-gemini.cjs   # manual check of your Gemini key/model

Views: `/` visitor · `/?view=display` public screen · `/?view=admin` operator · `/?demo=1` demo.
Admin: header `x-admin-secret` = `ADMIN_SECRET`.
Email: Resend. `onboarding@resend.dev` only delivers to your own account email — verify a domain to email visitors.
