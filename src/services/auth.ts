import axios from '@/plugins/axios'
import router from '@/router/index'
import { useAuthStore } from '@/store/auth'
import type {
    AuthError,
    AuthErrorCode,
    AuthResult,
    LoginPayload,
    LoginResponse,
    RegisterPayload,
    RegisterResponse,
    ResendVerificationPayload,
    VerifyEmailPayload,
    VerifyEmailResponse,
} from '@/types/auth'

interface BackendErrorBody {
    detail?: string | { msg?: string; code?: string }
    message?: string
    code?: string
}

function toAuthError(err: unknown): AuthError {
    type AxiosLike = {
        response?: { status?: number; data?: BackendErrorBody }
        message?: string
    }
    const e = err as AxiosLike
    const status = e.response?.status
    const data = e.response?.data ?? {}
    const detail =
        typeof data.detail === 'string'
            ? data.detail
            : data.detail?.msg ?? data.message ?? e.message ?? 'Unknown error'
    const backendCode =
        typeof data.detail === 'object' ? data.detail?.code : data.code

    let code: AuthErrorCode = 'unknown'
    if (!status) code = 'network'
    else if (backendCode === 'email_not_verified' ||
        (status === 403 && /verif/i.test(detail))) code = 'email_not_verified'
    else if (backendCode === 'token_expired' ||
        (status === 400 && /expir/i.test(detail))) code = 'token_expired'
    else if (backendCode === 'invalid_token' ||
        (status === 400 && /token/i.test(detail))) code = 'invalid_token'
    else if (backendCode === 'already_verified' ||
        (status === 409 && /verif/i.test(detail))) code = 'already_verified'
    else if (status === 401) code = 'invalid_credentials'
    else if (status === 409) code = 'already_exists'
    else if (status === 404) code = 'not_found'
    else if (status === 400 || status === 422) code = 'validation'

    return { code, message: detail, status }
}

/**
 * Регистрация: создаём пользователя, но НЕ логинимся автоматически —
 * на бэке is_verified=false, логин будет блокирован 403'м.
 * Пользователь должен подтвердить email по ссылке из письма.
 */
export const registerUser = async (
    payload: RegisterPayload,
): Promise<AuthResult<RegisterResponse>> => {
    try {
        const { data } = await axios.post<RegisterResponse>('/register', payload)
        return { ok: true, data }
    } catch (err) {
        return { ok: false, error: toAuthError(err) }
    }
}

export const loginUser = async (
    payload: LoginPayload,
): Promise<AuthResult<LoginResponse>> => {
    const authStore = useAuthStore()
    try {
        const { data } = await axios.post<LoginResponse>('/login', payload)
        authStore.setTokens(data.access_token, data.refresh_token)
        authStore.setUser(data.user)
        await router.push('/home')
        return { ok: true, data }
    } catch (err) {
        return { ok: false, error: toAuthError(err) }
    }
}

export const verifyEmail = async (
    payload: VerifyEmailPayload,
): Promise<AuthResult<VerifyEmailResponse>> => {
    try {
        const { data } = await axios.post<VerifyEmailResponse>(
            '/auth/verify-email',
            payload,
        )
        return { ok: true, data }
    } catch (err) {
        return { ok: false, error: toAuthError(err) }
    }
}

export const resendVerificationEmail = async (
    payload: ResendVerificationPayload,
): Promise<AuthResult<{ message?: string }>> => {
    try {
        const { data } = await axios.post<{ message?: string }>(
            '/auth/resend-verification',
            payload,
        )
        return { ok: true, data }
    } catch (err) {
        return { ok: false, error: toAuthError(err) }
    }
}
