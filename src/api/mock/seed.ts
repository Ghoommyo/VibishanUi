import type { DbState, Message, Role, Room, ServiceRequest, User } from '../types';

export const DEMO_PASSWORD = 'password123';

const DAY = 24 * 60 * 60 * 1000;

type SeedUser = [username: string, role: Role, name: string, bio: string, expertise: string[]];

const SEED_USERS: SeedUser[] = [
  ['alice', 'user', 'Alice Sharma', 'Product designer who likes long walks.', []],
  ['bob', 'user', 'Bob Mehta', 'Runner, reader, occasional over-thinker.', []],
  ['carol', 'user', 'Carol Dsouza', 'Grad student juggling deadlines.', []],
  ['lisa', 'listener', 'Lisa Kapoor', 'Patient ear, 5 years of peer support.', ['Stress', 'Career', 'Relationships']],
  ['leo', 'listener', 'Leo Fernandes', 'Here to listen without judgement.', ['Loneliness', 'Studies']],
  ['maya', 'moderator', 'Maya Iyer', 'Certified mediator for group conversations.', ['Conflict resolution', 'Family']],
  ['max', 'moderator', 'Max Rao', 'Keeps discussions fair and on track.', ['Roommates', 'Workplace']],
];

export const DEMO_ACCOUNTS = SEED_USERS.map(([username, role]) => ({ username, role }));

const uid = (username: string) => `u_${username}`;

export function createSeed(): DbState {
  const now = Date.now();
  const db: DbState = { version: 1, users: [], requests: [], rooms: [], messages: [], notifications: [] };

  db.users = SEED_USERS.map(
    ([username, role, name, bio, expertise], i): User => ({
      id: uid(username),
      username,
      email: `${username}@vibishan.app`,
      password: DEMO_PASSWORD,
      role,
      profile: { name, phone: `+91 98765 4321${i}`, bio, expertise },
      settings: { notifyRequests: true, showMessagePreviews: true, available: true },
      createdAt: now - 90 * DAY,
    }),
  );

  let seq = 0;
  const addSession = (opts: {
    kind: Room['kind'];
    requester: string;
    provider: string;
    participants?: string[];
    daysAgo: number;
    status: Room['status'];
    lines: [sender: string, text: string, starred?: boolean][];
    closures?: [user: string, text: string][];
    ratings?: [by: string, stars: number, feedback: string][];
  }) => {
    seq += 1;
    const createdAt = now - opts.daysAgo * DAY;
    const requesterId = uid(opts.requester);
    const providerId = uid(opts.provider);
    const participantIds = (opts.participants ?? []).map(uid);
    const memberIds = [requesterId, ...participantIds, providerId];
    const roomId = `room_seed${seq}`;
    const requestId = `req_seed${seq}`;
    const approvalState = opts.status === 'pending' ? 'pending' : 'accepted';

    const request: ServiceRequest = {
      id: requestId,
      kind: opts.kind,
      requesterId,
      providerId,
      participantIds,
      approvals: Object.fromEntries([...participantIds, providerId].map((id) => [id, approvalState])),
      status: approvalState,
      roomId,
      createdAt,
    };
    db.requests.push(request);

    db.rooms.push({
      id: roomId,
      kind: opts.kind,
      requestId,
      requesterId,
      providerId,
      memberIds,
      status: opts.status,
      mutedIds: [],
      closures: Object.fromEntries(
        (opts.closures ?? []).map(([u, text]) => [uid(u), { userId: uid(u), text, at: createdAt + DAY / 2 }]),
      ),
      ratings: (opts.ratings ?? []).map(([by, stars, feedback]) => ({
        byId: uid(by),
        stars,
        feedback,
        at: createdAt + DAY / 2,
      })),
      createdAt,
      closedAt: opts.status === 'closed' ? createdAt + DAY / 2 : null,
    });

    opts.lines.forEach(([sender, text, starred], i) => {
      const message: Message = {
        id: `msg_seed${seq}_${i}`,
        roomId,
        senderId: uid(sender),
        text,
        starredBy: starred ? [requesterId] : [],
        createdAt: createdAt + (i + 1) * 60_000,
      };
      db.messages.push(message);
    });

    return request;
  };

  // Past listening sessions spread over the last 8 weeks, so analytics have data.
  addSession({
    kind: 'listen', requester: 'alice', provider: 'lisa', daysAgo: 50, status: 'closed',
    lines: [
      ['alice', 'Work has been overwhelming lately.'],
      ['lisa', 'That sounds exhausting. What feels heaviest right now?'],
      ['alice', 'Mostly the feeling that I can never catch up.', true],
      ['lisa', 'Would it help to list what is actually due this week?'],
      ['alice', 'Yes, writing it down makes it smaller.', true],
    ],
    closures: [['alice', 'Felt lighter after talking it through.'], ['lisa', 'Alice benefits from breaking work into weekly lists.']],
    ratings: [['alice', 5, 'Lisa was calm and really listened.']],
  });
  addSession({
    kind: 'listen', requester: 'bob', provider: 'lisa', daysAgo: 36, status: 'closed',
    lines: [
      ['bob', 'Thinking about switching careers.'],
      ['lisa', 'What is drawing you to the change?'],
      ['bob', 'I want work that feels meaningful.', true],
    ],
    closures: [['bob', 'Good space to think out loud.'], ['lisa', 'Bob is clear on values, unsure on timing.']],
    ratings: [['bob', 4, 'Helpful questions, felt heard.']],
  });
  addSession({
    kind: 'listen', requester: 'carol', provider: 'leo', daysAgo: 22, status: 'closed',
    lines: [
      ['carol', 'Thesis deadline is next month and I feel stuck.', true],
      ['leo', 'Stuck on writing, or on the research itself?'],
      ['carol', 'Writing. I keep rewriting the intro.', true],
    ],
    closures: [['carol', 'Will draft the rest before polishing the intro.'], ['leo', 'Perfectionism on the intro is the blocker.']],
    ratings: [['carol', 4, 'Leo gave me a practical next step.']],
  });
  addSession({
    kind: 'listen', requester: 'alice', provider: 'lisa', daysAgo: 9, status: 'closed',
    lines: [
      ['alice', 'Checking in, the weekly list is working!', true],
      ['lisa', 'That is great to hear. Anything new on your mind?'],
    ],
    closures: [['alice', 'Progress feels real.'], ['lisa', 'Habits are sticking.']],
    ratings: [['alice', 5, 'Always a good conversation.']],
  });

  // Past moderated sessions.
  addSession({
    kind: 'moderate', requester: 'alice', provider: 'maya', participants: ['bob'], daysAgo: 29, status: 'closed',
    lines: [
      ['maya', 'Welcome both. Alice, would you like to start?'],
      ['alice', 'We disagreed about splitting the project credit.', true],
      ['bob', 'I felt my part was overlooked in the review.', true],
      ['maya', 'Can you each name one thing the other did well?'],
      ['alice', 'Bob handled all the testing, honestly.', true],
    ],
    closures: [
      ['alice', 'I will credit Bob explicitly next time.'],
      ['bob', 'Glad we talked, feels fair now.'],
      ['maya', 'Both agree to list contributions in shared reviews going forward.'],
    ],
    ratings: [['alice', 5, 'Maya kept it fair.'], ['bob', 4, 'Good structure.']],
  });
  addSession({
    kind: 'moderate', requester: 'carol', provider: 'max', participants: ['bob'], daysAgo: 15, status: 'closed',
    lines: [
      ['max', 'Let us keep this about the shared flat chores.'],
      ['carol', 'Dishes pile up for days.', true],
      ['bob', 'I can take dishes if you take bins.', true],
    ],
    closures: [['carol', 'Rota agreed.'], ['max', 'Weekly rota: Bob dishes, Carol bins, review in a month.']],
    ratings: [['carol', 4, 'Quick and practical.'], ['bob', 3, 'A bit rushed.']],
  });
  addSession({
    kind: 'moderate', requester: 'bob', provider: 'maya', participants: ['carol'], daysAgo: 4, status: 'closed',
    lines: [
      ['maya', 'Following up on the flat rota.'],
      ['bob', 'Mostly working, bins got missed twice.', true],
      ['carol', 'Fair, I will set a reminder.', true],
    ],
    closures: [['bob', 'Good follow up.'], ['maya', 'Rota stays, Carol adds reminders.']],
    ratings: [['bob', 5, 'Maya follows up properly.']],
  });

  // One live chat, so the chat screen can be tried straight away.
  addSession({
    kind: 'listen', requester: 'carol', provider: 'lisa', daysAgo: 1, status: 'active',
    lines: [
      ['carol', 'Hi Lisa, is now a good time?'],
      ['lisa', 'Of course, I am here. What is on your mind?'],
    ],
  });

  // A pending request waiting on leo, so the notification flow has something in it.
  const pending = addSession({ kind: 'listen', requester: 'bob', provider: 'leo', daysAgo: 0.1, status: 'pending', lines: [] });
  db.notifications.push(
    {
      id: 'ntf_seed1', userId: uid('leo'), kind: 'request_received', requestId: pending.id,
      text: 'Bob Mehta requested a listening session.', read: false, createdAt: pending.createdAt,
    },
    {
      id: 'ntf_seed2', userId: uid('bob'), kind: 'request_sent', requestId: pending.id,
      text: 'You sent a listening request to Leo Fernandes.', read: true, createdAt: pending.createdAt,
    },
  );

  return db;
}
