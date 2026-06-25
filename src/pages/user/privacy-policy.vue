<template>
  <view class="policy-page">
    <view class="content">
      <text class="title">隐私政策</text>

      <view class="intro">
        <text class="intro-text">
          毛叽（以下简称"我们"）深知个人信息对您的重要性，我们将按照法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全可控。
        </text>
      </view>

      <view class="section">
        <text class="section-title">一、我们如何收集和使用您的个人信息</text>
        <text class="section-text">
          1. 账号信息：当您使用微信登录时，我们会收集您的微信昵称和头像，用于识别您的身份。
        </text>
        <text class="section-text">
          2. 宠物信息：您主动提供的宠物档案信息，包括宠物名称、品种、年龄等，用于提供健康管理服务。
        </text>
        <text class="section-text">
          3. 健康记录：您添加的疫苗、驱虫、体检等记录，用于健康提醒和数据统计。
        </text>
        <text class="section-text">
          4. 设备信息：我们可能收集设备型号、操作系统版本等信息，用于优化应用性能。
        </text>
      </view>

      <view class="section">
        <text class="section-title">二、我们如何存储您的个人信息</text>
        <text class="section-text">
          您的个人信息将存储在中国境内的服务器上。我们采用行业标准的安全技术措施保护您的信息安全。
        </text>
      </view>

      <view class="section">
        <text class="section-title">三、我们如何共享、转让、公开披露您的个人信息</text>
        <text class="section-text">
          我们不会向第三方共享、转让或公开披露您的个人信息，除非：
        </text>
        <text class="section-text">
          1. 获得您的明确同意；
        </text>
        <text class="section-text">
          2. 法律法规规定的情形。
        </text>
      </view>

      <view class="section">
        <text class="section-title">四、您的权利</text>
        <text class="section-text">
          您有权访问、更正、删除您的个人信息，以及撤回授权同意。您可以通过应用内设置进行操作。
        </text>
      </view>

      <view class="section">
        <text class="section-title">五、未成年人保护</text>
        <text class="section-text">
          我们重视未成年人的个人信息保护。如您为未成年人，请在监护人指导下使用本应用。
        </text>
      </view>

      <view class="section">
        <text class="section-title">六、隐私政策的更新</text>
        <text class="section-text">
          我们可能会不时更新本隐私政策。更新后的政策将在应用内公布，并在公布后生效。
        </text>
      </view>

      <view class="section">
        <text class="section-title">七、如何联系我们</text>
        <text class="section-text">
          如您对本隐私政策有任何疑问、意见或建议，请通过应用内客服功能联系我们，我们将在15个工作日内回复您的请求。
        </text>
      </view>

      <view class="footer">
        <text class="footer-text">生效日期：2024年1月1日</text>
        <text class="footer-text">最后更新：2024年1月1日</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// Privacy Policy Page
</script>

<style lang="scss" scoped>
.policy-page {
  min-height: 100vh;
  background: $bg-primary;
  padding: $spacing-md;
}

.content {
  .title {
    display: block;
    font-size: $font-xxl;
    font-weight: bold;
    color: $text-primary;
    text-align: center;
    margin-bottom: $spacing-lg;
  }

  .intro {
    background: #FFF9E6;
    border-left: 4rpx solid $primary-color;
    padding: $spacing-md;
    margin-bottom: $spacing-lg;
    border-radius: $radius-sm;

    .intro-text {
      display: block;
      font-size: $font-md;
      line-height: 1.8;
      color: $text-secondary;
    }
  }

  .section {
    margin-bottom: $spacing-lg;

    .section-title {
      display: block;
      font-size: $font-lg;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: $spacing-md;
    }

    .section-text {
      display: block;
      font-size: $font-md;
      line-height: 1.8;
      color: $text-secondary;
      margin-bottom: $spacing-sm;
      padding-left: 20rpx;
    }
  }

  .footer {
    margin-top: $spacing-xl;
    padding-top: $spacing-lg;
    border-top: 1rpx solid $border-color;
    text-align: center;

    .footer-text {
      display: block;
      font-size: $font-sm;
      color: $text-placeholder;
      margin-bottom: $spacing-xs;
    }
  }
}
</style>
