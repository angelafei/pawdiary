// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import PetList from '../pages/PetList.vue'
import PetDetail from '../pages/PetDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: PetList, meta: { title: 'My Pets' } },
    { path: '/pet/:id', component: PetDetail, meta: { title: 'Weight Records' } }
  ]
})

router.afterEach((to) => {
  document.title = `${to.meta.title} · PawDiary`
})

export default router
