// User and Authentication Types
// export enum UserRole {
//   PATIENT = "PATIENT",
//   DOCTOR = "DOCTOR",
//   PROVIDER = "PROVIDER",
//   ADMIN = "ADMIN",
// }

import { UserRole } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Dashboard Types
export interface DashboardData {
  user: UserProfile;
  healthStats: HealthStats;
  upcomingAppointment?: Appointment;
  recentResults: AnalysisResult[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  hasUnreadNotifications: boolean;
}

export interface HealthStats {
  heartRate: {
    value: number;
    unit: string;
  };
  steps: {
    value: number;
    unit: string;
  };
  // Other health metrics
}

// Appointment Types
export interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  location?: string;
  type: AppointmentType;
}

export enum AppointmentType {
  IN_PERSON = "IN_PERSON",
  VIDEO_CONSULTATION = "VIDEO_CONSULTATION",
}

export enum AppointmentStatus {
  UPCOMING = "UPCOMING",
  PAST = "PAST",
  CANCELED = "CANCELED",
  ALL = "ALL",
}

export interface AppointmentsListRequest {
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentsListResponse {
  appointments: AppointmentSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface AppointmentSummary {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatarUrl: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

export interface AppointmentDetail {
  id: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    avatarUrl: string;
  };
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reasonForVisit?: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  date: string;
  time: string;
  type: AppointmentType;
  reasonForVisit?: string;
}

export interface UpdateAppointmentRequest {
  date?: string;
  time?: string;
  type?: AppointmentType;
  reasonForVisit?: string;
  status?: AppointmentStatus;
}

export enum BloodType {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
  UNKNOWN = "Unknown",
}

export enum DeviceType {
  SMARTWATCH = "SMARTWATCH",
  FITNESS_TRACKER = "FITNESS_TRACKER",
  BLOOD_PRESSURE_MONITOR = "BLOOD_PRESSURE_MONITOR",
  GLUCOSE_MONITOR = "GLUCOSE_MONITOR",
  SCALE = "SCALE",
  OTHER = "OTHER",
}

export enum SleepLevel {
  POOR = "POOR",
  FAIR = "FAIR",
  MODERATE = "MODERATE",
  GOOD = "GOOD",
  EXCELLENT = "EXCELLENT",
}

// Analysis Result Types
export interface AnalysisResult {
  id: string;
  title: string;
  date: string;
  riskLevel: string;
}

export interface ResultsListRequest {
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ResultsListResponse {
  results: AnalysisResultSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface AnalysisResultSummary {
  id: string;
  title: string;
  date: string;
  riskLevel: string;
  variant: "success" | "warning" | "destructive" | "default";
}

export interface AnalysisResultDetail {
  id: string;
  title: string;
  date: string;
  riskLevel: string;
  confidence: number;
  keyObservations: string[];
  recommendations: string;
  abcdeCriteria: ABCDECriteria;
  similarCases: SimilarCase[];
}

export interface ABCDECriteria {
  asymmetry: {
    flagged: boolean;
    details?: string;
  };
  border: {
    flagged: boolean;
    details?: string;
  };
  color: {
    flagged: boolean;
    details?: string;
  };
  diameter: {
    flagged: boolean;
    details?: string;
  };
  evolution: {
    flagged: boolean;
    details?: string;
  };
  totalFlags: number;
}

export interface SimilarCase {
  id: string;
  caseNumber: string;
  imageUrl: string;
  diagnosis: string;
  riskLevel: string;
}

// Doctor Types
export interface DoctorsListRequest {
  specialty?: string;
  name?: string;
  location?: string;
  availability?: string; // date
  page?: number;
  limit?: number;
}

export interface DoctorsListResponse {
  doctors: DoctorSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface DoctorSummary {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  status: "online" | "offline";
  avatarUrl: string;
}

export interface DoctorDetail {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  status: "online" | "offline";
  avatarUrl: string;
  experience: number; // years
  patients: number;
  specializations: string[];
  education: {
    institution: string;
    degree: string;
    years: string;
  }[];
  reviews: DoctorReview[];
}

export interface DoctorReview {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface DoctorAvailability {
  dates: {
    date: string;
    day: string;
    weekday: string;
    available: boolean;
  }[];
  timeSlots: {
    date: string;
    slots: {
      time: string;
      available: boolean;
      doctors?: number; // Number of available doctors
    }[];
  };
}

export interface ContactDoctorRequest {
  doctorId: string;
  messageType: "chat" | "video";
  message?: string;
}

// Profile Types
export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  age?: number;
  lastExamDate?: string;
  avatarUrl?: string;
  permissions: UserPermissions;
  healthInfo: HealthInformation;
  connectedDevices: ConnectedDevice[];
}

export interface UserPermissions {
  cameraAccess: boolean;
  locationAccess: boolean;
  notifications: boolean;
}

export interface HealthInformation {
  height?: {
    value: number;
    unit: string; // cm or inches
  };
  weight?: {
    value: number;
    unit: string; // kg or lbs
  };
  bloodType?: BloodType;
  allergies?: string[];
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: DeviceType;
  isConnected: boolean;
  lastSynced?: string;
}

// Update profile request
export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

// Update health info request
export interface UpdateHealthInfoRequest {
  height?: {
    value: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  bloodType?: BloodType;
  allergies?: string[];
}

// Update device request
export interface UpdateDeviceRequest {
  isConnected: boolean;
}

// Add device request
export interface AddDeviceRequest {
  name: string;
  type: DeviceType;
}

// Image Types
export interface ImageUploadRequest {
  image: File | Blob;
  metadata?: {
    bodyLocation?: string;
    notes?: string;
    captureSettings?: CaptureSettings;
  };
}

export interface CaptureSettings {
  lighting: number;
  focus: number;
  flash: number;
}

export interface ImageUploadResponse {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  qualityCheck: ImageQualityCheck;
}

export interface ImageQualityCheck {
  clarity: {
    score: number;
    status: "Good" | "Fair" | "Poor";
  };
  lighting: {
    score: number;
    status: "Good" | "Fair" | "Poor";
  };
  framing: {
    score: number;
    status: "Good" | "Fair" | "Poor";
  };
}

export interface CaptureGuidelines {
  guidelines: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export interface ImageProcessingRequest {
  imageId: string;
  adjustments: {
    contrast?: number;
    brightness?: number;
    zoomLevel?: number;
  };
  filter?: "original" | "enhanced" | "grayscale" | "highContrast" | "warm";
}

export interface ImageMetadata {
  resolution: {
    width: number;
    height: number;
  };
  size: number; // in bytes
  format: string;
  dateTaken: string;
}

export interface ProcessedImageResponse {
  id: string;
  processedImageUrl: string;
}

// Onboarding Types
export interface OnboardingProgress {
  completedSteps: string[];
  currentStep: string;
  isComplete: boolean;
  age?: number;
  role?: UserRole;
  sleepLevel?: SleepLevel;
  selectedConditions?: string[];
}

export interface UpdateAgeRequest {
  age: number;
}

export interface UpdateRoleRequest {
  role: UserRole;
}

export interface UpdateSleepRequest {
  sleepLevel: SleepLevel;
  sleepHoursDaily?: number;
}

export interface UpdateConditionsRequest {
  conditions: string[];
}

export interface ConditionsListResponse {
  conditions: {
    id: string;
    name: string;
    category?: string;
  }[];
  total: number;
}
