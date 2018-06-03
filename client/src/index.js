import WebVRApp from '@/core'
// create routers map 
WebVRApp.create([
    {
        path: '/', // e.g http://127.0.1:9000/
        component: () => import('@/views/index.js')
    }
],document.querySelector('.webvr-container')
);