'use client'; // 必须标记为客户端组件

import {useEffect, useState} from 'react';
import {
    useTrackClick,
    useTrackExposure,
    useTrackPageStay,
    useTrackCustom,
    getFailedTracks,
    retryFailedTracks,
    getMergedDefaultConfig,
    FailedTrackParams
} from 'react-track-hooks';

export default function TrackDemoPage() {
    // ========== 1. 页面停留时长埋点 ==========
    useTrackPageStay('page_stay_track_demo', {
        page_name: '埋点测试页',
        page_type: 'demo'
    });

    // ========== 2. 点击埋点 ==========
    // 基础点击埋点
    const handleBtnClick = useTrackClick(
        'btn_click_basic',
        { btn_name: '基础点击按钮', btn_type: 'primary' },
        { enableBatch: true } // 启用批量上报
    );

    // 自定义参数的点击埋点
    const handleCustomClick = useTrackClick(
        'btn_click_custom',
        { btn_name: '自定义参数按钮' },
        {
            enableBatch: false,
        } // 禁用批量，单条上报
    );

    // ========== 3. 曝光埋点 ==========
    // 曝光区域1（默认只曝光一次）
    const exposureRef1 = useTrackExposure<HTMLDivElement>(
        'div_exposure_once',
        { div_name: '单次曝光区域', position: 'top' },
        { exposureThreshold: 0.5, exposureOnce: true }
    );

    // 曝光区域2（重复曝光）
    const exposureRef2 = useTrackExposure<HTMLDivElement>(
        'div_exposure_repeat',
        { div_name: '重复曝光区域', position: 'bottom' },
        { exposureThreshold: 0.5, exposureOnce: false }
    );

    // ========== 4. 自定义埋点 ==========
    const triggerCustomTrack = useTrackCustom(
        'custom_track_demo',
        { custom_type: 'manual_trigger' },
        { enableBatch: true }
    );

    // ========== 5. 测试辅助：手动触发重试/查看失败队列 ==========
    const [failedTracks, setFailedTracks] = useState<FailedTrackParams[]>([]);
    const [count, setCount] = useState(0); // 用于生成不同的自定义参数

    useEffect(() => {
        // 客户端挂载后再读取失败埋点
        const tracks = getFailedTracks();
        setFailedTracks(tracks);
    }, []);
    // 手动触发自定义埋点
    const handleManualTrigger = () => {
        triggerCustomTrack({
            trigger_time: Date.now(),
            trigger_count: count + 1
        });
        setCount(prev => prev + 1);
        // 刷新失败队列展示
        setFailedTracks(getFailedTracks());
    };

    // 手动触发重试
    const handleRetry = async () => {
        await retryFailedTracks(true); // force=true 强制重试
        setFailedTracks(getFailedTracks());
    };

    // ========== 6. 批量上报测试：快速生成多条埋点 ==========
    const handleBatchTest = () => {
        // 连续触发6次（超过batchSize=5，会立即触发批量上报）
        for (let i = 0; i < 6; i++) {
            triggerCustomTrack({
                batch_index: i,
                batch_test: true
            });
        }
        setCount(prev => prev + 6);
        setFailedTracks(getFailedTracks());
    };
    useEffect(() => {
        console.log(getMergedDefaultConfig())
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>埋点库功能测试页</h1>
            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #eee' }}>
                <h2>1. 点击埋点测试</h2>
                <button
                    onClick={() => {
                        handleBtnClick()
                    }}
                    style={{ margin: '0 10px 10px 0', padding: '8px 16px' }}
                >
                    基础点击按钮（批量上报）
                </button>
                <button
                    onClick={handleCustomClick}
                    style={{ margin: '0 10px 10px 0', padding: '8px 16px' }}
                >
                    自定义参数按钮（单条上报）
                </button>
            </div>

            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #eee' }}>
                <h2>2. 曝光埋点测试</h2>
                <div
                    ref={exposureRef1}
                    style={{
                        height: '200px',
                        margin: '10px 0',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    单次曝光区域（滚动出视口再滚回来，不会重复上报）
                </div>
                <div
                    ref={exposureRef2}
                    style={{
                        height: '200px',
                        margin: '10px 0',
                        backgroundColor: '#e8f4f8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    重复曝光区域（滚动出视口再滚回来，会重复上报）
                </div>
            </div>

            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #eee' }}>
                <h2>3. 自定义埋点测试</h2>
                <button
                    onClick={handleManualTrigger}
                    style={{ margin: '0 10px 10px 0', padding: '8px 16px' }}
                >
                    手动触发自定义埋点
                </button>
                <button
                    onClick={handleBatchTest}
                    style={{ margin: '0 10px 10px 0', padding: '8px 16px' }}
                >
                    批量上报测试（触发6条埋点）
                </button>
            </div>

            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #eee' }}>
                <h2>4. 失败重试测试</h2>
                <button
                    onClick={handleRetry}
                    style={{ margin: '0 10px 10px 0', padding: '8px 16px' }}
                >
                    手动触发失败埋点重试
                </button>
                <div style={{ marginTop: '10px' }}>
                    <h3>当前失败埋点队列（共{failedTracks.length}条）：</h3>
                    <pre style={{
                        backgroundColor: '#f9f9f9',
                        padding: '10px',
                        maxHeight: '300px',
                        overflow: 'auto'
                    }}>
            {JSON.stringify(failedTracks, null, 2) || '暂无失败埋点'}
          </pre>
                </div>
            </div>

            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #eee' }}>
                <h2>5. 页面停留时长测试</h2>
                <p>切换页面/隐藏浏览器标签页/关闭页面，会自动上报停留时长</p>
                <p>可在控制台查看「page_stay_track_demo」埋点上报日志</p>
            </div>
        </div>
    );
}