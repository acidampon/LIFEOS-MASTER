# LIFEOS cloud and AI configuration

LIFEOS remains local-first. Cloud sync and AI are optional integrations.

## Supabase cloud sync
Set:
- VITE_LIFEOS_SUPABASE_URL
- VITE_LIFEOS_SUPABASE_ANON_KEY

Run `supabase/schema.sql` in the LIFEOS Supabase project. The browser only uses the public anon key; Row Level Security must remain enabled.

## AI Guide
Set:
- VITE_LIFEOS_AI_ENDPOINT

The client sends only non-private planning context: active goal metadata, open action metadata, mission metadata, habit streak metadata, and the deterministic recommended action. Journal bodies and financial transaction details are never sent by the client AI integration.
