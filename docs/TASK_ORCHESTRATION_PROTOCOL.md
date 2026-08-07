# Task Orchestration Protocol

Tasks have:
- id;
- label;
- purpose;
- specialist;
- dependencies;
- status;
- output.

Statuses:

```text
pending
ready
active
complete
handoff
unavailable
blocked
skipped
```

A dependent task may not become ready until its dependencies are settled.

`handoff` means a structured brief or destination was prepared but the external specialist did not execute.

`unavailable` means the system honestly lacks the required connection.

`blocked` means policy or audience restrictions prevented the task.
