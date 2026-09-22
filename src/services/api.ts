import { API_URL } from "../constants/config";
import { getAuthToken } from "./auth";

type RegisterUserRequest = {
  email: string;
  password: string;
};

type RegisterUserResponse = {
  id: string;
  email: string;
  message: string;
};

type LoginUserRequest = {
  email: string;
  password: string;
};

type LoginUserResponse = {
  id: string;
  email: string;
  access_token: string;
  token_type: string;
};

type CurrentUserResponse = {
  id: string;
  email: string;
};

type PreferenceResponse = {
  user_id: string;
  gender?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  city?: string | null;
  distance_km?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type PreferenceCreateRequest = {
  gender?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  city?: string | null;
  distance_km?: number | null;
};

type PreferenceUpdateRequest = Partial<PreferenceCreateRequest>;

type ProfileResponse = {
  id: string;
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  bio?: string | null;
  occupation?: string | null;
  city?: string | null;
  profile_image_url?: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileCreateRequest = {
  name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  bio?: string | null;
  occupation?: string | null;
  city?: string | null;
  profile_image_url?: string | null;
};

type ProfileUpdateRequest = Partial<ProfileCreateRequest>;

type MatchRecord = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

type LikeProfileResponse = {
  matched: boolean;
  message: string;
  match?: MatchRecord;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    const detail = payload?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(' ');
    }

    if (typeof detail === 'string') {
      return detail;
    }

    if (payload?.message) {
      return payload.message;
    }
  } catch {
    return 'Something went wrong. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}

export async function checkBackendHealth() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error('Backend health check failed');
  }

  return response.json();
}

export async function authenticatedFetch<T>(
  path: string,
  options: RequestInit = {},
  tokenOverride?: string,
): Promise<T> {
  const token = tokenOverride ?? (await getAuthToken());
  const headers = new Headers(options.headers ?? {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

export async function registerUser(
  request: RegisterUserRequest,
): Promise<RegisterUserResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return response.json();
}

export async function loginUser(request: LoginUserRequest): Promise<LoginUserResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return response.json();
}

export async function getCurrentUser(tokenOverride?: string): Promise<CurrentUserResponse> {
  return authenticatedFetch('/auth/me', { method: 'GET' }, tokenOverride);
}

export async function getMyMatches(tokenOverride?: string): Promise<MatchRecord[]> {
  return authenticatedFetch('/matches', { method: 'GET' }, tokenOverride);
}

export async function blockUser(userId: string, tokenOverride?: string): Promise<Record<string, unknown>> {
  return authenticatedFetch('/safety/block', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  }, tokenOverride);
}

export async function reportUser(
  userId: string,
  reason: string,
  tokenOverride?: string,
): Promise<Record<string, unknown>> {
  return authenticatedFetch('/safety/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId, reason }),
  }, tokenOverride);
}

export async function unmatchUser(userId: string, tokenOverride?: string): Promise<Record<string, unknown>> {
  return authenticatedFetch('/safety/unmatch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  }, tokenOverride);
}

export async function createProfile(
  request: ProfileCreateRequest,
  tokenOverride?: string,
): Promise<ProfileResponse> {
  return authenticatedFetch('/profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  }, tokenOverride);
}

export async function getMyProfile(tokenOverride?: string): Promise<ProfileResponse> {
  return authenticatedFetch('/profiles/me', { method: 'GET' }, tokenOverride);
}

export async function updateProfile(
  request: ProfileUpdateRequest,
  tokenOverride?: string,
): Promise<ProfileResponse> {
  return authenticatedFetch('/profiles/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  }, tokenOverride);
}

export async function createPreferences(
  request: PreferenceCreateRequest,
  tokenOverride?: string,
): Promise<PreferenceResponse> {
  return authenticatedFetch('/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  }, tokenOverride);
}

export async function getMyPreferences(tokenOverride?: string): Promise<PreferenceResponse> {
  return authenticatedFetch('/preferences/me', { method: 'GET' }, tokenOverride);
}

export async function updatePreferences(
  request: PreferenceUpdateRequest,
  tokenOverride?: string,
): Promise<PreferenceResponse> {
  return authenticatedFetch('/preferences/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  }, tokenOverride);
}

export async function likeProfile(userId: string, tokenOverride?: string): Promise<LikeProfileResponse> {
  return authenticatedFetch(`/matches/like/${encodeURIComponent(userId)}`, {
    method: 'POST',
  }, tokenOverride);
}
