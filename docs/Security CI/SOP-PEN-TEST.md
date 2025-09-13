# SOP: Penetration Testing (OWASP Top 10)

**Owner:** Security Lead  
**Cadence:** Quarterly, and before each release  
**Inputs:** Staging environment URL, test accounts, representative data

## Steps

1. Run CI pipeline (`security-scan`) or execute playbook locally.
2. Review ZAP + Trivy + dependency reports.
3. File issues for Medium+ findings; assign owners and due dates.
4. Verify critical/high items remediated before release.
5. Export evidence to `/audit/YYYY-MM/` and attach to the audit ticket.
6. Record meeting notes and sign-off from Security Lead.

## Acceptance Criteria

- Zero **Critical/High** open issues.
- Documented mitigation plan for Medium findings.
- Evidence uploaded and linked from the release ticket.
