<template>
  <el-dialog
    v-model="visible"
    title="用户登录"
    width="400px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="login-form"
    >
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          type="email"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleLogin" :loading="loading">
          登录
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useAuthStore } from '../store/auth'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['login-success'])
const authStore = useAuthStore()

const visible = ref(false)
const loading = ref(false)
const formRef = ref(null)

const form = ref({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await authStore.login(form.value.email, form.value.password)
        if (success) {
          ElMessage.success('登录成功')
          visible.value = false
          emit('login-success')
        } else {
          ElMessage.error('登录失败，请检查邮箱和密码')
        }
      } catch (error) {
        ElMessage.error('登录过程中发生错误')
      } finally {
        loading.value = false
      }
    }
  })
}

const show = () => {
  visible.value = true
  form.value = {
    email: '',
    password: ''
  }
}

defineExpose({
  show
})
</script>

<style scoped>
.login-form {
  margin: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>