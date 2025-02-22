<template>
  <el-dialog
    v-model="visible"
    title="用户登录"
    width="400px"
    :close-on-click-modal="false"
  >
    <div class="login-content">
      <el-button
        type="primary"
        class="github-login-btn"
        @click="handleGitHubLogin"
        :loading="loading"
      >
        <i class="fab fa-github"></i>
        使用GitHub账号登录
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useAuthStore } from '../store/auth'
import { ElMessage } from 'element-plus'
import { githubConfig } from '../config/github'

const emit = defineEmits(['login-success'])
const authStore = useAuthStore()

const visible = ref(false)
const loading = ref(false)

const handleGitHubLogin = () => {
  loading.value = true
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubConfig.clientId}&redirect_uri=${encodeURIComponent(githubConfig.redirectUri)}&scope=${githubConfig.scope}`
  window.location.href = authUrl
}

const show = () => {
  visible.value = true
}

defineExpose({
  show
})
</script>

<style scoped>
.login-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.github-login-btn {
  width: 100%;
  max-width: 300px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.github-login-btn i {
  font-size: 20px;
}
</style>