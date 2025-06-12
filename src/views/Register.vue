<template>
  <div class="register-container">
    <h2>Регистрация</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">Email:</label>
        <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Введите email"
            autocomplete="username"
        />
      </div>

      <div class="form-group">
        <label for="password">Пароль:</label>
        <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Введите пароль"
            autocomplete="new-password"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Подтверждение пароля:</label>
        <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Подтвердите пароль"
            autocomplete="new-password"
        />
      </div>
      <q-toggle v-model="" label="I accept the license and terms"></q-toggle>
      <button type="submit">Зарегистрироваться</button>
      <a href="/login" >Уже есть аккаунт Timenzo? Войти</a>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '@/services/auth'

const email = ref('')
const password = ref('')
const username = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const router = useRouter()

async function handleRegister() {
  error.value = ''
  success.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают'
    return
  }

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
    const response = await registerUser(payload)
    if(response){
      success.value = 'Регистрация прошла успешно! Перенаправляем на вход...'
      router.push('/')
    }
  } catch (error) {
    console.log(error)
  }

  // setTimeout(() => {
  //   router.push('/login')
  // }, 1500)
}
</script>

<style scoped>
.register-container {
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
