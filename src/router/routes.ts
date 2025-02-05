import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/SolicitudList.vue') },
      { path: 'categories', component: () => import('pages/CategoriaList.vue') },
      { path: 'categoria', component: () => import('pages/CategoriaForm.vue') },
      { path: 'categoria/:id', component: () => import('pages/CategoriaForm.vue') },
      { path: 'titulacions', component: () => import('pages/TitulacioList.vue') },
      { path: 'titulacio', component: () => import('pages/TitulacioForm.vue') },
      { path: 'titulacio/:id', component: () => import('pages/TitulacioForm.vue') },
      { path: 'convalidacions', component: () => import('pages/ConvalidacioList.vue') },
      { path: 'convalidacio', component: () => import('pages/ConvalidacioForm.vue') },
      { path: 'convalidacio/:id', component: () => import('pages/ConvalidacioForm.vue') },
      { path: 'solicituds', component: () => import('pages/SolicitudList.vue') },
      { path: 'solicitud', component: () => import('pages/SolicitudForm.vue') },
      { path: 'solicitud/:id', component: () => import('pages/SolicitudForm.vue') },
      { path: 'solicitud-resolta/:id', component: () => import('pages/SolicitudViewForm.vue') },
      { path: 'login', component: () => import('components/common/Login.vue'), props: { urlRedirect: "/solicituds" } },
      { path: 'logout', component: () => import('components/common/Logout.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: 'public/solicitud',
        component: () => import('pages/SolicitudPublicForm.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
