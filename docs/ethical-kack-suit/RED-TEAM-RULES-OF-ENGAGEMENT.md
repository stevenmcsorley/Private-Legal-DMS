# Red Team Rules of Engagement (ROE) — Private Legal DMS

- Scope: Local/staging environments only. Never production or real client data.
- Time window: Announce test window to team channels.
- Logging: Do not tamper with logs; ensure all tests are observable.
- Payloads: Use safe test strings (EICAR, benign SQL/XSS probes). No destructive actions.
- Exit criteria: Stop immediately upon service instability. Report findings with evidence.
- Artifacts: Store results under `/audit/YYYY-MM/red-team/`.
