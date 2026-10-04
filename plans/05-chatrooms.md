# Phase 5: Chatrooms, chat, closure, rating and summary

## Files
- `src/app/(app)/(drawer)/chats.tsx` is a WhatsApp-style list built from `ChatRow`. Each row shows an avatar, a title (provider and participants), the last message, the time, and a `StatusPill`.
  - Pending or declined: tapping shows a hint ("Waiting for approval…") and does not open the room.
  - Active: opens the room.
  - Closed: opens a `Dialog` with two choices. "View chat" opens the room read-only; "View summary" opens the summary screen.
- `src/app/(app)/chat/[id]/index.tsx`:
  - **Header**: the member avatars and a Submit button. If you're the room's moderator, tapping a member's avatar opens a Mute/Unmute dialog.
  - **Messages**: a list of `MessageBubble`s that polls every 3s. Long-press, or the star icon on web, toggles a star.
  - **Composer**:
    - A text field and Send button.
    - Both are disabled when you're muted, when you've already submitted, or when the room is closed, and the reason is shown.
  - **Submit dialog**:
    - The field is labelled Conclusion for users and participants, Observation for listeners, or Verdict for moderators.
    - The button reads "Close & submit" and calls `submitClosure`. A moderator's verdict closes the room for everyone.
  - **Rating dialog**: appears when the room is closed and you're a non-provider member who hasn't rated yet. It takes stars plus optional feedback and calls `rate`.
  - **Closed room**: opens read-only, with no composer and a single "Close chat" button that goes back.
- `src/app/(app)/chat/[id]/summary.tsx` shows four sections: starred messages in order, comments by participants, the listener's observation, and the moderator's verdict.
- Shared components: `ChatRow`, `MessageBubble`, `EmptyState`.

## Done when
- A full listen session works: chat, star, conclusion, observation, room closed, rating, summary.
- A full moderated session works: mute blocks bob's Send button, the verdict closes the room for everyone, and the rating dialog appears for the users.
