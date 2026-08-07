# NOEMA Capability Ledger

Every consequential capability is assigned a policy state:

- `allow` — may proceed within ordinary policy;
- `confirm` — explicit user confirmation is required;
- `admin-approval` — authenticated administrator authority is required;
- `blocked` — NOEMA must not perform the capability;
- `unavailable` — capability is not currently connected.

The ledger deliberately separates **what Noema can reason about** from **what Noema is authorized to do**.

Examples:

| Capability | State |
|---|---|
| conversation.respond | allow |
| resources.search | allow |
| memory.record | confirm |
| files.modify | confirm |
| messages.send | confirm |
| calendar.write | confirm |
| code.propose-update | allow |
| code.deploy-canonical | admin-approval |
| permissions.elevate-self | blocked |
| ethics.disable | blocked |
| commerce.purchase | blocked |

The future secure administrator system may satisfy `admin-approval`; it must not silently convert blocked constitutional capabilities into ordinary permissions.
