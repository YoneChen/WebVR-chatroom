/*global WebVR:true*/
// create routers map 
WebVR.init([
    {
        path: '/', // e.g http://127.0.1:9000/1
        component: () => import('@/views/index.js')
    }
],document.querySelector('.webvr-container')
);