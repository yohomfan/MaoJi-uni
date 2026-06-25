<template>
  <view class="agreement-page">
    <view class="content">
      <text class="title">用户协议</text>

      <view class="section">
        <text class="section-title">1. 服务条款的确认和接纳</text>
        <text class="section-text">
          毛叽（以下简称"本应用"）的所有权和运营权归开发者所有。用户在使用本应用服务前，应当认真阅读并遵守本协议的全部内容。
        </text>
      </view>

      <view class="section">
        <text class="section-title">2. 服务说明</text>
        <text class="section-text">
          本应用为用户提供宠物健康管理服务，包括但不限于宠物档案管理、健康记录、疫苗提醒、驱虫提醒等功能。
        </text>
      </view>

      <view class="section">
        <text class="section-title">3. 用户账号</text>
        <text class="section-text">
          用户使用本应用服务需要通过微信登录。用户应当妥善保管自己的账号信息，不得转让或授权他人使用。
        </text>
      </view>

      <view class="section">
        <text class="section-title">4. 用户行为规范</text>
        <text class="section-text">
          用户在使用本应用时，应当遵守中华人民共和国相关法律法规，不得利用本应用从事违法违规活动。
        </text>
      </view>

      <view class="section">
        <text class="section-title">5. 知识产权</text>
        <text class="section-text">
          本应用的全部内容，包括但不限于文字、图片、软件、程序等，均受著作权法、商标法和其他法律法规的保护。
        </text>
      </view>

      <view class="section">
        <text class="section-title">6. 免责声明</text>
        <text class="section-text">
          本应用提供的健康知识仅供参考，不能替代专业兽医的诊断和建议。如宠物出现健康问题，请及时就医。
        </text>
      </view>

      <view class="section">
        <text class="section-title">7. 协议修改</text>
        <text class="section-text">
          本应用有权根据需要不时修改本协议。修改后的协议一经公布即生效，不再另行通知用户。
        </text>
      </view>

      <view class="section">
        <text class="section-title">8. 联系我们</text>
        <text class="section-text">
          如您对本协议有任何疑问，请通过应用内客服功能联系我们。
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
// User Agreement Page
</script>

<style lang="scss" scoped>
.agreement-page {
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
    margin-bottom: $spacing-xl;
  }

  .section {
    margin-bottom: $spacing-lg;

    .section-title {
      display: block;
      font-size: $font-lg;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: $spacing-sm;
    }

    .section-text {
      display: block;
      font-size: $font-md;
      line-height: 1.8;
      color: $text-secondary;
      text-indent: 2em;
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
