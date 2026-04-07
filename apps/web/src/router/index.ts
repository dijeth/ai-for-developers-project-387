import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookingView from '../views/BookingView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/booking',
      name: 'Booking',
      component: BookingView
    },
    {
      path: '/admin',
      name: 'Admin',
      component: AdminView
    }
  ]
})

export default router
