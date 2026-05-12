import { User } from './user'

export interface LoginPayload {
    email: string
    username: string
    password: string
}

export interface LoginResponse {
    access_token: string
    refresh_token: string
    user: User
}

export interface RegisterPayload {
    email: string
    username: string
    password: string
}

export interface RegisterResponse {
    email: string
    message?: string
}

export interface VerifyEmailPayload {
    token: string
}

export interface VerifyEmailResponse {
    success?: boolean
    message?: string
}

export interface ResendVerificationPayload {
    email: string
}

export type AuthErrorCode =
    | 'email_not_verified'
    | 'invalid_credentials'
    | 'invalid_token'
    | 'token_expired'
    | 'already_verified'
    | 'already_exists'
    | 'validation'
    | 'not_found'
    | 'network'
    | 'unknown'

export interface AuthError {
    code: AuthErrorCode
    message: string
    status?: number
}

export type AuthResult<T = void> =
    | { ok: true; data: T }
    | { ok: false; error: AuthError }
