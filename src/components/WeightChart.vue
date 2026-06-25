<template>
  <view class="weight-chart">
    <canvas
      v-if="chartData.length > 0"
      canvas-id="weight-chart-canvas"
      id="weight-chart-canvas"
      class="chart-canvas"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    ></canvas>
    <view v-else class="chart-empty">
      <text>暂无足够数据绘制图表</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import uCharts from '@qiun/ucharts/u-charts.min.js'

const props = defineProps<{
  chartData: Array<{ date: number; weightValue: number }>
  healthyRange?: { min: number; max: number }
}>()

let chartInstance: any = null

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      if (props.chartData.length > 0) {
        initChart()
      }
    }, 500)
  })
})

watch(() => props.chartData, () => {
  nextTick(() => {
    setTimeout(() => {
      if (props.chartData.length > 0) {
        initChart()
      }
    }, 300)
  })
}, { deep: true })

function initChart() {
  const query = uni.createSelectorQuery()
  query.select('#weight-chart-canvas').boundingClientRect()
  query.exec((res) => {
    if (res && res[0]) {
      const { width, height } = res[0]
      drawChart(width, height)
    }
  })
}

function drawChart(width: number, height: number) {
  // Get canvas context for uCharts v2.0+
  const ctx = uni.createCanvasContext('weight-chart-canvas')

  // Prepare data
  const sortedData = [...props.chartData].sort((a, b) => a.date - b.date)
  const categories = sortedData.map(item => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  const values = sortedData.map(item => item.weightValue)

  // Chart configuration for uCharts v2.0+
  const chartConfig: any = {
    type: 'line',
    context: ctx, // IMPORTANT: Pass context directly for v2.0+
    width,
    height,
    categories,
    series: [{
      name: '体重',
      data: values,
      color: '#FF8A65'
    }],
    xAxis: {
      disableGrid: false,
      gridColor: '#EEEEEE',
      fontColor: '#999999',
      fontSize: 10
    },
    yAxis: {
      gridType: 'dash',
      dashLength: 2,
      gridColor: '#EEEEEE',
      fontColor: '#999999',
      fontSize: 10,
      data: [{
        min: Math.floor(Math.min(...values) * 0.9),
        max: Math.ceil(Math.max(...values) * 1.1),
        format: (val: number) => val.toFixed(1) + 'kg'
      }]
    },
    dataLabel: true,
    dataPointShape: true,
    legend: {
      show: false
    },
    extra: {
      line: {
        type: 'curve',
        width: 2,
        activeType: 'hollow'
      }
    },
    pixelRatio: 2,
    animation: true,
    enableScroll: sortedData.length > 10
  }

  // Add healthy range area if provided
  if (props.healthyRange) {
    const { min, max } = props.healthyRange
    chartConfig.series.push({
      name: '健康范围',
      data: new Array(categories.length).fill((min + max) / 2),
      color: 'rgba(76, 175, 80, 0.2)',
      lineType: 'straight',
      disableLegend: true
    })
  }

  chartInstance = new uCharts(chartConfig)
}

function touchStart(e: any) {
  if (chartInstance) {
    chartInstance.touchStart(e)
  }
}

function touchMove(e: any) {
  if (chartInstance) {
    chartInstance.touchMove(e)
  }
}

function touchEnd(e: any) {
  if (chartInstance) {
    chartInstance.touchEnd(e)
  }
}
</script>

<style lang="scss" scoped>
.weight-chart {
  width: 100%;

  .chart-canvas {
    width: 100%;
    height: 500rpx;
  }

  .chart-empty {
    width: 100%;
    height: 500rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border-radius: $radius-md;

    text {
      color: $text-placeholder;
      font-size: $font-md;
    }
  }
}
</style>
