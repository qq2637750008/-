import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const assessmentRecords = ref([])

  const handleGitHubCallback = async (code) => {
    try {
      // 这里需要调用后端API来交换访问令牌并获取用户信息
      // 目前使用模拟数据
      const mockGitHubUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: 'github_user@example.com',
        username: 'GitHub User'
      }

      user.value = mockGitHubUser
      isAuthenticated.value = true
      return true
    } catch (error) {
      console.error('GitHub authentication failed:', error)
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
    handleGitHubCallback,
    logout,
    saveAssessment,
    getAssessments
  }
})