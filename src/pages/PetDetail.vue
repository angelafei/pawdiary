<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <button class="btn-back" @click="router.push('/')">‹ 返回</button>
      <button class="btn-add-circle" @click="openAdd">＋</button>
    </div>

    <!-- Pet profile -->
    <div class="profile">
      <div class="profile-avatar">{{ currentPet?.avatar }}</div>
      <div class="profile-name">{{ currentPet?.name }}</div>
      <div v-if="petStore.latestWeight" class="profile-weight">
        {{ petStore.latestWeight.value }} kg
      </div>
    </div>

    <!-- Weight Trend Chart -->
    <div class="card" v-if="petStore.currentWeightRecords.length > 0">
      <div class="card-title">體重趨勢</div>
      <div class="chart-hint" v-if="sameDay">同日紀錄，顯示量測時間</div>

      <svg class="chart" :viewBox="`0 0 ${SVG_W} ${SVG_H}`" xmlns="http://www.w3.org/2000/svg">
        <!-- grid lines -->
        <line
          v-for="(label, i) in yLabels"
          :key="`gy${i}`"
          :x1="PAD_L" :x2="SVG_W - PAD_R"
          :y1="label.y" :y2="label.y"
          stroke="#EDE0D4" stroke-width="1"
        />
        <!-- y labels -->
        <text
          v-for="(label, i) in yLabels"
          :key="`yl${i}`"
          :x="PAD_L - 6" :y="label.y + 4"
          font-size="11" fill="#B09080" text-anchor="end"
        >{{ label.text }}</text>

        <!-- area fill -->
        <path v-if="chartPoints.length > 1" :d="areaPath" fill="#F5EDDE"/>

        <!-- line -->
        <polyline
          v-if="chartPoints.length > 1"
          :points="linePoints"
          fill="none" stroke="#B8845A" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
        />

        <!-- dots -->
        <circle
          v-for="(p, i) in chartPoints"
          :key="`dot${i}`"
          :cx="p.x" :cy="p.y" r="5"
          fill="#B8845A"
        />

        <!-- latest label -->
        <g v-if="chartPoints.length > 0">
          <rect
            :x="chartPoints[chartPoints.length-1].x - 28"
            :y="chartPoints[chartPoints.length-1].y - 28"
            width="62" height="22" rx="6"
            fill="#B8845A"
          />
          <text
            :x="chartPoints[chartPoints.length-1].x + 3"
            :y="chartPoints[chartPoints.length-1].y - 13"
            font-size="11" fill="white" text-anchor="middle"
          >{{ petStore.latestWeight?.value }} kg</text>
        </g>

        <!-- x labels -->
        <text
          v-for="(p, i) in xLabelPoints"
          :key="`xl${i}`"
          :x="p.x" :y="SVG_H - 6"
          font-size="10" fill="#B09080" text-anchor="middle"
        >{{ p.label }}</text>
      </svg>
    </div>

    <!-- History list -->
    <div class="section-title" v-if="petStore.currentWeightRecords.length > 0">紀錄歷史</div>

    <div class="record-list">
      <div
        v-for="record in petStore.currentWeightRecords"
        :key="record.id"
        class="record-card"
      >
        <div class="record-left">
          <div class="record-date">{{ formatDate(record.date) }}</div>
          <div class="record-time">{{ record.time }}</div>
          <div v-if="record.note" class="record-note">{{ record.note }}</div>
        </div>
        <div class="record-right">
          <div class="record-weight">{{ record.value }} kg</div>
          <div class="record-actions">
            <button class="act-btn edit" @click="openEdit(record)">編輯</button>
            <button class="act-btn delete" @click="deleteRecord(record.id)">刪除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="petStore.currentWeightRecords.length === 0" class="empty-state">
      <div class="empty-icon">⚖️</div>
      <p>還沒有體重記錄<br>點右上角 ＋ 開始記錄吧！</p>
    </div>

    <!-- Add / Edit Weight Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <div class="modal">
          <div class="modal-title-row">
            <button class="btn-close" @click="closeForm">✕</button>
            <h2>{{ editingId ? '編輯體重' : '新增體重' }}</h2>
            <div style="width:32px"></div>
          </div>

          <div class="form-hint">{{ currentPet?.name }} 的體重紀錄</div>

          <form @submit.prevent="submitForm">
            <!-- 日期 -->
            <div class="field-label">日期</div>
            <input v-model="form.date" type="date" class="field-input">

            <!-- 體重 -->
            <div class="field-label">體重</div>
            <div class="weight-input-wrap">
              <input
                v-model.number="form.value"
                type="number"
                step="0.1"
                min="0"
                class="weight-input"
                placeholder="0.0"
                required
              >
              <span class="weight-unit">kg</span>
            </div>

            <!-- 備註 -->
            <div class="field-label">備註（選填）</div>
            <textarea
              v-model="form.note"
              class="field-textarea"
              rows="3"
              placeholder="例：看診前、剛吃飽..."
            ></textarea>

            <button type="submit" class="btn-submit-full">
              {{ editingId ? '儲存變更' : '儲存紀錄' }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePetStore, type WeightRecord } from '../stores/petStore'
// import { format } from 'date-fns'

const router = useRouter()
const route = useRoute()
const petStore = usePetStore()

// 確保顯示正確的寵物
const petId = route.params.id as string
petStore.switchPet(petId)
const currentPet = computed(() => petStore.currentPet)

// ── Chart constants ──────────────────────────────────────
const SVG_W = 340
const SVG_H = 180
const PAD_L = 36
const PAD_R = 12
const PAD_T = 32
const PAD_B = 24

const sameDay = computed(() => {
  const dates = petStore.currentWeightRecords.map(r => r.date)
  return new Set(dates).size === 1 && dates.length > 1
})

const chartPoints = computed(() => {
  const data = [...petStore.currentWeightRecords].reverse() // 舊→新
  if (!data.length) return []

  const values = data.map(r => r.value)
  const minV = Math.min(...values) - 0.2
  const maxV = Math.max(...values) + 0.2
  const range = maxV - minV || 1

  const w = SVG_W - PAD_L - PAD_R
  const h = SVG_H - PAD_T - PAD_B

  return data.map((r, i) => ({
    x: PAD_L + (i / Math.max(data.length - 1, 1)) * w,
    y: PAD_T + (1 - (r.value - minV) / range) * h,
    value: r.value,
    date: r.date,
    time: r.time
  }))
})

const linePoints = computed(() =>
  chartPoints.value.map(p => `${p.x},${p.y}`).join(' ')
)

const areaPath = computed(() => {
  if (chartPoints.value.length < 2) return ''
  const pts = chartPoints.value.map(p => `${p.x},${p.y}`).join(' L ')
  const last = chartPoints.value[chartPoints.value.length - 1]
  const first = chartPoints.value[0]
  return `M ${first.x},${first.y} L ${pts} L ${last.x},${SVG_H - PAD_B} L ${first.x},${SVG_H - PAD_B} Z`
})

// y-axis labels（4 格）
const yLabels = computed(() => {
  const data = petStore.currentWeightRecords
  if (!data.length) return []
  const values = data.map(r => r.value)
  const minV = Math.min(...values) - 0.2
  const maxV = Math.max(...values) + 0.2
  const range = maxV - minV || 1
  const h = SVG_H - PAD_T - PAD_B
  return [0, 1, 2, 3].map(i => {
    const ratio = i / 3
    const val = minV + ratio * range
    return {
      y: PAD_T + (1 - ratio) * h,
      text: val.toFixed(1)
    }
  })
})

// x-axis labels
const xLabelPoints = computed(() => {
  const pts = chartPoints.value
  if (pts.length <= 1) return pts.map((p) => ({ x: p.x, label: sameDay.value ? p.time : formatShort(p.date) }))
  const step = Math.max(1, Math.floor(pts.length / 5))
  return pts.filter((_, i) => i % step === 0 || i === pts.length - 1)
    .map(p => ({ x: p.x, label: sameDay.value ? p.time : formatShort(p.date) }))
})

// ── Helpers ──────────────────────────────────────────────
const formatDate = (d: string) => {
  const date = new Date(d)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
const formatShort = (d: string) => {
  const date = new Date(d)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// ── Form ─────────────────────────────────────────────────
const showForm = ref(false)
const editingId = ref<string | null>(null)

const defaultForm = () => ({
  date: new Date().toISOString().split('T')[0],
  value: null as number | null,
  note: ''
})

const form = ref(defaultForm())

const openAdd = () => {
  editingId.value = null
  form.value = defaultForm()
  showForm.value = true
}

const openEdit = (r: WeightRecord) => {
  editingId.value = r.id
  form.value = { date: r.date, value: r.value, note: r.note || '' }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
}

const submitForm = () => {
  if (!form.value.value || form.value.value <= 0) return
  const now = new Date()
  const time = now.toTimeString().slice(0, 5)

  if (editingId.value) {
    petStore.updateWeightRecord(editingId.value, {
      date: form.value.date,
      value: form.value.value,
      note: form.value.note || undefined
    })
  } else {
    petStore.addWeightRecord({
      petId: petId,
      date: form.value.date,
      time,
      value: form.value.value,
      note: form.value.note || undefined
    })
  }
  closeForm()
}

const deleteRecord = (id: string) => {
  // eslint-disable-next-line no-undef
  if (confirm('確定要刪除這筆記錄嗎？')) {
    petStore.deleteWeightRecord(id)
  }
}
</script>

<style scoped>
.page { padding: 56px 20px 40px; min-height: 100vh; }

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.btn-back {
  background: none;
  border: none;
  font-size: 17px;
  color: #B8845A;
  cursor: pointer;
  font-weight: 500;
}

.btn-add-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F0E4D8;
  border: none;
  font-size: 22px;
  color: #B8845A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-circle:hover { background: #E8D5C4; }

/* Profile */
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: #F5EDDE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  margin-bottom: 10px;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  color: #3D2B1F;
  margin-bottom: 8px;
}

.profile-weight {
  background: #F5EDDE;
  border-radius: 24px;
  padding: 8px 20px;
  font-size: 22px;
  font-weight: 700;
  color: #B8845A;
}

/* Chart */
.card {
  background: white;
  border: 1.5px solid #EDE0D4;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #3D2B1F;
  margin-bottom: 4px;
}

.chart-hint {
  font-size: 11px;
  color: #B09080;
  margin-bottom: 8px;
}

.chart {
  width: 100%;
  height: auto;
  overflow: visible;
}

/* Section title */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #3D2B1F;
  margin-bottom: 12px;
}

/* Record list */
.record-list { display: flex; flex-direction: column; gap: 10px; }

.record-card {
  background: white;
  border: 1.5px solid #EDE0D4;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.record-date { font-size: 15px; font-weight: 600; color: #3D2B1F; }
.record-time { font-size: 12px; color: #B09080; margin-top: 2px; }
.record-note { font-size: 12px; color: #8B6040; margin-top: 4px; font-style: italic; }

.record-right { text-align: right; }
.record-weight { font-size: 17px; font-weight: 700; color: #B8845A; margin-bottom: 6px; }

.record-actions { display: flex; gap: 6px; justify-content: flex-end; }

.act-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.act-btn.edit { background: #F5EDDE; color: #8B6040; }
.act-btn.delete { background: #FDEAEE; color: #C2503A; }
.act-btn:hover { opacity: 0.8; }

/* Empty state */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { color: #B09080; font-size: 14px; line-height: 1.6; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 24px 20px 40px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.modal-title-row h2 { font-size: 18px; font-weight: 700; color: #3D2B1F; }

.btn-close {
  width: 32px;
  height: 32px;
  background: #F0E4D8;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  color: #8B6040;
  cursor: pointer;
}

.form-hint { font-size: 13px; color: #B09080; text-align: center; margin-bottom: 20px; }

.field-label { font-size: 13px; font-weight: 600; color: #5C3826; margin-bottom: 8px; }

.field-input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #EDE0D4;
  border-radius: 12px;
  font-size: 15px;
  color: #3D2B1F;
  background: white;
  margin-bottom: 20px;
  font-family: inherit;
}

.field-input:focus { outline: none; border-color: #B8845A; }

.weight-input-wrap {
  position: relative;
  margin-bottom: 20px;
}

.weight-input {
  width: 100%;
  padding: 16px 50px 16px 16px;
  border: 1.5px solid #B8845A;
  border-radius: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #3D2B1F;
  background: white;
  font-family: inherit;
}

.weight-input:focus { outline: none; }

.weight-unit {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  color: #B09080;
  font-weight: 500;
}

.field-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #EDE0D4;
  border-radius: 12px;
  font-size: 14px;
  color: #3D2B1F;
  background: white;
  margin-bottom: 24px;
  font-family: inherit;
  resize: none;
}

.field-textarea:focus { outline: none; border-color: #B8845A; }

.btn-submit-full {
  width: 100%;
  padding: 16px;
  background: #B8845A;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit-full:hover { background: #9D6F48; }
</style>
