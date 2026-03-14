<template>
  <div class="login-container">
    <h2 class="text-center">
      Login
    </h2>
    <form @submit.prevent="handleLogin">
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
          autocomplete="current-password"
          :class="{ 'input-error': errors.password }"
          @blur="validatePassword"
          @input="errors.password = ''"
        >
        <span
          v-if="errors.password"
          class="field-error"
        >{{ errors.password }}</span>
      </div>

      <button type="submit">
        Login
      </button>

      <a href="/register">Create account</a>
    </form>

    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { loginUser } from "@/services/auth";

const email = ref('')
const password = ref('')
const username = ref('')
const error = ref('')
const errors = reactive<{ email: string; password: string }>({
  email: '',
  password: ''
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

function validateForm(): boolean {
  const emailValid = validateEmail()
  const passwordValid = validatePassword()
  return emailValid && passwordValid
}

async function handleLogin() {
  error.value = ''
  errors.email = ''
  errors.password = ''

  if (!validateForm()) {
    return
  }

  username.value = email.value.slice(0, email.value.indexOf('@'));

  try {
    const payload = {
      email: email.value,
      username: username.value,
      password: password.value
    }
    await loginUser(payload)
  } catch (err) {
    console.log(err)
  }
}
</script>

<style scoped>
.login-container {
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
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
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
  background-color: #007bff;
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.error {
  margin-top: 10px;
  color: red;
  font-weight: 600;
}
</style>
