import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@src/pages/LandingPage.vue'),
      meta: {
        layout: 'default',
        showFooter: true
      }
    },
    {
      path: '/magazines',
      name: 'MagazineList',
      component: () => import('@src/pages/MagazineList.vue')
    },
    {
      path: '/flat-plan/:id',
      name: 'FlatPlan',
      component: () => import('@src/pages/FlatPlan.vue')
    },
    {
      path: '/share',
      name: 'SharePage',
      component: () => import('@src/pages/SharePage.vue')
    }
  ]
});

export default router; 
