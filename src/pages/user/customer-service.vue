<template>
  <view class="service-page">
    <!-- Contact Section -->
    <view class="contact-section">
      <view class="section-header">
        <text class="section-title">联系我们</text>
      </view>

      <view class="contact-card">
        <view class="qr-placeholder">
          <text class="qr-icon">📱</text>
          <text class="qr-text">企业微信客服二维码</text>
          <text class="qr-desc">扫码添加客服微信</text>
        </view>

        <view class="contact-info">
          <view class="info-item">
            <u-icon name="clock" size="18" color="#FF8A65"></u-icon>
            <text class="info-text">服务时间：9:00 - 21:00</text>
          </view>
          <view class="info-item">
            <u-icon name="email" size="18" color="#FF8A65"></u-icon>
            <text class="info-text">邮箱：support@maoji.pet</text>
          </view>
        </view>
      </view>
    </view>

    <!-- FAQ Section -->
    <view class="faq-section">
      <view class="section-header">
        <text class="section-title">常见问题</text>
      </view>

      <!-- Search -->
      <view class="faq-search">
        <u-search
          v-model="searchKeyword"
          placeholder="搜索问题"
          @search="handleSearch"
          :show-action="false"
        ></u-search>
      </view>

      <!-- FAQ List -->
      <view class="faq-list">
        <view
          v-for="(faq, index) in filteredFaqs"
          :key="index"
          class="faq-item"
        >
          <view class="faq-question" @click="toggleFaq(index)">
            <text class="question-text">{{ faq.question }}</text>
            <u-icon
              :name="expandedFaqs.includes(index) ? 'arrow-up' : 'arrow-down'"
              size="16"
              color="#999"
            ></u-icon>
          </view>
          <view v-if="expandedFaqs.includes(index)" class="faq-answer">
            <text class="answer-text">{{ faq.answer }}</text>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="filteredFaqs.length === 0" class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">没有找到相关问题</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface FAQ {
  question: string
  answer: string
  category: string
}

const searchKeyword = ref('')
const expandedFaqs = ref<number[]>([])

const faqs = ref<FAQ[]>([
  {
    category: '账户相关',
    question: '如何注册账号？',
    answer: '打开小程序后，系统会自动使用您的微信账号登录，无需额外注册。'
  },
  {
    category: '账户相关',
    question: '如何切换账号？',
    answer: '目前小程序与微信账号绑定，如需切换请使用不同的微信账号登录小程序。'
  },
  {
    category: '宠物档案',
    question: '可以添加几只宠物？',
    answer: '普通用户可以添加最多3只宠物，VIP会员可以添加最多10只宠物。'
  },
  {
    category: '宠物档案',
    question: '如何删除宠物档案？',
    answer: '进入宠物详情页，点击右上角编辑，在编辑页面底部有删除按钮。删除后的数据可以保留30天，期间可以联系客服恢复。'
  },
  {
    category: '宠物档案',
    question: '如何修改宠物信息？',
    answer: '在宠物档案列表或详情页点击编辑按钮，即可修改宠物的基本信息、照片等。'
  },
  {
    category: '健康管理',
    question: '疫苗提醒如何设置？',
    answer: '添加疫苗记录时，系统会自动根据疫苗类型计算下次接种时间，并在接种日期前7天、3天、1天发送提醒。'
  },
  {
    category: '健康管理',
    question: '如何关闭健康提醒？',
    answer: '在"我的"-"设置"-"消息通知"中可以管理各类提醒的开关。'
  },
  {
    category: '健康管理',
    question: '驱虫周期是多久？',
    answer: '体内驱虫建议每3个月一次，体外驱虫建议每月一次。具体周期可能因宠物情况和驱虫药品牌而异，请遵医嘱。'
  },
  {
    category: '健康管理',
    question: '体重记录如何添加？',
    answer: '进入"档案"-"成长记录"，点击添加按钮，输入体重数值、日期和备注即可。'
  },
  {
    category: '健康管理',
    question: '体检报告可以上传吗？',
    answer: '可以。在"健康"-"体检记录"中添加记录时，可以上传体检报告的照片或PDF文件。'
  },
  {
    category: 'VIP会员',
    question: 'VIP会员有什么特权？',
    answer: 'VIP会员享有：多时段健康提醒、专业体检报告解读、最多10个宠物档案位、独家知识库内容、优先客服支持等特权。'
  },
  {
    category: 'VIP会员',
    question: '会员如何开通？',
    answer: '进入"我的"-"VIP会员"，选择月度或年度套餐，点击立即开通并完成支付即可。'
  },
  {
    category: 'VIP会员',
    question: '会员可以退款吗？',
    answer: '会员开通后7天内，如未使用任何VIP特权，可以申请全额退款。超过7天或已使用特权则不支持退款。'
  },
  {
    category: 'VIP会员',
    question: '会员到期后会自动续费吗？',
    answer: '不会。我们不会自动续费，到期前会提醒您手动续费。'
  },
  {
    category: 'VIP会员',
    question: '会员可以转让吗？',
    answer: '会员权益与微信账号绑定，不支持转让。'
  },
  {
    category: '知识库',
    question: '知识库内容是否专业？',
    answer: '知识库内容由专业兽医团队审核和编写，确保科学性和实用性。但仅供参考，具体问题请咨询兽医。'
  },
  {
    category: '知识库',
    question: '可以收藏文章吗？',
    answer: '该功能即将上线，敬请期待。'
  },
  {
    category: '技术问题',
    question: '为什么无法上传图片？',
    answer: '请检查：1)是否授权了相册权限；2)图片大小是否超过10MB；3)网络连接是否正常。如问题持续请联系客服。'
  },
  {
    category: '技术问题',
    question: '数据会丢失吗？',
    answer: '所有数据都存储在云端，只要使用同一微信账号登录，数据就不会丢失。建议定期使用导出功能备份重要数据。'
  },
  {
    category: '技术问题',
    question: '小程序闪退怎么办？',
    answer: '请尝试：1)重启小程序；2)清理微信缓存；3)更新微信到最新版本。如问题持续请联系客服并提供错误截图。'
  },
  {
    category: '技术问题',
    question: '为什么提醒没有收到？',
    answer: '请检查：1)是否授权了订阅消息；2)是否在设置中关闭了提醒；3)微信通知权限是否开启。'
  },
  {
    category: '隐私安全',
    question: '我的数据安全吗？',
    answer: '我们严格遵守隐私协议，数据加密存储，不会向第三方泄露您的个人信息和宠物数据。'
  },
  {
    category: '隐私安全',
    question: '如何注销账号？',
    answer: '如需注销账号，请联系客服。注销后所有数据将被永久删除且无法恢复。'
  },
  {
    category: '隐私安全',
    question: '可以导出我的数据吗？',
    answer: '该功能即将上线，届时您可以导出所有宠物档案和健康记录。'
  },
  {
    category: '其他',
    question: '有iOS/Android独立App吗？',
    answer: '目前仅提供微信小程序版本。独立App在规划中，敬请期待。'
  },
  {
    category: '其他',
    question: '可以推荐给朋友吗？',
    answer: '当然！在"我的"页面有分享按钮，欢迎推荐给有宠物的朋友。'
  },
  {
    category: '其他',
    question: '如何提供反馈和建议？',
    answer: '您可以通过客服微信、邮箱或在小程序内的反馈入口提交您的宝贵意见。'
  },
  {
    category: '其他',
    question: '有商家入驻功能吗？',
    answer: '商家入驻功能正在开发中，包括宠物医院、美容店等。如您是商家且有兴趣，请联系我们。'
  },
  {
    category: '其他',
    question: '支持哪些宠物类型？',
    answer: '目前主要支持猫和狗，其他小型宠物（如兔子、仓鼠）的功能正在完善中。'
  },
  {
    category: '其他',
    question: 'AI写真功能在哪里？',
    answer: 'AI写真功能正在开发中，将在后续版本推出，敬请期待。'
  }
])

const filteredFaqs = computed(() => {
  if (!searchKeyword.value) {
    return faqs.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return faqs.value.filter(faq =>
    faq.question.toLowerCase().includes(keyword) ||
    faq.answer.toLowerCase().includes(keyword) ||
    faq.category.toLowerCase().includes(keyword)
  )
})

function handleSearch() {
  // Search is reactive through computed
}

function toggleFaq(index: number) {
  const idx = expandedFaqs.value.indexOf(index)
  if (idx > -1) {
    expandedFaqs.value.splice(idx, 1)
  } else {
    expandedFaqs.value.push(index)
  }
}
</script>

<style lang="scss" scoped>
.service-page {
  min-height: 100vh;
  background: $bg-secondary;
  padding-bottom: $spacing-lg;
}

.section-header {
  padding: $spacing-lg $spacing-md $spacing-md;

  .section-title {
    font-size: $font-xl;
    font-weight: bold;
    color: $text-primary;
  }
}

.contact-section {
  background: $bg-primary;
  margin-bottom: $spacing-md;

  .contact-card {
    padding: 0 $spacing-md $spacing-lg;

    .qr-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: $bg-secondary;
      border-radius: $radius-md;
      padding: 80rpx $spacing-md;
      margin-bottom: $spacing-md;

      .qr-icon {
        font-size: 96rpx;
        margin-bottom: $spacing-md;
      }

      .qr-text {
        font-size: $font-md;
        color: $text-primary;
        margin-bottom: $spacing-xs;
      }

      .qr-desc {
        font-size: $font-sm;
        color: $text-placeholder;
      }
    }

    .contact-info {
      .info-item {
        display: flex;
        align-items: center;
        padding: $spacing-sm 0;

        .info-text {
          margin-left: $spacing-sm;
          font-size: $font-sm;
          color: $text-secondary;
        }
      }
    }
  }
}

.faq-section {
  .faq-search {
    padding: 0 $spacing-md $spacing-md;
  }

  .faq-list {
    padding: 0 $spacing-md;

    .faq-item {
      background: $bg-primary;
      border-radius: $radius-md;
      margin-bottom: $spacing-sm;
      overflow: hidden;
      box-shadow: $shadow-sm;

      .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: $spacing-md;
        cursor: pointer;

        .question-text {
          flex: 1;
          font-size: $font-md;
          font-weight: bold;
          color: $text-primary;
          margin-right: $spacing-sm;
        }
      }

      .faq-answer {
        padding: 0 $spacing-md $spacing-md;
        border-top: 1rpx solid $border-color;
        padding-top: $spacing-md;

        .answer-text {
          font-size: $font-sm;
          color: $text-secondary;
          line-height: 1.6;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $spacing-md;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: $spacing-md;
  }

  .empty-text {
    font-size: $font-lg;
    color: $text-secondary;
  }
}
</style>
