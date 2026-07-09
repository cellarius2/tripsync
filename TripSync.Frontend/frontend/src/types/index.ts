export type TripType = 0 | 1;
export type TripStatus = 0 | 1 | 2 | 3 | 4 | string;
export type ExpenseStatus = 0 | 1;
export type VoteCategory = 0 | 1 | 2 | 3 | 4 | 5;

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateTripRequest {
  name: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: TripType;
}

export interface JoinTripRequest {
  inviteCode: string;
}

export interface TripListItem {
  id: string;
  name: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: TripType;
  status: TripStatus;
  inviteCode: string;
  participantsCount: number;
  totalSaved: number;
  estimatedTotalCost: number;
  groupProgressPercent: number;
}

export interface TripDashboard extends TripListItem { }

export interface TripParticipant {
  userId: string;
  name: string;
  avatarColor?: string | null;
  avatarKey?: string | null;
  isOwner: boolean;
  amountSaved: number;
}

export interface ParticipantSummary {
  participantId: string;
  name: string;
  avatarColor?: string | null;
}

export interface TripDetails {
  id: string;
  name: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: TripType;
  status: TripStatus;
  inviteCode: string;
  participants: TripParticipant[];
  estimatedTotalCost: number;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  status: ExpenseStatus;
  paidByParticipantId: string;
  paidByName: string;
  splitEqually: boolean;
  createdAt: string;
  paidAt?: string | null;
}

export interface Debt {
  fromParticipantId: string;
  fromName: string;
  toParticipantId: string;
  toName: string;
  amount: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface UpdateSavingsRequest {
  amountSaved: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category?: string | null;
  isDone: boolean;
  assignedToParticipantId?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface CreateChecklistItemRequest {
  title: string;
  category?: string;
  assignedToParticipantId?: string | null;
}

export interface UpdateChecklistItemRequest {
  title: string;
  category?: string;
  assignedToParticipantId?: string | null;
}

export interface TripDocument {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  isRequired?: boolean;
  isDefault?: boolean;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripDocumentRequest {
  name: string;
  description?: string | null;
  category?: string | null;
  isRequired?: boolean;
}

export interface ParticipantDocuments {
  participantId: string;
  participantName: string;
  avatarColor?: string;
  progress: number;
  documents: TripDocument[];
}

export interface DocumentSummary {
  totalDocuments: number;
  completedDocuments: number;
  percentage: number;
}

export interface Notification {
  id?: string;
  title?: string;
  type?: string;
  message: string;
  tripId?: string;
  recipientUserId?: string | null;
  senderUserId?: string | null;
  isRead?: boolean;
  createdAt?: string;
  tripName?: string | null;
  actorName?: string | null;
  targetUserId?: string | null;
  targetUserName?: string | null;
}

export interface TripActivity {
  id: string;
  tripId: string;
  tripName?: string | null;
  type: string;
  actorUserId?: string | null;
  actorName?: string | null;
  targetUserId?: string | null;
  targetUserName?: string | null;
  message: string;
  createdAt: string;
}

export interface VoteOption {
  id: string;
  title: string;
  voteCount: number;
  percentage: number;
  isSelectedByCurrentUser: boolean;
}

export interface VotePoll {
  id: string;
  title: string;
  category: VoteCategory;
  isClosed: boolean;
  createdAt: string;
  options: VoteOption[];
}

export interface CreateVoteOptionRequest {
  title: string;
}

export interface CreateVotePollRequest {
  title: string;
  category: VoteCategory;
  options: CreateVoteOptionRequest[];
}

export interface CastVoteRequest {
  optionId: string;
}

export interface TravelBudget {
  id?: string | null;
  tripId: string;
  transportationAmount: number;
  accommodationAmount: number;
  foodAmount: number;
  activitiesAmount: number;
  emergencyReserveAmount: number;
  totalAmount: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UpdateTravelBudgetRequest {
  transportationAmount: number;
  accommodationAmount: number;
  foodAmount: number;
  activitiesAmount: number;
  emergencyReserveAmount: number;
}

export interface UpdateParticipantSavingRequest {
  amountSaved: number;
}

export interface FinancialSummary {
  totalBudget: number;
  totalSaved: number;
  remainingAmount: number;
  goalPerParticipant: number;
  myAmountSaved: number;
  myProgressPercentage: number;
  overallProgressPercentage: number;
  activeParticipantsCount: number;
}

export interface ParticipantSavingProgress {
  participantId: string;
  userId: string;
  name: string;
  avatarColor?: string | null;
  amountSaved: number;
  goalAmount: number;
  progressPercentage: number;
  updatedAt?: string | null;
}
