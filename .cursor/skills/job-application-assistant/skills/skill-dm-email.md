# skill-dm-email — Recruiter DM & Outreach Email

Trigger: user selects option [4] or [5] at Approval Gate.

## Case 1 — Outreach Email (recruiter post with email)
Generate a personalized cold email:
- Subject: punchy, role-specific, under 60 chars
- Body: 4-5 sentences max
  - Line 1: why you're reaching out (saw their post, specific role)
  - Line 2-3: 1-2 strongest credentials matched to the role
  - Line 4: clear ask (attached resume, 15-min call)
- Attach resume (reference the Drive link)
- Signature: Name | Role | LinkedIn | Phone

After user approves draft: send via Gmail MCP.
Confirm send + log to Notion.

## Case 3 — LinkedIn DM (recruiter said "DM me")
Generate a short DM (LinkedIn character limit ~300 chars for connection note):
- Mention their post specifically
- 1 strongest credential
- Clear ask or CTA
- No attachments in DM — offer to share resume if they respond

Show draft. User approves → copy to clipboard (cannot auto-send LinkedIn DMs).
