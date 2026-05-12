<template>
  <div class="verify-container">
    <h2 class="text-center">
      Email verification
    </h2>

    <div
      v-if="status === 'loading'"
      class="status status-loading"
    >
      <div class="spinner" />
      <p>Подтверждаем ваш email...</p>
    </div>

    <div
      v-else-if="status === 'success'"
      class="status status-success"
    >
      <p class="status-title">
        Email подтверждён
      </p>
      <p class="status-text">
        Теперь вы можете войти в аккаунт.
      </p>
      <button
        type="button"
        class="primary-btn"
        @click="goToLogin"
      >
        Перейти ко входу
      </button>
    </div>

    <div
      v-else-if="status === 'already-verified'"
      class="status status-success"
    >
      <p class="status-title">
        Email уже был подтверждён
      </p>
      <button
        type="button"
        class="primary-btn"
        @click="goToLogin"
      >
        Перейти ко входу
      </button>
    </div>

    <div
      v-else-if="status === 'no-token'"
      class="status status-error"
    >
      <p class="status-title">
        Ссылка некорректна
      </p>
      <p class="status-text">
        Не передан токен подтверждения. Откройте ссылку из письма ещё раз.
      </p>
      <button
        type="button"
        class="primary-btn"
        @click="goToLogin"
      >
        Ко входу
      </button>
    </div>

    <div
      v-else-if="status === 'error'"
      class="status status-error"
    >
      <p class="status-title">
        Не удалось подтвердить email
      </p>
      <p class="status-text">
        {{ errorMessage }}
      </p>

      <div class="resend">
        <label for="resend-email">Прислать новое письмо:</label>
        <input
          id="resend-email"
          v-model="resendEmail"
          type="email"
          placeholder="email@example.com"
          autocomplete="email"
        >
        <button
          type="button"
          class="primary-btn"
          :disabled="resending || !resendEmail"
          @click="onResend"
        >
          {{ resending ? 'Отправляем...' : 'Отправить' }}
        </button>
        <p
          v-if="resendInfo"
          class="resend-info"
        >
          {{ resendInfo }}
        </p>
      </div>

      <button
        type="button"
        class="link-btn"
        @click="goToLogin"
      >
        Ко входу
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyEmail, resendVerificationEmail } from '@/services/auth'
import type { AuthError } from '@/types/auth'

type Status =
    | 'loading'
    | 'success'
    | 'already-verified'
    | 'no-token'
    | 'error'

const route = useRoute()
const router = useRouter()

const status = ref<Status>('loading')
const errorMessage = ref('')

const resendEmail = ref('')
const resending = ref(false)
const resendInfo = ref('')

function goToLogin() {
  router.push('/login')
}

async function onResend() {
  if (!resendEmail.value || resending.value) return
  resending.value = true
  resendInfo.value = ''
  const result = await resendVerificationEmail({ email: resendEmail.value })
  resending.value = false

  if (result.ok) {
    resendInfo.value = 'Письмо отправлено. Проверьте почту.'
  } else {
    resendInfo.value = mapError(result.error)
  }
}

function mapError(err: AuthError): string {
  switch (err.code) {
    case 'invalid_token':    return 'Ссылка некорректна.'
    case 'token_expired':    return 'Срок действия ссылки истёк. Запросите новое письмо.'
    case 'already_verified': return 'Email уже был подтверждён ранее.'
    case 'not_found':        return 'Пользователь не найден.'
    case 'network':          return 'Сервер недоступен. Попробуйте позже.'
    default:                 return err.message || 'Что-то пошло не так.'
  }
}

onMounted(async () => {
  const tokenRaw = route.query.token
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw

  if (!token) {
    status.value = 'no-token'
    return
  }

  const result = await verifyEmail({ token })
  if (result.ok) {
    status.value = 'success'
    return
  }

  if (result.error.code === 'already_verified') {
    status.value = 'already-verified'
    return
  }

  status.value = 'error'
  errorMessage.value = mapError(result.error)
})
</script>

<style scoped>
.verify-container {
  max-width: 360px;
  margin: 60px auto;
  padding: 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  text-align: center;
}

.status {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.status-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.status-text {
  margin: 0;
  font-size: 14px;
  color: #555;
}

.status-success .status-title { color: #1f7a3a; }
.status-error   .status-title { color: #b02a37; }

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #ddd;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.primary-btn {
  padding: 10px;
  background-color: #007bff;
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary-btn:hover { background-color: #0056b3; }
.primary-btn:disabled { background-color: #9bbde0; cursor: not-allowed; }

.link-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}

.resend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.resend label {
  font-weight: 600;
  font-size: 13px;
}

.resend input {
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.resend-info {
  margin: 0;
  font-size: 12px;
  color: #555;
}
</style>
