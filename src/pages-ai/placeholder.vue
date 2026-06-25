<template>
  <view class="placeholder-page">
    <view class="placeholder-content">
      <image src="/static/images/ai-coming-soon.png" class="illustration" mode="aspectFit" />
      <text class="title">AI 写真正在路上</text>
      <text class="desc">先把毛孩子的健康管起来吧</text>
      <text class="hint">敬请期待 V2.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
// AI features are deferred to V2.0
// This is a placeholder page to maintain the 4-tab navigation
</script>

<style lang="scss" scoped>
.placeholder-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFECD2 0%, #FCB69F 100%);
  padding: $spacing-xl;
}

.placeholder-content {
  text-align: center;

  .illustration {
    width: 400rpx;
    height: 400rpx;
    margin-bottom: $spacing-xl;
  }

  .title {
    display: block;
    font-size: $font-xxl;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  .desc {
    display: block;
    font-size: $font-lg;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }

  .hint {
    display: block;
    font-size: $font-sm;
    color: $text-placeholder;
    margin-top: $spacing-xl;
  }
}
</style>
