export type Role = 'user' | 'listener' | 'moderator';
export type ProviderRole = Exclude<Role, 'user'>;

export type Profile = {
  name: string;
  phone: string;
  bio: string;
  /** Areas of expertise, only meaningful for listeners and moderators. */
  expertise: string[];
};

export type UserSettings = {
  notifyRequests: boolean;
  /** Show the last message text in the chatroom list. */
  showMessagePreviews: boolean;
  /** Providers only: when false they are hidden from the request dropdown. */
  available: boolean;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  profile: Profile;
  settings: UserSettings;
  createdAt: number;
};

export type PublicUser = Omit<User, 'password'>;

export type ApprovalState = 'pending' | 'accepted' | 'rejected';
export type RequestKind = 'listen' | 'moderate';

export type ServiceRequest = {
  id: string;
  kind: RequestKind;
  requesterId: string;
  providerId: string;
  participantIds: string[];
  /** Everyone who has to approve: participants and the provider. */
  approvals: Record<string, ApprovalState>;
  status: ApprovalState;
  roomId: string;
  createdAt: number;
};

export type RoomStatus = 'pending' | 'active' | 'closed' | 'rejected';

export type Closure = { userId: string; text: string; at: number };

export type Rating = { byId: string; stars: number; feedback: string; at: number };

export type Room = {
  id: string;
  kind: RequestKind;
  requestId: string;
  requesterId: string;
  providerId: string;
  memberIds: string[];
  status: RoomStatus;
  mutedIds: string[];
  closures: Record<string, Closure>;
  ratings: Rating[];
  createdAt: number;
  closedAt: number | null;
};

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  starredBy: string[];
  createdAt: number;
};

export type NotificationKind = 'request_sent' | 'request_received' | 'request_update';

export type AppNotification = {
  id: string;
  userId: string;
  kind: NotificationKind;
  requestId: string;
  text: string;
  read: boolean;
  createdAt: number;
};

export type DbState = {
  version: 1;
  users: User[];
  requests: ServiceRequest[];
  rooms: Room[];
  messages: Message[];
  notifications: AppNotification[];
};

export type SignupInput = { username: string; email: string; password: string; role: Role };

export type RatingSummary = { average: number | null; count: number };
export type ProviderSummary = PublicUser & { rating: RatingSummary };

export type SentRequestsResult = { providerNames: string[]; participantNames: string[] };

/** How the current user takes part in a room. Decides the closing-note label and permissions. */
export type RoomRole = 'member' | 'listener' | 'moderator';
export type ClosureLabel = 'Conclusion' | 'Observation' | 'Verdict';

export type RoomListItem = {
  room: Room;
  provider: PublicUser;
  others: PublicUser[];
  lastMessage: Message | null;
  lastActivity: number;
};

export type RoomDetail = {
  room: Room;
  members: PublicUser[];
  myRole: RoomRole;
  canSend: boolean;
  /** Why the composer is disabled, when it is. */
  sendBlockedReason: string | null;
  hasSubmitted: boolean;
  needsRating: boolean;
};

export type MessageWithSender = Message & { sender: PublicUser };

export type RoomSummary = {
  room: Room;
  provider: PublicUser;
  starred: MessageWithSender[];
  comments: { user: PublicUser; text: string; at: number }[];
  observation: { user: PublicUser; text: string } | null;
  verdict: { user: PublicUser; text: string } | null;
};

export type NotificationItem = AppNotification & {
  request: ServiceRequest;
  requester: PublicUser;
  provider: PublicUser;
  participants: PublicUser[];
  /** True when the current user still has to accept or reject. */
  actionable: boolean;
};

export type ProviderStats = {
  listeningDone: number;
  moderationDone: number;
  activeSessions: number;
  averageRating: number | null;
  ratingCount: number;
  /** Count of ratings per star value, index 0 = 1 star. */
  ratingDistribution: number[];
  /** Completed sessions per week, oldest first. */
  weekly: { label: string; value: number; start?: number; end?: number }[];
  feedback: { by: PublicUser; stars: number; text: string; at: number }[];
};
