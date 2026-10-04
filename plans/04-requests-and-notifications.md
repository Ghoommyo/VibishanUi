# Phase 4: User dashboard, request flow and notifications

## Files
- `src/app/(app)/(drawer)/home.tsx` switches on role: user shows `RequestServiceForm`; listener or moderator shows `ProviderAnalytics` (phase 6).
- `src/components/request-service-form.tsx`:
  - "Select Service" with a `RadioGroup` for Listener or Moderator.
  - "Select Listener" / "Select Moderator" opens a `SearchableSelect` showing each name and its `StarRating`. It is multi-select for listeners and single-select for moderators.
  - In Moderator mode only, a Participants picker (`searchUsers`, at least one required).
  - Confirm calls `createListenRequests` or `createModerateRequest`. On success it shows "Request sent to listener abc[, xyz]" or "Request sent to moderator abc and participants x, y", then resets the form.
  - A link to Chatrooms.
- `src/app/(app)/notifications.tsx`:
  - Each item shows the requester, request kind, timestamp and status.
  - Incoming pending requests get Accept and Reject buttons, which call `requests.respond`.
  - Outgoing requests show their status (pending, accepted or rejected, per approver).
  - Opening the screen marks items as read.
  - Moderators only see a request once every participant has accepted; the API enforces this.
- Shared components: `RadioGroup`, `SearchableSelect` (a `Dialog` with a search field and a FlatList of checkable rows), `StarRating` (display and input), `Dialog` (a wrapper around RN `Modal` that works on web), `StatusPill`.

## Done when
1. Alice sends requests to two listeners, and both see them in their notifications.
2. Alice sends a moderate request with bob, and maya doesn't see it until bob accepts.
3. Accepting moves the room to active.
