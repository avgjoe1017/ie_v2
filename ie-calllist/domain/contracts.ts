import { z } from 'zod';

// Enums
export const FeedEnum = z.enum(['3pm', '5pm', '6pm']);
export type Feed = z.infer<typeof FeedEnum>;

export const BroadcastStatusEnum = z.enum(['live', 'rerack', 'might']);
export type BroadcastStatus = z.infer<typeof BroadcastStatusEnum>;

export const RoleEnum = z.enum(['producer', 'admin']);
export type Role = z.infer<typeof RoleEnum>;

// Phone Number Schema
export const PhoneNumberSchema = z.object({
  id: z.string().uuid(),
  stationId: z.string().uuid(),
  label: z.string().min(1, 'Label is required'),
  number: z.string().min(7, 'Phone number must be at least 7 digits'),
  sortOrder: z.number().int().min(1).max(4),
  createdAt: z.date(),
});

export const CreatePhoneSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  number: z.string().min(7, 'Phone number must be at least 7 digits'),
  sortOrder: z.number().int().min(1).max(4).optional(),
});

export const UpdatePhoneSchema = z.object({
  label: z.string().min(1, 'Label is required').optional(),
  number: z.string().min(7, 'Phone number must be at least 7 digits').optional(),
  sortOrder: z.number().int().min(1).max(4).optional(),
});

// Station Schema
export const StationSchema = z.object({
  id: z.string().uuid(),
  marketNumber: z.number().int().min(1).max(210),
  marketName: z.string().min(1),
  callLetters: z.string().min(1),
  feed: FeedEnum,
  broadcastStatus: BroadcastStatusEnum.nullable(),
  airTimeLocal: z.string(),
  airTimeET: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  phones: z.array(PhoneNumberSchema).optional(),
});

export const CreateStationSchema = z.object({
  marketNumber: z.number().int().min(1).max(210),
  marketName: z.string().min(1),
  callLetters: z.string().min(1),
  feed: FeedEnum,
  broadcastStatus: BroadcastStatusEnum.nullable().optional(),
  airTimeLocal: z.string(),
  airTimeET: z.string(),
});

export const UpdateStationSchema = z.object({
  marketName: z.string().min(1).optional(),
  callLetters: z.string().min(1).optional(),
  feed: FeedEnum.optional(),
  broadcastStatus: BroadcastStatusEnum.nullable().optional(),
  airTimeLocal: z.string().optional(),
  airTimeET: z.string().optional(),
  isActive: z.boolean().optional(),
});

// User Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  role: RoleEnum,
  createdAt: z.date(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  pin: z.string().length(6, 'PIN must be 6 digits').regex(/^\d+$/, 'PIN must be numeric'),
  role: RoleEnum.default('producer'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  pin: z.string().length(6).regex(/^\d+$/).optional(),
  role: RoleEnum.optional(),
});

// Call Log Schema
export const CallLogSchema = z.object({
  id: z.string().uuid(),
  stationId: z.string().uuid(),
  phoneId: z.string().uuid(),
  phoneNumber: z.string(),
  calledBy: z.string().uuid(),
  createdAt: z.date(),
});

export const CreateCallLogSchema = z.object({
  stationId: z.string().uuid(),
  phoneId: z.string().uuid(),
  phoneNumber: z.string(),
});

// Edit Log Schema
export const EditLogSchema = z.object({
  id: z.string().uuid(),
  stationId: z.string().uuid(),
  field: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
  editedBy: z.string().uuid(),
  createdAt: z.date(),
});

// Auth Schema
export const LoginSchema = z.object({
  pin: z.string().length(6, 'PIN must be 6 digits').regex(/^\d+$/, 'PIN must be numeric'),
});

// API Response Types
export type Station = z.infer<typeof StationSchema>;
export type PhoneNumber = z.infer<typeof PhoneNumberSchema>;
export type User = z.infer<typeof UserSchema>;
export type CallLog = z.infer<typeof CallLogSchema>;
export type EditLog = z.infer<typeof EditLogSchema>;

// Station with phones for list view
export interface StationWithPhones extends Omit<Station, 'phones'> {
  phones: PhoneNumber[];
}

