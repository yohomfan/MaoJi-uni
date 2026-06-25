<template>
  <view class="knowledge-page">
    <!-- Search Bar -->
    <view class="search-section">
      <u-search
        v-model="searchKeyword"
        placeholder="搜索健康知识"
        @search="handleSearch"
        @clear="handleClear"
        :show-action="false"
      ></u-search>
    </view>

    <!-- Category Tabs -->
    <view class="category-tabs">
      <u-tabs
        :list="categoryTabs"
        :current="currentCategory"
        @change="handleCategoryChange"
        :scrollable="true"
        active-color="#FF8A65"
      ></u-tabs>
    </view>

    <!-- Article List -->
    <view class="article-list">
      <view
        v-for="article in filteredArticles"
        :key="article.id"
        class="article-card"
        @click="goToDetail(article.id)"
      >
        <view class="article-header">
          <text class="article-title">{{ article.title }}</text>
          <view class="article-category">{{ article.category }}</view>
        </view>
        <text class="article-summary">{{ article.summary }}</text>
        <view class="article-footer">
          <text class="article-date">{{ formatDate(article.createTime) }}</text>
          <u-icon name="arrow-right" size="14" color="#999"></u-icon>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="filteredArticles.length === 0" class="empty-state">
        <text class="empty-icon">📚</text>
        <text class="empty-text">{{ searchKeyword ? '没有找到相关内容' : '暂无内容' }}</text>
        <text class="empty-desc">{{ searchKeyword ? '试试其他关键词' : '敬请期待更多文章' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const searchKeyword = ref('')
const currentCategory = ref(0)

const categoryTabs = ref([
  { name: '全部' },
  { name: '疫苗' },
  { name: '驱虫' },
  { name: '常见病' },
  { name: '营养' },
  { name: '急救' }
])

const articles = ref<KnowledgeArticle[]>([])

onMounted(() => {
  // Load articles from static data
  articles.value = (knowledgeData as KnowledgeArticle[])
    .filter(a => a.enabled)
    .sort((a, b) => a.sort - b.sort)
})

const filteredArticles = computed(() => {
  let result = articles.value

  // Filter by category
  const selectedCategory = categoryTabs.value[currentCategory.value].name
  if (selectedCategory !== '全部') {
    result = result.filter(a => a.category === selectedCategory)
  }

  // Filter by search keyword
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(keyword) ||
      a.summary.toLowerCase().includes(keyword) ||
      a.content.toLowerCase().includes(keyword)
    )
  }

  return result
})

function handleCategoryChange(index: number) {
  currentCategory.value = index
}

function handleSearch() {
  // Search is reactive through computed
  console.log('Searching for:', searchKeyword.value)
}

function handleClear() {
  searchKeyword.value = ''
}

function goToDetail(id: string) {
  uni.navigateTo({
    url: `/pages/knowledge/detail?id=${id}`
  })
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.knowledge-page {
  min-height: 100vh;
  background: $bg-secondary;
}

.search-section {
  padding: $spacing-md;
  background: $bg-primary;
}

.category-tabs {
  background: $bg-primary;
  margin-bottom: $spacing-sm;
}

.article-list {
  padding: $spacing-sm $spacing-md;

  .article-card {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-sm;

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: $spacing-sm;

      .article-title {
        flex: 1;
        font-size: $font-lg;
        font-weight: bold;
        color: $text-primary;
        margin-right: $spacing-sm;
      }

      .article-category {
        flex-shrink: 0;
        font-size: $font-xs;
        color: #FF8A65;
        background: rgba(255, 138, 101, 0.1);
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
      }
    }

    .article-summary {
      font-size: $font-sm;
      color: $text-secondary;
      line-height: 1.6;
      margin-bottom: $spacing-sm;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .article-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .article-date {
        font-size: $font-xs;
        color: $text-placeholder;
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
    margin-bottom: $spacing-xs;
  }

  .empty-desc {
    font-size: $font-sm;
    color: $text-placeholder;
  }
}
</style>
