<template>
  <div class="container">
    <el-card class="assessment-card" :body-style="{ padding: '30px' }">
      <template #header>
        <div class="header-content">
          <h1>查理芒格25人类误判倾向评估</h1>
          <p class="author">b站 teihaku</p>
          <p class="subtitle">专业的认知偏差测评工具</p>
          <div class="user-actions">
            <template v-if="!authStore.isAuthenticated">
              <el-button type="primary" @click="loginFormRef?.show()">登录</el-button>
            </template>
            <template v-else>
              <span class="welcome-text">欢迎，{{ authStore.user?.email }}</span>
              <el-button type="info" @click="authStore.logout">退出</el-button>
            </template>
          </div>
        </div>
      </template>

      <div class="instructions">
        <el-alert
          title="测评说明"
          type="info"
          description="请根据您的真实情况，评估自己在各种认知偏差上的倾向程度。本测评将帮助您更好地了解自己的决策模式。"
          :closable="false"
          show-icon
        />
        <div class="situation-input">
          <el-input
            v-model="situation"
            type="textarea"
            :rows="3"
            placeholder="请描述您当前需要做决定的事态（可选）"
            maxlength="500"
            show-word-limit
          />
        </div>
      </div>

      <el-form :model="form" label-position="top">
        <div v-for="(bias, index) in biases" :key="index" class="bias-item">
          <el-form-item :label="`${index + 1}. ${bias.name}`">
            <div class="bias-description">{{ bias.description }}</div>
            <el-radio-group v-model="form[index]" @change="updateProgress">
              <el-radio :label="0" class="custom-radio">无 (0分)</el-radio>
              <el-radio :label="1" class="custom-radio">轻 (1分)</el-radio>
              <el-radio :label="2" class="custom-radio">中 (2分)</el-radio>
              <el-radio :label="3" class="custom-radio">重 (3分)</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <el-divider content-position="center">评估完成</el-divider>

        <div class="result-section">
          <el-button type="primary" size="large" @click="calculateScore" :disabled="!isAllQuestionsAnswered">
            生成评估报告
          </el-button>
          <el-button v-if="showResult" type="success" size="large" @click="exportAsImage">
            导出评估结果
          </el-button>
          
          <div v-if="showResult" class="assessment-result">
            <div class="result-header">
              <i class="el-icon-data-analysis"></i>
              <h2>评估报告</h2>
            </div>
            <el-card class="score-card" :class="resultLevel.class">
              <div class="score-content">
                <div class="score-circle">
                  <span class="total-score">{{ totalScore }}</span>
                  <span class="score-label">总分</span>
                </div>
                <div class="result-content">
                  <p class="situation-description" v-if="situation">
                    <strong>决策事项：</strong>{{ situation }}
                  </p>
                  <p class="result-description">
                    {{ resultLevel.description }}
                  </p>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from './store/auth'
import LoginForm from './components/LoginForm.vue'
import html2canvas from 'html2canvas'

const authStore = useAuthStore()
const loginFormRef = ref(null)
const situation = ref('')

const biases = [
  {
    name: '奖励与惩罚的超级倾向',
    description: '倾向于对奖励和惩罚产生强烈的反应和行为改变'
  },
  {
    name: '喜欢/热爱倾向',
    description: '倾向于偏爱自己喜欢或热爱的事物'
  },
  {
    name: '讨厌/憎恨倾向',
    description: '倾向于对讨厌或憎恨的事物产生负面反应'
  },
  {
    name: '避免怀疑倾向',
    description: '倾向于避免产生怀疑的情况'
  },
  {
    name: '避免不一致倾向',
    description: '倾向于保持行为的一致性'
  },
  {
    name: '好奇心倾向',
    description: '倾向于对新事物产生兴趣和探索欲望'
  },
  {
    name: '康德主义倾向',
    description: '倾向于遵循绝对的道德准则'
  },
  {
    name: '妒忌倾向',
    description: '倾向于对他人的成功或优势产生嫉妒情绪'
  },
  {
    name: '投桃报李倾向',
    description: '倾向于以善意回报他人的善意'
  },
  {
    name: '以牙还牙倾向',
    description: '倾向于以相同的方式回应他人的行为'
  },
  {
    name: '简单联想倾向',
    description: '倾向于建立简单的因果关联'
  },
  {
    name: '否认现实倾向',
    description: '倾向于否认愿接受的现实'
  },
  {
    name: '过度自我评价倾向',
    description: '倾向于高估自己的能力和判断'
  },
  {
    name: '过度乐观倾向',
    description: '倾向于对未来持过分乐观的态度'
  },
  {
    name: '损失厌恶倾向',
    description: '倾向于对损失的厌恶程度大于对等量收益的喜爱程度'
  },
  {
    name: '社会认同倾向',
    description: '倾向于追随群体的行为和观点'
  },
  {
    name: '对比错误倾向',
    description: '倾向于通过对比来做出判断'
  },
  {
    name: '压力影响倾向',
    description: '倾向于在压力下改变决策'
  },
  {
    name: '易得性偏差',
    description: '倾向于依赖容易获得的信息'
  },
  {
    name: '不用就忘倾向',
    description: '倾向于遗忘不常使用的知识和技能'
  },
  {
    name: '化学依赖倾向',
    description: '倾向于依赖化学物质来改变情绪或状态'
  },
  {
    name: '衰老衰退倾向',
    description: '倾向于随年龄增长而减退能力'
  },
  {
    name: '权威误导倾向',
    description: '倾向于过度信任权威人士的观点和建议'
  },
  {
    name: '废话倾向',
    description: '倾向于说或写一些无意义、重复或不必要的话'
  },
  {
    name: 'Lollapalooza倾向',
    description: '多种倾向共同作用产生的极端效应'
  }
]

const form = ref(Array(25).fill(null))
const showResult = ref(false)
const totalScore = ref(0)

const isAllQuestionsAnswered = computed(() => {
  return form.value.every(value => value !== null)
})

const updateProgress = () => {
  // 保留函数以维持radio group的change事件
}

const resultLevel = computed(() => {
  if (totalScore.value <= 25) {
    return {
      description: '受误判影响较轻，可以继续进行决策。',
      class: 'result-light'
    }
  } else if (totalScore.value <= 50) {
    return {
      description: '中度受误判影响，建议谨慎决策，可以寻求他人建议。',
      class: 'result-medium'
    }
  } else {
    return {
      description: '重度受情绪误判影响，不建议此时做出重要决策。',
      class: 'result-heavy'
    }
  }
})

const calculateScore = () => {
  totalScore.value = form.value.reduce((sum, score) => sum + score, 0)
  showResult.value = true

  if (authStore.isAuthenticated) {
    // 保存评估记录
    authStore.saveAssessment({
      situation: situation.value,
      scores: form.value,
      totalScore: totalScore.value,
      resultLevel: resultLevel.value
    })
  }
}

const exportAsImage = async () => {
  const element = document.querySelector('.assessment-card')
  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      const link = document.createElement('a')
      link.download = '认知偏差评估结果.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('导出图片失败:', error)
    }
  }
}
</script>

<LoginForm ref="loginFormRef" />

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.assessment-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header-content {
  text-align: center;
  padding: 20px 0;
}

.header-content h1 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
}

.subtitle {
  margin: 10px 0 0;
  color: #5e6d82;
  font-size: 16px;
}

.author {
  margin: 5px 0 0;
  color: #909399;
  font-size: 14px;
}

.user-actions {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
}

.welcome-text {
  color: #409EFF;
  margin-right: 10px;
}

.instructions {
  margin-bottom: 30px;
}

.bias-item {
  margin-bottom: 35px;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.bias-item:hover {
  transform: translateY(-2px);
}

.bias-description {
  color: #5e6d82;
  margin: 12px 0;
  line-height: 1.6;
  font-size: 15px;
}

.custom-radio {
  margin-right: 20px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
  display: inline-block;
  border: 1px solid #dcdfe6;
  margin-bottom: 10px;
  min-width: 100px;
  text-align: center;
}

.custom-radio:hover {
  background-color: #f5f7fa;
  border-color: #409EFF;
}

.el-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.result-section {
  text-align: center;
  margin-top: 40px;
}

.assessment-result {
  margin-top: 30px;
}

.result-header {
  text-align: center;
  margin-bottom: 20px;
}

.result-header h2 {
  margin: 10px 0;
  color: #2c3e50;
}

.score-card {
  padding: 30px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.score-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.total-score {
  font-size: 36px;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.result-description {
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  padding: 0 20px;
}

.result-light {
  background-color: rgba(103, 194, 58, 0.1);
}

.result-medium {
  background-color: rgba(230, 162, 60, 0.1);
}

.result-heavy {
  background-color: rgba(245, 108, 108, 0.1);
}
.situation-input {
  margin-top: 20px;
}

.situation-description {
  text-align: left;
  margin-bottom: 10px;
  font-size: 16px;
  color: #606266;
}

.result-content {
  flex: 1;
  text-align: left;
  padding: 0 20px;
}
</style>