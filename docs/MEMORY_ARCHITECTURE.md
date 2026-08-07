# NOEMA Memory Architecture v0.5

NOEMA uses three separate continuity layers.

```text
1. Current conversation
   transient working context

2. Recent continuity
   bounded local conversational buffer
   24 exchanges maximum

3. Memory Library
   intentional long-term retention
   explicit save action only
```

## Rule: conversation is not consent to long-term memory

A statement made during a conversation does not automatically enter the Memory Library.

Long-term memory is created through an explicit action such as **Save to Memory**.

## Memory item provenance

Every retained item contains:

- identifier;
- kind;
- scope;
- title;
- content;
- tags;
- source type and source label;
- confidence;
- created timestamp;
- updated timestamp;
- optional expiration;
- active state.

## Sensitive secrets

Ordinary Memory Library storage rejects obvious credential-like content such as:

- passwords;
- API/secret keys;
- private keys;
- authentication tokens;
- Social Security identifiers;
- payment-card credentials.

This is a browser-side guard, not a substitute for secure secret storage.

## Retrieval

Memory retrieval is contextual.

Relevant memories are ranked using:
- query terms;
- active mode;
- active project;
- tags;
- memory scope;
- memory kind.

Only the most relevant retained items are placed into generated NOEMA context.

## Portability

The user may export the local Memory Library as JSON.

Future versions may add authenticated encrypted synchronization, but v0.5 remains local-browser-only.
