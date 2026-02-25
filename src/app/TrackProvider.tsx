'use client'; // 必须标记为客户端组件，否则无法使用浏览器 API

import { useEffect } from 'react';
import { setTrackGlobalConfig, useTrackRetryListener } from 'react-track-hooks';

// 全局埋点配置组件（只执行一次）
export const TrackProvider = () => {
    // 1. 全局配置埋点（只初始化一次）
    useEffect(() => {
        setTrackGlobalConfig({
            trackUrl: 'api/track', // 替换为你的接口
            batchTrackUrl: 'api/track/batch',
            // enable: process.env.NODE_ENV === 'production',
            enable: true,
            enableBatch: true,
            retryConfig: {
                maxRetryTimes: 5,
                initialDelay: 1000,
                delayMultiplier: 2
            },
            batchConfig: {
                batchSize: 5, // 队列满5条触发批量上报
                batchInterval: 5000, // 3秒触发一次批量上报
            }
        });
    }, []);

    // 2. 启用重试监听（全局只执行一次）
    useTrackRetryListener();

    // 该组件无 UI，仅执行逻辑
    return null;
};