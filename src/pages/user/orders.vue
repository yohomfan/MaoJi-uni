<template>
  <view class="orders-page">
    <!-- Tab Filter -->
    <view class="tabs-section">
      <u-tabs
        :list="orderTabs"
        :current="currentTab"
        @change="handleTabChange"
        active-color="#FF8A65"
      ></u-tabs>
    </view>

    <!-- Order List -->
    <view class="order-list">
      <view
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
      >
        <view class="order-header">
          <text class="order-type">{{ getOrderTypeText(order.type) }}</text>
          <view class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </view>
        </view>

        <view class="order-body">
          <view class="order-info">
            <text class="info-label">订单号</text>
            <text class="info-value">{{ order.outTradeNo }}</text>
          </view>
          <view class="order-info">
            <text class="info-label">支付时间</text>
            <text class="info-value">{{ formatDate(order.payTime) }}</text>
          </view>
          <view class="order-info">
            <text class="info-label">金额</text>
            <text class="info-value amount">¥{{ order.amount }}</text>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="filteredOrders.length === 0" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无订单</text>
        <text class="empty-desc">还没有相关订单记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getOrders } from '@/platform/data'

interface Order {
  id: string
  _openid: string
  type: 'vip' | 'other'
  amount: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  payTime?: number
  outTradeNo: string
  createTime: number
}

const currentTab = ref(0)
const orders = ref<Order[]>([])
const loading = ref(false)

const orderTabs = ref([
  { name: '全部' },
  { name: '已支付' },
  { name: '待支付' }
])

onMounted(async () => {
  await loadOrders()
})

async function loadOrders() {
  loading.value = true
  try {
    const result = await getOrders()
    if (result.success && result.data) {
      orders.value = result.data.sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  const tabName = orderTabs.value[currentTab.value].name

  if (tabName === '全部') {
    return orders.value
  } else if (tabName === '已支付') {
    return orders.value.filter(o => o.status === 'paid')
  } else if (tabName === '待支付') {
    return orders.value.filter(o => o.status === 'pending')
  }

  return orders.value
})

function handleTabChange(index: number) {
  currentTab.value = index
}

function getOrderTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    vip: 'VIP会员',
    other: '其他'
  }
  return typeMap[type] || type
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return statusMap[status] || status
}

function getStatusClass(status: string): string {
  return `status-${status}`
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.orders-page {
  min-height: 100vh;
  background: $bg-secondary;
}

.tabs-section {
  background: $bg-primary;
  margin-bottom: $spacing-sm;
}

.order-list {
  padding: $spacing-md;

  .order-card {
    background: $bg-primary;
    border-radius: $radius-md;
    margin-bottom: $spacing-md;
    overflow: hidden;
    box-shadow: $shadow-sm;

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-md;
      background: rgba(255, 138, 101, 0.05);
      border-bottom: 1rpx solid $border-color;

      .order-type {
        font-size: $font-md;
        font-weight: bold;
        color: $text-primary;
      }

      .order-status {
        font-size: $font-sm;
        padding: 4rpx 12rpx;
        border-radius: 20rpx;

        &.status-paid {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.status-pending {
          background: #fff3e0;
          color: #ef6c00;
        }

        &.status-cancelled {
          background: #f5f5f5;
          color: #757575;
        }

        &.status-refunded {
          background: #ffebee;
          color: #c62828;
        }
      }
    }

    .order-body {
      padding: $spacing-md;

      .order-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-sm;

        &:last-child {
          margin-bottom: 0;
        }

        .info-label {
          font-size: $font-sm;
          color: $text-secondary;
        }

        .info-value {
          font-size: $font-sm;
          color: $text-primary;

          &.amount {
            font-size: $font-lg;
            font-weight: bold;
            color: #FF8A65;
          }
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
    margin-bottom: $spacing-xs;
  }

  .empty-desc {
    font-size: $font-sm;
    color: $text-placeholder;
  }
}
</style>
