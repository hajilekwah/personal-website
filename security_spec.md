# Security Specification & "Dirty Dozen" Adversarial Payloads

This specification defines the strict security guidelines and the "Dirty Dozen" exploit payloads designed to attempt to compromise the integrity of Firestore structures for `elijahhawk.io`.

## 1. Data Invariants
- **Identity Lock**: A user can only write or delete their own guestbook messages (`userId == request.auth.uid`). No user can modify another user's message once written.
- **Verification Rule**: All writes (except potentially public reads) require the user to be fully authenticated with an email verification flag (`request.auth.token.email_verified == true`), restricting bot spam.
- **Immutability of Key Values**: For both user settings and guestbook messages, identity keys (`userId`, `id`, `userEmail`) are strictly immutable after creation.
- **Bounds Enforcements**:
  - `text` of messages must range between 1 and 280 characters to avoid buffer/DoS abuse.
  - `theme` must belong strictly to the enum array `['indigo', 'emerald', 'crimson', 'amber', 'cyan']`.
  - `particleCount` must be an integer between 20 and 180.
  - `speed` must keep between 0.2 and 3.0.

---

## 2. The "Dirty Dozen" Exploitative Payloads

### Category A: Identity Hijacking (Spoofing)
1. **Payload 1: Message Writer Impersonation**
   - *Intended Breach*: Create a guestbook message with `userId = "victim_uid"`, impersonating another user.
   - *Payload*: `messages/msg_001` with content `{ "id": "msg_001", "userId": "attacker_fake_target", "userName": "Elijah Admin", "text": "Hacked", "createdAt": "request.time" }`
   - *Expected Result*: `PERMISSION_DENIED` (auth userId must match `request.auth.uid`).

2. **Payload 2: Settings Takeover**
   - *Intended Breach*: Read or overwrite parameters of another developer's layout (`settings/target_user_uid`).
   - *Payload*: `settings/target_user_uid` set to `{ "userId": "target_user_uid", "theme": "crimson", "speed": 1.5, "particleCount": 80, "interactiveGlow": true, "updatedAt": "request.time" }`
   - *Expected Result*: `PERMISSION_DENIED`.

3. **Payload 3: Unverified User Spammer**
   - *Intended Breach*: Write a message from a Google login where `email_verified == false`.
   - *Expected Result*: `PERMISSION_DENIED`.

---

### Category B: Value and Type Poisoning (Integrity Break)
4. **Payload 4: Theme Range Escalation (Enum Violation)**
   - *Intended Breach*: Inject "hotpink" or an unsupported theme to break the frontend parser.
   - *Payload*: `settings/my_uid` -> `{ "userId": "my_uid", "theme": "hotpink", "speed": 1.0, "particleCount": 80, "interactiveGlow": true, "updatedAt": "request.time" }`
   - *Expected Result*: `PERMISSION_DENIED`.

5. **Payload 5: Massive String Injection (DoS)**
   - *Intended Breach*: Send a 500KB text body as a guestbook message to inflate storage costs.
   - *Payload*: `messages/msg_huge` -> `{ "id": "msg_huge", "userId": "my_uid", "userName": "Attacker", "text": "A...[500,000 chars]", "createdAt": "request.time" }`
   - *Expected Result*: `PERMISSION_DENIED`.

6. **Payload 6: Speed Bounds Breach**
   - *Intended Breach*: Overwrite speeds to `999.0` or `-10.0` to break constellation ticker loops.
   - *Payload*: `settings/my_uid` -> `{ "userId": "my_uid", "theme": "indigo", "speed": 999.0, ... }`
   - *Expected Result*: `PERMISSION_DENIED`.

7. **Payload 7: Node Particle Grid Exhaustion**
   - *Intended Breach*: Force the canvas to spawn `100000` nodes, crashing client browsers.
   - *Payload*: `settings/my_uid` -> `{ "userId": "my_uid", "theme": "indigo", "speed": 1.2, "particleCount": 100000, ... }`
   - *Expected Result*: `PERMISSION_DENIED`.

---

### Category C: State & Structure Alteration
8. **Payload 8: Creation Timestamp Spoofing**
   - *Intended Breach*: Pre-load messages with a `createdAt` set to 5 years in the future.
   - *Payload*: `{ "createdAt": "2031-01-01T00:00:00Z" }`
   - *Expected Result*: `PERMISSION_DENIED` (must equal `request.time`).

9. **Payload 9: Ghost Fields Shadow Insertion**
   - *Intended Breach*: Insert an unauthorized property `adminRole: true` inside visitor profiles or settings.
   - *Payload*: `{ "userId": "my_uid", "theme": "indigo", "speed": 1.0, "particleCount": 50, "interactiveGlow": true, "adminRole": true, "updatedAt": "request.time" }`
   - *Expected Result*: `PERMISSION_DENIED` (enforced key size matching).

10. **Payload 10: Message Overwriting / Modification**
    - *Intended Breach*: Updating the text of an already posted message to deface it.
    - *Expected Result*: `PERMISSION_DENIED` (guestbook messages cannot be updated, only created/deleted of own ID).

11. **Payload 11: Document ID Poisoning (Path Abuse)**
    - *Intended Breach*: Inject highly malicious path variables like special character strings as the message document ID.
    - *Expected Result*: `PERMISSION_DENIED` on writes of path variables exceeding size or format checks.

12. **Payload 12: Orphaned Data Integrity Breach**
    - *Intended Breach*: Wipe or delete another user's written guestbook message directly from the client.
    - *Expected Result*: `PERMISSION_DENIED`.
