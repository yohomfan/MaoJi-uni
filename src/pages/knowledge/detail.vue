<template>
  <view class="detail-page">
    <view v-if="article" class="article-content">
      <!-- Header -->
      <view class="article-header">
        <view class="category-badge">{{ article.category }}</view>
        <text class="article-title">{{ article.title }}</text>
        <text class="article-date">{{ formatDate(article.createTime) }}</text>
      </view>

      <!-- Content (Markdown rendered as rich-text) -->
      <view class="article-body">
        <rich-text :nodes="renderedContent"></rich-text>
      </view>
    </view>

    <!-- Loading or Not Found -->
    <view v-else class="empty-state">
      <text class="empty-icon">📄</text>
      <text class="empty-text">文章不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import knowledgeData from '@/static/knowledge-articles.json'

interface KnowledgeArticle {
  id: string
  title: string
  category: string
  cover: string
  summary: string
  content: string
  sort: number
  enabled: boolean
  createTime: number
}

const article = ref<KnowledgeArticle | null>(null)

onLoad((options: any) => {
  const id = options.id
  if (id) {
    article.value = (knowledgeData as KnowledgeArticle[]).find(a => a.id === id) || null
  }
})

// Simple markdown to HTML converter for basic formatting
const renderedContent = computed(() => {
  if (!article.value) return ''

  let html = article.value.content

  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Convert lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')

  // Wrap consecutive list items
  html = html.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>')

  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br/>')

  // Wrap in paragraphs
  html = '<p>' + html + '</p>'

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p><br\/><\/p>/g, '')

  // Style the output
  html = html.replace(/<h1>/g, '<h1 style="font-size: 48rpx; font-weight: bold; color: #333; margin: 32rpx 0 16rpx;">')
  html = html.replace(/<h2>/g, '<h2 style="font-size: 40rpx; font-weight: bold; color: #333; margin: 28rpx 0 14rpx;">')
  html = html.replace(/<h3>/g, '<h3 style="font-size: 36rpx; font-weight: bold; color: #666; margin: 24rpx 0 12rpx;">')
  html = html.replace(/<p>/g, '<p style="font-size: 28rpx; line-height: 1.8; color: #666; margin: 16rpx 0;">')
  html = html.replace(/<ul>/g, '<ul style="padding-left: 40rpx; margin: 16rpx 0;">')
  html = html.replace(/<li>/g, '<li style="font-size: 28rpx; line-height: 1.8; color: #666; margin: 8rpx 0;">')
  html = html.replace(/<strong>/g, '<strong style="font-weight: bold; color: #FF8A65;">')

  return html
})

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: $bg-secondary;
}

.article-content {
  background: $bg-primary;
  min-height: 100vh;

  .article-header {
    padding: $spacing-lg $spacing-md;
    border-bottom: 1rpx solid $border-color;

    .category-badge {
      display: inline-block;
      font-size: $font-xs;
      color: #FF8A65;
      background: rgba(255, 138, 101, 0.1);
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      margin-bottom: $spacing-md;
    }

    .article-title {
      display: block;
      font-size: $font-xxl;
      font-weight: bold;
      color: $text-primary;
      line-height: 1.4;
      margin-bottom: $spacing-sm;
    }

    .article-date {
      display: block;
      font-size: $font-sm;
      color: $text-placeholder;
    }
  }

  .article-body {
    padding: $spacing-md;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $spacing-md;

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
