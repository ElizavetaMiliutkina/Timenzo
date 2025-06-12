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
