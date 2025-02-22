import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const assessmentRecords = ref([])

  const login = async (email, password) => {
    try {
      // 这里将来需要连接后端API进行实际的用户验证
      // 目前使用模拟数据
      if (email && password) {
        user.value = {
          email,
          id: Math.random().toString(36).substr(2, 9)
        }
        isAuthenticated.value = true
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    assessmentRecords.value = []
  }

  const saveAssessment = (assessment) => {
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...assessment
    }
    assessmentRecords.value.push(record)
    // 这里将来需要连接后端API保存数据
    return record
  }

  const getAssessments = () => {
    return assessmentRecords.value
  }

  return {
    user,
    isAuthenticated,
    assessmentRecords,
    login,
    logout,
    saveAssessment,
    getAssessments
  }
})