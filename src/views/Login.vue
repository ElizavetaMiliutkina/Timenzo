<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="Введите email"
          autocomplete="username"
        >
      </div>

      <div class="form-group">
        <label for="password">Пароль:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          placeholder="Введите пароль"
          autocomplete="current-password"
        >
      </div>

      <button type="submit">
        Войти
      </button>

      <a href="/register">Создать аккаунт</a>
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
import { ref } from 'vue'
import { loginUser } from "@/services/auth";

const email = ref('')
const password = ref('')
const username = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Пожалуйста, заполните все поля'
    return
  }
  username.value = email.value.slice(0, email.value.indexOf('@'));

  try {
    let payload = {
      email: email.value,
      username: username.value,
      password: password.value
    }
    await loginUser(payload)
  } catch (error) {
    console.log(error)
  }
}
</script>

<style scoped>
.login-container {
  max-width: 320px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
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
