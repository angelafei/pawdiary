<template>
  <div class="page">

    <!-- ── Top Bar ── -->
    <div class="topbar">
      <div class="logo">
        <img src="/assets/paw-nobg.png" class="logo-paw" alt="paw">
        <div class="logo-text">
          <div class="logo-title">寵物健康日誌</div>
          <div class="logo-sub">Pet Health Tracker</div>
        </div>
      </div>
    </div>

    <!-- ── Hero Section ── -->
    <div class="hero">
      <div class="hero-left">
        <div class="hero-title">今天也幫<br>毛孩量體重吧！</div>
        <div class="hero-underline"></div>
      </div>
      <div class="hero-right">
        <img src="/assets/side-image-nobg.png" class="hero-cat" alt="cat illustration">
      </div>
    </div>

    <!-- ── Pet List ── -->
    <div class="section-header">
      <span class="leaf">🌿 我的寵物</span> 
      <button class="btn-add" @click="showAddPet = true">＋ 新增寵物</button>
    </div>

    <div class="pet-list">
      <div
        v-for="{ pet, latest, daysSince, change } in petStore.petSummaries"
        :key="pet.id"
        class="pet-card"
        @click="goToPet(pet.id)"
      >
        <div class="pet-avatar-wrap">
          <div class="pet-avatar">{{ pet.avatar }}</div>
          <div class="pet-dot"></div>
        </div>

        <div class="pet-info">
          <div class="pet-name-row">
            <span class="pet-name">{{ pet.name }}</span>
            <span class="pet-type-badge" :style="{ background: typeColor(pet.type).bg, color: typeColor(pet.type).text }">
              {{ typeLabel(pet.type) }}
            </span>
          </div>
          <div class="pet-days">
            {{ daysSince === null ? '尚無記錄' : daysSince === 0 ? '今天已記錄' : `${daysSince} 天未記錄` }}
          </div>
        </div>

        <div class="pet-weight-info">
          <div class="pet-weight">{{ latest ? latest.value + ' kg' : '—' }}</div>
          <div v-if="change !== null" :class="['pet-change', change > 0 ? 'up' : change < 0 ? 'down' : 'neutral']">
            {{ change > 0 ? '↑' : change < 0 ? '↓' : '→' }} {{ Math.abs(change) }} kg
          </div>
        </div>

        <div class="pet-arrow">›</div>
      </div>
    </div>

    <!-- ── Empty state ── -->
    <div v-if="petStore.pets.length === 0" class="empty-state">
      <img src="/assets/paw-nobg.png" class="empty-paw" alt="paw">
      <p>還沒有寵物<br>點右上角「新增寵物」開始吧！</p>
    </div>

    <!-- ── Reminder Banner ── -->
    <div class="reminder-banner">
      <div class="reminder-left">
        <span class="reminder-bell">🔔</span>
        <div>
          <div class="reminder-title">小提醒</div>
          <div class="reminder-text">定期記錄體重，掌握毛孩的健康狀況！</div>
        </div>
      </div>
      <div class="reminder-deco">🌸🐣</div>
    </div>

    <!-- ── Add Pet Modal ── -->
    <Teleport to="body">
      <div v-if="showAddPet" class="modal-overlay" @click.self="closeAddPet">
        <div class="modal">
          <div class="modal-title-row">
            <button class="btn-close" @click="closeAddPet">✕</button>
            <h2>新增寵物</h2>
            <div style="width:32px"></div>
          </div>

          <form @submit.prevent="submitAddPet">
            <div class="field-label">動物類型</div>
            <div class="type-grid">
              <button
                v-for="t in petTypes"
                :key="t.value"
                type="button"
                :class="['type-btn', { active: form.type === t.value }]"
                @click="form.type = t.value; form.avatar = t.avatar"
              >
                <span class="type-emoji">{{ t.avatar }}</span>
                <span class="type-label">{{ t.label }}</span>
              </button>
            </div>

            <div class="field-label">名字</div>
            <input v-model="form.name" class="field-input" placeholder="輸入寵物名字" required>

            <div class="field-label">目前體重（KG）</div>
            <input v-model.number="form.initWeight" class="field-input" type="number" step="0.1" min="0" placeholder="例：4.2">

            <div class="field-label">選擇頭像</div>
            <div class="avatar-grid">
              <button
                v-for="a in avatarOptions[form.type]"
                :key="a"
                type="button"
                :class="['avatar-btn', { active: form.avatar === a }]"
                @click="form.avatar = a"
              >{{ a }}</button>
            </div>

            <div v-if="formError" class="form-error">{{ formError }}</div>
            <button type="submit" class="btn-submit-full">建立寵物檔案</button>
          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePetStore } from '../stores/petStore'

const router = useRouter()
const petStore = usePetStore()
const showAddPet = ref(false)
const formError = ref('')

const petTypes = [
  { value: 'cat',    label: '貓',  avatar: '🐱' },
  { value: 'dog',    label: '狗',  avatar: '🐶' },
  { value: 'rabbit', label: '兔子', avatar: '🐰' },
  { value: 'other',  label: '其他', avatar: '🐾' }
] as const

const avatarOptions: Record<string, string[]> = {
  cat:    ['🐱', '🐈', '🐈‍⬛'],
  dog:    ['🐶', '🐕', '🦮'],
  rabbit: ['🐰', '🐇'],
  other:  ['🐾', '🐹', '🐦']
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = { cat: '貓咪', dog: '狗狗', rabbit: '兔兔', other: '其他' }
  return map[type] || type
}

const typeColor = (type: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    cat:    { bg: '#F5EDDE', text: '#8B6040' },
    dog:    { bg: '#E8F0F5', text: '#4A6880' },
    rabbit: { bg: '#EEE8F5', text: '#6A5080' },
    other:  { bg: '#F0F5E8', text: '#506040' }
  }
  return map[type] || { bg: '#F5EDDE', text: '#8B6040' }
}

const defaultForm = () => ({
  name: '',
  type: 'cat' as 'cat' | 'dog' | 'rabbit' | 'other',
  avatar: '🐱',
  initWeight: null as number | null
})

const form = ref(defaultForm())

const closeAddPet = () => {
  showAddPet.value = false
  form.value = defaultForm()
  formError.value = ''
}

const submitAddPet = () => {
  if (!form.value.name.trim()) { formError.value = '請輸入寵物名字'; return }
  const newPet = petStore.addPet({ name: form.value.name.trim(), type: form.value.type, avatar: form.value.avatar })
  if (form.value.initWeight && form.value.initWeight > 0) {
    const now = new Date()
    petStore.addWeightRecord({
      petId: newPet.id,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      value: form.value.initWeight
    })
  }
  closeAddPet()
}

const goToPet = (petId: string) => {
  petStore.switchPet(petId)
  router.push(`/pet/${petId}`)
}
</script>

<style scoped>
.page {
  background: #FAF6F0;
  min-height: 100vh;
  padding-bottom: 40px;
  font-family: -apple-system, 'PingFang TC', 'Noto Sans TC', sans-serif;
}

/* ── Top Bar ── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0;
}

.logo { display: flex; align-items: center; gap: 10px; }

.logo-paw {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.logo-title {
  font-size: 15px;
  font-weight: 700;
  color: #5C3826;
  line-height: 1.2;
}

.logo-sub {
  font-size: 10px;
  color: #B09070;
  letter-spacing: 0.5px;
  margin-top: 1px;
}

.btn-add {
  background: #A0693A;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 22px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(160,105,58,0.3);
  white-space: nowrap;
}

.btn-add:hover { background: #8A5830; }

/* ── Hero ── */
.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 12px 20px 0;
  min-height: 190px;
  margin-top: -36px;
  padding-bottom: 25px;
}

.hero-left { flex: 1; padding-top: 16px; }

.hero-title {
  font-size: 28px;
  font-weight: 800;
  color: #4A3020;
  line-height: 1.45;
  letter-spacing: 2px;
}

.hero-underline {
  width: 56px;
  height: 3px;
  background: linear-gradient(90deg, #D4956E, #E8B898);
  border-radius: 2px;
  margin-top: 12px;
}

.hero-right {
  width: 185px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.hero-cat {
  width: 185px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.1));
}

/* ── Section header ── */
.section-header {
  font-size: 15px;
  font-weight: 600;
  color: #5C3826;
  padding: 18px 20px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: space-between;
}

/* ── Pet List ── */
.pet-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 16px;
}

.pet-card {
  background: white;
  border: 1px solid #EDE0D4;
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 6px rgba(180,140,100,0.06);
}

.pet-card:hover {
  border-color: #D4BFAD;
  box-shadow: 0 3px 14px rgba(180,140,100,0.13);
  transform: translateY(-1px);
}

.pet-avatar-wrap { position: relative; flex-shrink: 0; }

.pet-avatar {
  width: 54px;
  height: 54px;
  background: #F5EDDE;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border: 2px solid #EDE0D4;
}

.pet-dot {
  width: 11px;
  height: 11px;
  background: #D4956E;
  border-radius: 50%;
  position: absolute;
  bottom: 2px;
  right: 2px;
  border: 2px solid white;
}

.pet-info { flex: 1; min-width: 0; }

.pet-name-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.pet-name {
  font-size: 18px;
  font-weight: 700;
  color: #3D2B1F;
}

.pet-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 10px;
}

.pet-days { font-size: 12px; color: #B09080; }

.pet-weight-info { text-align: right; flex-shrink: 0; }

.pet-weight {
  font-size: 20px;
  font-weight: 700;
  color: #3D2B1F;
}

.pet-change { font-size: 12px; font-weight: 600; margin-top: 2px; }
.pet-change.up     { color: #C85A3A; }
.pet-change.down   { color: #6BA35A; }
.pet-change.neutral { color: #B09080; }

.pet-arrow { color: #C8B09A; font-size: 22px; margin-left: 2px; flex-shrink: 0; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-paw { width: 64px; opacity: 0.4; margin-bottom: 14px; }
.empty-state p { color: #B09080; font-size: 14px; line-height: 1.7; }

/* ── Reminder Banner ── */
.reminder-banner {
  margin: 20px 16px 0;
  background: #FFF8EE;
  border: 1px solid #EDE0D4;
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reminder-left { display: flex; align-items: flex-start; gap: 10px; }
.reminder-bell { font-size: 20px; flex-shrink: 0; margin-top: 2px; }

.reminder-title { font-size: 14px; font-weight: 700; color: #5C3826; margin-bottom: 3px; }
.reminder-text  { font-size: 12px; color: #9A7060; line-height: 1.5; }
.reminder-deco  { font-size: 22px; flex-shrink: 0; letter-spacing: 2px; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 24px 24px;
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
  margin-bottom: 24px;
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

.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.type-btn {
  background: white;
  border: 1.5px solid #EDE0D4;
  border-radius: 12px;
  padding: 12px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.15s;
}

.type-btn.active { background: #F5EDDE; border-color: #B8845A; }
.type-emoji { font-size: 24px; }
.type-label { font-size: 13px; color: #5C3826; }

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

.avatar-grid { display: flex; gap: 10px; margin-bottom: 24px; }

.avatar-btn {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #F5EDDE;
  border: 2px solid transparent;
  font-size: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.avatar-btn.active { border-color: #B8845A; background: #F0E4D8; }

.form-error {
  background: #FEF0EE;
  border: 1px solid #F0C8C0;
  color: #C2503A;
  font-size: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 14px;
}

.btn-submit-full {
  width: 100%;
  padding: 16px;
  background: #A0693A;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit-full:hover { background: #8A5830; }
</style>
