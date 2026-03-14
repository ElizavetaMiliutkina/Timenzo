<template>
  <div class="register-container">
    <h2 class="text-center">
      Registration form
    </h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="Enter email"
          autocomplete="username"
          :class="{ 'input-error': errors.email }"
          @blur="validateEmail"
          @input="errors.email = ''"
        >
        <span
          v-if="errors.email"
          class="field-error"
        >{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter password"
          autocomplete="new-password"
          :class="{ 'input-error': errors.password }"
          @blur="validatePassword"
          @input="errors.password = ''; confirmPassword && validateConfirmPassword()"
        >
        <span
          v-if="errors.password"
          class="field-error"
        >{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm password:</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="Enter password"
          autocomplete="new-password"
          :class="{ 'input-error': errors.confirmPassword }"
          @blur="validateConfirmPassword"
          @input="errors.confirmPassword = ''"
        >
        <span
          v-if="errors.confirmPassword"
          class="field-error"
        >{{ errors.confirmPassword }}</span>
      </div>
      <button type="submit">
        Register
      </button>
      <a href="/login">You already have Timenzo account? Login</a>
    </form>

    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>
    <p
      v-if="success"
      class="success"
    >
      {{ success }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '@/services/auth'

const email = ref('')
const password = ref('')
const username = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const router = useRouter()

const errors = reactive<{ email: string; password: string; confirmPassword: string }>({
  email: '',
  password: '',
  confirmPassword: ''
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(): boolean {
  const value = email.value.trim()
  if (!value) {
    errors.email = 'Email is required'
    return false
  }
  if (!emailRegex.test(value)) {
    errors.email = 'Enter a valid email address'
    return false
  }
  errors.email = ''
  return true
}

function validatePassword(): boolean {
  if (!password.value) {
    errors.password = 'Password is required'
    return false
  }
  if (password.value.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return false
  }
  errors.password = ''
  return true
}

function validateConfirmPassword(): boolean {
  if (!confirmPassword.value) {
    errors.confirmPassword = 'Please confirm your password'
    return false
  }
  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }
  errors.confirmPassword = ''
  return true
}

function validateForm(): boolean {
  const emailValid = validateEmail()
  const passwordValid = validatePassword()
  const confirmValid = validateConfirmPassword()
  return emailValid && passwordValid && confirmValid
}

async function handleRegister() {
  error.value = ''
  success.value = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!validateForm()) {
    return
  }

  username.value = email.value.slice(0, email.value.indexOf('@'))

  try {
    const payload = {
      email: email.value,
      username: username.value,
      password: password.value
    }
    const response = await registerUser(payload)
    if (response) {
      success.value = 'Регистрация прошла успешно! Перенаправляем на вход...'
      router.push('/')
    }
  } catch (err) {
    console.log(err)
  }
}
</script>

<style scoped>
.register-container {
  max-width: 320px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

input.input-error {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
}

input.input-error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.field-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #dc3545;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}

.error {
  margin-top: 10px;
  color: red;
  font-weight: 600;
}

.success {
  margin-top: 10px;
  color: green;
  font-weight: 600;
}
</style>
