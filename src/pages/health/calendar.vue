<template>
  <view class="calendar-page">
    <!-- Today's Todos Card -->
    <view class="today-section">
      <view class="section-title">今日待办</view>
      <view v-if="todayTodos.length > 0" class="today-card">
        <view v-for="todo in todayTodos" :key="todo.id" class="todo-item" @click="viewTodoDetail(todo)">
          <view class="todo-header">
            <view class="todo-pet">{{ todo.petName }}</view>
            <view :class="['todo-urgency', `urgency-${todo.urgency}`]">
              {{ getUrgencyText(todo) }}
            </view>
          </view>
          <view class="todo-content">
            <text class="todo-type">{{ getTypeText(todo.type) }}</text>
            <text class="todo-name">{{ todo.name }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-todos">
        <text>✨ 今天没有待办事项</text>
      </view>
    </view>

    <!-- Overdue Tasks -->
    <view v-if="overdueTodos.length > 0" class="overdue-section">
      <view class="section-title">
        <text>逾期待办</text>
        <view class="warning-badge">{{ overdueTodos.length }}</view>
      </view>
      <view class="overdue-list">
        <view v-for="todo in overdueTodos" :key="todo.id" class="overdue-item" @click="viewTodoDetail(todo)">
          <view class="overdue-header">
            <text class="overdue-pet">{{ todo.petName }}</text>
            <text class="overdue-days">逾期 {{ todo.overdueDays }} 天</text>
          </view>
          <view class="overdue-content">
            <text class="overdue-type">{{ getTypeText(todo.type) }}</text>
            <text class="overdue-name">{{ todo.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Calendar -->
    <view class="calendar-section">
      <view class="section-title">健康日历</view>

      <!-- Month Header -->
      <view class="calendar-header">
        <u-icon name="arrow-left" size="20" @click="previousMonth"></u-icon>
        <text class="month-text">{{ currentMonthText }}</text>
        <u-icon name="arrow-right" size="20" @click="nextMonth"></u-icon>
      </view>

      <!-- Weekday Headers -->
      <view class="weekday-header">
        <text v-for="day in weekdays" :key="day" class="weekday">{{ day }}</text>
      </view>

      <!-- Calendar Grid -->
      <view class="calendar-grid">
        <view
          v-for="day in calendarDays"
          :key="day.date"
          :class="['calendar-day', {
            'is-today': day.isToday,
            'is-other-month': !day.isCurrentMonth,
            'has-todos': day.todos.length > 0
          }]"
          @click="selectDay(day)"
        >
          <text class="day-number">{{ getDayNumber(day.date) }}</text>
          <view v-if="day.todos.length > 0" class="todo-dots">
            <view
              v-for="(todo, index) in day.todos.slice(0, 3)"
              :key="index"
              :class="['todo-dot', `dot-${todo.type}`]"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Day Detail Bottom Sheet -->
    <u-popup v-model:show="showDayDetail" mode="bottom" :round="20">
      <view class="day-detail-sheet" v-if="selectedDay">
        <view class="sheet-header">
          <text class="sheet-title">{{ formatSheetDate(selectedDay.date) }}</text>
          <u-icon name="close" size="20" @click="showDayDetail = false"></u-icon>
        </view>

        <view v-if="selectedDay.todos.length > 0" class="sheet-content">
          <view v-for="todo in selectedDay.todos" :key="todo.id" class="sheet-todo-item">
            <view class="sheet-todo-header">
              <text class="sheet-todo-pet">{{ todo.petName }}</text>
              <text class="sheet-todo-type">{{ getTypeText(todo.type) }}</text>
            </view>
            <text class="sheet-todo-name">{{ todo.name }}</text>

            <view class="sheet-todo-actions">
              <u-button size="mini" type="success" @click="completeTodoFromSheet(todo)">
                一键完成
              </u-button>
              <u-button size="mini" type="warning" @click="postponeTodoFromSheet(todo)">
                一键推迟
              </u-button>
            </view>
          </view>
        </view>

        <view v-else class="sheet-empty">
          <text>当天没有健康待办</text>
        </view>
      </view>
    </u-popup>

    <!-- Postpone Date Picker -->
    <u-datetime-picker
      v-model="showPostponePicker"
      :show="showPostponePicker"
      mode="date"
      :min-date="Date.now()"
      @confirm="onPostponeConfirm"
      @cancel="showPostponePicker = false"
    ></u-datetime-picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHealthStore } from '@/stores/health'
import { usePetStore } from '@/stores/pet'
import type { HealthTodo, CalendarDay } from '@/types'

const healthStore = useHealthStore()
const petStore = usePetStore()

const currentMonth = ref(new Date())
const showDayDetail = ref(false)
const selectedDay = ref<CalendarDay | null>(null)
const showPostponePicker = ref(false)
const postponingTodo = ref<HealthTodo | null>(null)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

onMounted(async () => {
  // Load records for all pets
  if (petStore.pets.length > 0) {
    for (const pet of petStore.pets) {
      await healthStore.loadRecords(pet.id)
    }
  }
})

const todayTodos = computed(() => {
  return healthStore.todayTodos
})

const overdueTodos = computed(() => {
  return healthStore.allTodos.filter(t => t.urgency === 'overdue')
})

const currentMonthText = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

const calendarDays = computed((): CalendarDay[] => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  // First day of the month
  const firstDay = new Date(year, month, 1)
  const firstDayWeekday = firstDay.getDay()

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const lastDate = lastDay.getDate()

  // Days from previous month to fill the grid
  const prevMonthLastDay = new Date(year, month, 0)
  const prevMonthLastDate = prevMonthLastDay.getDate()

  const days: CalendarDay[] = []
  const today = new Date().setHours(0, 0, 0, 0)

  // Previous month days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDate - i).setHours(0, 0, 0, 0)
    days.push({
      date,
      isToday: date === today,
      isCurrentMonth: false,
      todos: getTodosForDate(date)
    })
  }

  // Current month days
  for (let i = 1; i <= lastDate; i++) {
    const date = new Date(year, month, i).setHours(0, 0, 0, 0)
    days.push({
      date,
      isToday: date === today,
      isCurrentMonth: true,
      todos: getTodosForDate(date)
    })
  }

  // Next month days to complete the grid
  const remainingDays = 42 - days.length // 6 weeks
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i).setHours(0, 0, 0, 0)
    days.push({
      date,
      isToday: date === today,
      isCurrentMonth: false,
      todos: getTodosForDate(date)
    })
  }

  return days
})

function getTodosForDate(date: number): HealthTodo[] {
  const dayStart = date
  const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1

  return healthStore.allTodos.filter(todo =>
    todo.dueDate >= dayStart && todo.dueDate <= dayEnd
  )
}

function getDayNumber(date: number): number {
  return new Date(date).getDate()
}

function getTypeText(type: string): string {
  const types: Record<string, string> = {
    vaccine: '疫苗',
    deworm: '驱虫',
    medical: '体检',
    medicine: '用药',
    weight: '体重'
  }
  return types[type] || type
}

function getUrgencyText(todo: HealthTodo): string {
  if (todo.urgency === 'overdue') return `逾期${todo.overdueDays}天`
  if (todo.urgency === 'today') return '今日'
  if (todo.urgency === 'tomorrow') return '明日'
  return ''
}

function formatSheetDate(date: number): string {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekday = weekdays[d.getDay()]
  return `${month}月${day}日 星期${weekday}`
}

function previousMonth() {
  const newDate = new Date(currentMonth.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentMonth.value = newDate
}

function nextMonth() {
  const newDate = new Date(currentMonth.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentMonth.value = newDate
}

function selectDay(day: CalendarDay) {
  selectedDay.value = day
  showDayDetail.value = true
}

function viewTodoDetail(todo: HealthTodo) {
  // Navigate to specific health page based on type
  const routes: Record<string, string> = {
    vaccine: '/pages/health/vaccine',
    deworm: '/pages/health/deworm',
    medical: '/pages/health/medical',
    medicine: '/pages/health/medicine',
    weight: '/pages/health/weight'
  }

  const route = routes[todo.type]
  if (route) {
    uni.navigateTo({ url: route })
  }
}

async function completeTodoFromSheet(todo: HealthTodo) {
  const result = await uni.showModal({
    title: '完成待办',
    content: `确认完成"${todo.name}"？`
  })

  if (!result.confirm) return

  const updateResult = await healthStore.completeRecord(todo.id)

  if (updateResult.success) {
    uni.showToast({ title: '已完成', icon: 'success' })
    showDayDetail.value = false
  } else {
    uni.showToast({ title: updateResult.message || '操作失败', icon: 'none' })
  }
}

function postponeTodoFromSheet(todo: HealthTodo) {
  postponingTodo.value = todo
  showPostponePicker.value = true
}

async function onPostponeConfirm(e: any) {
  if (!postponingTodo.value) return

  showPostponePicker.value = false

  const result = await healthStore.postponeRecord(postponingTodo.value.id, e.value)

  if (result.success) {
    uni.showToast({ title: '已推迟', icon: 'success' })
    showDayDetail.value = false
  } else {
    uni.showToast({ title: result.message || '操作失败', icon: 'none' })
  }

  postponingTodo.value = null
}
</script>

<style lang="scss" scoped>
.calendar-page {
  min-height: 100vh;
  background: $bg-secondary;
  padding: $spacing-md;
}

.section-title {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
  display: flex;
  align-items: center;

  .warning-badge {
    margin-left: 8rpx;
    padding: 4rpx 12rpx;
    background: #ffebee;
    color: #c62828;
    border-radius: 20rpx;
    font-size: $font-xs;
  }
}

.today-section {
  margin-bottom: $spacing-lg;

  .today-card {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-md;
    box-shadow: $shadow-sm;

    .todo-item {
      padding: $spacing-sm 0;
      border-bottom: 1rpx solid $border-color;

      &:last-child {
        border-bottom: none;
      }

      .todo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8rpx;

        .todo-pet {
          font-size: $font-md;
          font-weight: bold;
          color: $text-primary;
        }

        .todo-urgency {
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
          font-size: $font-xs;

          &.urgency-overdue {
            background: #ffebee;
            color: #c62828;
          }

          &.urgency-today {
            background: #fff3e0;
            color: #e65100;
          }
        }
      }

      .todo-content {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .todo-type {
          padding: 2rpx 8rpx;
          background: #e3f2fd;
          color: #1565c0;
          border-radius: 8rpx;
          font-size: $font-xs;
        }

        .todo-name {
          font-size: $font-sm;
          color: $text-secondary;
        }
      }
    }
  }

  .empty-todos {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: 60rpx $spacing-md;
    text-align: center;
    color: $text-placeholder;
  }
}

.overdue-section {
  margin-bottom: $spacing-lg;

  .overdue-list {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-md;
    box-shadow: $shadow-sm;

    .overdue-item {
      padding: $spacing-sm 0;
      border-bottom: 1rpx solid $border-color;

      &:last-child {
        border-bottom: none;
      }

      .overdue-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8rpx;

        .overdue-pet {
          font-size: $font-md;
          font-weight: bold;
          color: $text-primary;
        }

        .overdue-days {
          font-size: $font-xs;
          color: #c62828;
        }
      }

      .overdue-content {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .overdue-type {
          padding: 2rpx 8rpx;
          background: #ffebee;
          color: #c62828;
          border-radius: 8rpx;
          font-size: $font-xs;
        }

        .overdue-name {
          font-size: $font-sm;
          color: $text-secondary;
        }
      }
    }
  }
}

.calendar-section {
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    padding: 0 $spacing-md;

    .month-text {
      font-size: $font-lg;
      font-weight: bold;
      color: $text-primary;
    }
  }

  .weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 8rpx;

    .weekday {
      text-align: center;
      font-size: $font-sm;
      color: $text-secondary;
      padding: 8rpx 0;
    }
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4rpx;

    .calendar-day {
      aspect-ratio: 1;
      background: $bg-primary;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;

      &.is-today {
        background: #e3f2fd;

        .day-number {
          color: #1565c0;
          font-weight: bold;
        }
      }

      &.is-other-month {
        .day-number {
          color: $text-placeholder;
        }
      }

      &.has-todos {
        border: 1rpx solid #FF8A65;
      }

      .day-number {
        font-size: $font-md;
        color: $text-primary;
      }

      .todo-dots {
        display: flex;
        gap: 4rpx;
        margin-top: 4rpx;

        .todo-dot {
          width: 8rpx;
          height: 8rpx;
          border-radius: 50%;

          &.dot-vaccine {
            background: #FF8A65;
          }

          &.dot-deworm {
            background: #66BB6A;
          }

          &.dot-medical {
            background: #42A5F5;
          }

          &.dot-medicine {
            background: #AB47BC;
          }

          &.dot-weight {
            background: #FFA726;
          }
        }
      }
    }
  }
}

.day-detail-sheet {
  max-height: 60vh;
  display: flex;
  flex-direction: column;

  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
    border-bottom: 1rpx solid $border-color;

    .sheet-title {
      font-size: $font-lg;
      font-weight: bold;
      color: $text-primary;
    }
  }

  .sheet-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-md;

    .sheet-todo-item {
      padding: $spacing-md;
      background: $bg-secondary;
      border-radius: $radius-sm;
      margin-bottom: $spacing-sm;

      .sheet-todo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8rpx;

        .sheet-todo-pet {
          font-size: $font-md;
          font-weight: bold;
          color: $text-primary;
        }

        .sheet-todo-type {
          padding: 4rpx 12rpx;
          background: #e3f2fd;
          color: #1565c0;
          border-radius: 20rpx;
          font-size: $font-xs;
        }
      }

      .sheet-todo-name {
        font-size: $font-sm;
        color: $text-secondary;
        margin-bottom: $spacing-md;
      }

      .sheet-todo-actions {
        display: flex;
        gap: $spacing-sm;
      }
    }
  }

  .sheet-empty {
    padding: 80rpx $spacing-md;
    text-align: center;
    color: $text-placeholder;
  }
}
</style>
