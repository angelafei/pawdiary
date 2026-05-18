// src/stores/petStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Pet {
  id: string
  name: string
  type: 'cat' | 'dog' | 'rabbit' | 'other'
  avatar: string // emoji 或圖示 key
  notes?: string
}

export interface WeightRecord {
  id: string
  petId: string
  date: string      // 'YYYY-MM-DD'
  time: string      // 'HH:mm'
  value: number     // kg
  note?: string
}

export const usePetStore = defineStore('pet', () => {

  // ==================== STATE ====================

  const pets = ref<Pet[]>([
    { id: '1', name: 'Mochi', type: 'cat', avatar: '🐱' }
  ])

  const currentPetId = ref<string>('1')

  const weightRecords = ref<WeightRecord[]>([
    { id: 'w1', petId: '1', date: '2026-05-01', time: '09:00', value: 4.28 },
    { id: 'w2', petId: '1', date: '2026-05-08', time: '09:00', value: 4.32 },
    { id: 'w3', petId: '1', date: '2026-05-15', time: '09:30', value: 4.35 }
  ])

  // ==================== COMPUTED ====================

  const currentPet = computed(() =>
    pets.value.find(p => p.id === currentPetId.value) ?? null
  )

  // 當前寵物的體重記錄（最新優先）
  const currentWeightRecords = computed(() =>
    weightRecords.value
      .filter(r => r.petId === currentPetId.value)
      .sort((a, b) => {
        const da = a.date + a.time
        const db = b.date + b.time
        return db.localeCompare(da)
      })
  )

  const latestWeight = computed(() =>
    currentWeightRecords.value[0] ?? null
  )

  // 每隻寵物的摘要（用於列表頁）
  const petSummaries = computed(() =>
    pets.value.map(pet => {
      const records = weightRecords.value
        .filter(r => r.petId === pet.id)
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))

      const latest = records[0]
      const previous = records[1]

      // 幾天未記錄
      const daysSince = latest
        ? Math.floor((Date.now() - new Date(latest.date).getTime()) / 86400000)
        : null

      // 體重變化
      const change = (latest && previous)
        ? +(latest.value - previous.value).toFixed(2)
        : null

      return { pet, latest, daysSince, change }
    })
  )

  // ==================== ACTIONS ====================

  const addPet = (pet: Omit<Pet, 'id'>) => {
    const newPet: Pet = { ...pet, id: Date.now().toString() }
    pets.value.push(newPet)
    currentPetId.value = newPet.id
    return newPet
  }

  const switchPet = (petId: string) => {
    currentPetId.value = petId
  }

  const addWeightRecord = (record: Omit<WeightRecord, 'id'>) => {
    const newRecord: WeightRecord = { ...record, id: Date.now().toString() }
    weightRecords.value.push(newRecord)
    return newRecord
  }

  const updateWeightRecord = (id: string, updates: Partial<Omit<WeightRecord, 'id' | 'petId'>>) => {
    const idx = weightRecords.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      weightRecords.value[idx] = { ...weightRecords.value[idx], ...updates }
    }
  }

  const deleteWeightRecord = (id: string) => {
    weightRecords.value = weightRecords.value.filter(r => r.id !== id)
  }

  return {
    pets,
    currentPetId,
    weightRecords,
    currentPet,
    currentWeightRecords,
    latestWeight,
    petSummaries,
    addPet,
    switchPet,
    addWeightRecord,
    updateWeightRecord,
    deleteWeightRecord
  }
})
