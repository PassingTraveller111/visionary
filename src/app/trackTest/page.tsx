'use client'; // 必须标记为客户端组件

import {useCallback, useEffect, useRef, useState} from 'react';
import {
    useTrackClick,
    useTrackExposure,
    useTrackPageStay,
    useTrackCustom,
    useTrackFirstRender,
    getFailedTracks,
    retryFailedTracks,
    getTrackGlobalConfig,
    type FailedTrackParams,
    type TrackGlobalConfig,
} from 'react-track-hooks';

type TrackLogType = 'trigger' | 'queue' | 'upload' | 'lifecycle' | 'retry' | 'exposure' | 'info';

type TrackLogItem = {
    id: number;
    time: string;
    type: TrackLogType;
    title: string;
    detail?: string;
};

const TRACK_CONFIG_COMMENTS: Record<string, string> = {
    trackUrl: '单条埋点上报接口地址',
    batchTrackUrl: '批量埋点上报接口地址',
    enable: '是否启用埋点上报',
    enableBatch: '是否默认启用批量上报',
    retryConfig: '失败埋点重试配置',
    'retryConfig.maxRetryTimes': '单条失败埋点最多重试次数',
    'retryConfig.initialDelay': '首次重试延迟时间，单位毫秒',
    'retryConfig.delayMultiplier': '每次重试延迟的倍数，用于指数退避',
    batchConfig: '批量上报配置',
    'batchConfig.batchSize': '批量队列达到该数量时立即上报',
    'batchConfig.batchInterval': '批量队列定时上报间隔，单位毫秒',
    exposureConfig: '曝光埋点默认配置',
    'exposureConfig.exposureOnce': '同一元素是否只上报一次曝光',
    'exposureConfig.exposureThreshold': '元素可见比例达到该阈值时触发曝光',
    pageStayConfig: '页面停留时长埋点配置',
    'pageStayConfig.timeout': '页面停留计时超时时间，单位毫秒',
    'pageStayConfig.minDuration': '小于该停留时长不再上报，单位毫秒',
    'pageStayConfig.maxDuration': '超过该停留时长按最大值上报，单位毫秒',
    'pageStayConfig.checkInterval': '页面停留状态检测间隔，单位毫秒',
};

const stringifyConfigValue = (value: unknown) => {
    if (typeof value === 'string') return `'${value}'`;
    return String(value);
};

const appendTrackConfigLines = (
    config: Record<string, unknown>,
    lines: string[],
    depth = 1,
    prefix = '',
) => {
    Object.entries(config).forEach(([key, value], index, entries) => {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        const indent = '  '.repeat(depth);
        const comma = index === entries.length - 1 ? '' : ',';
        const comment = TRACK_CONFIG_COMMENTS[fieldPath] ? ` // ${TRACK_CONFIG_COMMENTS[fieldPath]}` : '';

        if (value && typeof value === 'object' && !Array.isArray(value)) {
            lines.push(`${indent}${key}: {${comment}`);
            appendTrackConfigLines(value as Record<string, unknown>, lines, depth + 1, fieldPath);
            lines.push(`${indent}}${comma}`);
            return;
        }

        lines.push(`${indent}${key}: ${stringifyConfigValue(value)}${comma}${comment}`);
    });
};

const formatTrackConfigWithComments = (config: Readonly<TrackGlobalConfig>) => {
    const lines = ['{'];
    appendTrackConfigLines(config as Record<string, unknown>, lines);
    lines.push('}');
    return lines.join('\n');
};

const getTrackRequestInfo = (input: RequestInfo | URL, body: BodyInit | null | undefined) => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const url = rawUrl.startsWith('http') ? new URL(rawUrl).pathname : rawUrl;

    if (!url.includes('api/track')) return null;

    let parsedBody: { tracks?: Array<{ eventName?: string }>; eventName?: string } | null = null;
    if (typeof body === 'string') {
        try {
            parsedBody = JSON.parse(body);
        } catch {
            parsedBody = null;
        }
    }

    const isBatch = Array.isArray(parsedBody?.tracks);
    const eventNames = isBatch
        ? parsedBody?.tracks?.map(track => track.eventName).filter(Boolean).join('、')
        : parsedBody?.eventName;

    return {
        isBatch,
        eventNames: eventNames || '未知埋点',
        count: isBatch ? parsedBody?.tracks?.length || 0 : 1,
        url,
    };
};

export default function TrackDemoPage() {
    const logIdRef = useRef(0);
    const exposureOnceLoggedRef = useRef(false);

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
    const [trackConfig, setTrackConfig] = useState<Readonly<TrackGlobalConfig> | null>(null);
    const [trackLogs, setTrackLogs] = useState<TrackLogItem[]>([]);
    const [count, setCount] = useState(0); // 用于生成不同的自定义参数

    const addTrackLog = useCallback((type: TrackLogType, title: string, detail?: string) => {
        const id = logIdRef.current + 1;
        logIdRef.current = id;
        setTrackLogs(prev => [
            ...prev,
            {
                id,
                time: new Date().toLocaleTimeString(),
                type,
                title,
                detail,
            }
        ].slice(-80));
    }, []);

    const logTrackTrigger = useCallback((eventName: string, trackType: string, enableBatch: boolean, detail?: string) => {
        addTrackLog('trigger', `触发埋点：${eventName}`, `${trackType}${detail ? `，${detail}` : ''}`);
        addTrackLog(
            enableBatch ? 'queue' : 'upload',
            enableBatch ? '埋点进入批量上报队列' : '埋点走单条立即上报',
            enableBatch ? `等待队列满或定时器触发批量上报：${eventName}` : `即将请求单条上报接口：${eventName}`
        );
    }, [addTrackLog]);

    useEffect(() => {
        // 客户端挂载后再读取失败埋点和当前埋点配置
        const tracks = getFailedTracks();
        setFailedTracks(tracks);
        setTrackConfig(getTrackGlobalConfig());
        addTrackLog('lifecycle', '测试页已挂载', `当前页面状态：${document.visibilityState}`);
    }, [addTrackLog]);

    useEffect(() => {
        const originalFetch = window.fetch;

        window.fetch = async (input, init) => {
            const requestInfo = getTrackRequestInfo(input, init?.body);
            if (!requestInfo) return originalFetch(input, init);

            addTrackLog(
                'upload',
                requestInfo.isBatch ? '触发批量上报接口' : '触发单条上报接口',
                `${requestInfo.url}，${requestInfo.count} 条：${requestInfo.eventNames}`
            );

            try {
                const response = await originalFetch(input, init);
                addTrackLog(
                    response.ok ? 'upload' : 'retry',
                    response.ok ? '埋点上报成功' : '埋点上报失败，等待重试',
                    `HTTP ${response.status}，${requestInfo.eventNames}`
                );
                return response;
            } catch (error) {
                addTrackLog('retry', '埋点上报异常，写入失败队列', error instanceof Error ? error.message : String(error));
                throw error;
            }
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [addTrackLog]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                addTrackLog('lifecycle', '页面可见', '恢复页面停留计时，并触发失败队列重试监听');
                return;
            }

            addTrackLog('lifecycle', '页面隐藏/关闭', '页面停留时长将走单条上报，批量队列也会被立即处理');
        };
        const handlePageHide = () => {
            addTrackLog('lifecycle', '页面即将离开', 'pagehide 触发，浏览器会尽量发送 keepalive 上报');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [addTrackLog]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                if (entry.target === exposureRef1.current) {
                    if (exposureOnceLoggedRef.current) return;
                    exposureOnceLoggedRef.current = true;
                    addTrackLog('exposure', '单次曝光区域进入视口', `可见比例：${entry.intersectionRatio.toFixed(2)}`);
                    logTrackTrigger('div_exposure_once', '曝光埋点', true, '单次曝光');
                    return;
                }

                addTrackLog('exposure', '重复曝光区域进入视口', `可见比例：${entry.intersectionRatio.toFixed(2)}`);
                logTrackTrigger('div_exposure_repeat', '曝光埋点', true, '重复曝光');
            });
        }, { threshold: 0.5 });

        const firstTarget = exposureRef1.current;
        const secondTarget = exposureRef2.current;
        if (firstTarget) observer.observe(firstTarget);
        if (secondTarget) observer.observe(secondTarget);

        return () => observer.disconnect();
    }, [addTrackLog, exposureRef1, exposureRef2, logTrackTrigger]);

    useEffect(() => {
        logTrackTrigger('first_render_track_demo', '首次渲染埋点', true, '组件首次挂载');
    }, [logTrackTrigger]);
    // 手动触发自定义埋点
    const handleManualTrigger = () => {
        logTrackTrigger('custom_track_demo', '自定义埋点', true, `第 ${count + 1} 次手动触发`);
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
        addTrackLog('retry', '手动触发失败埋点重试', `当前失败队列 ${failedTracks.length} 条`);
        await retryFailedTracks(true); // force=true 强制重试
        setFailedTracks(getFailedTracks());
        addTrackLog('retry', '失败埋点重试完成', `重试后失败队列 ${getFailedTracks().length} 条`);
    };

    // ========== 6. 批量上报测试：快速生成多条埋点 ==========
    const handleBatchTest = () => {
        // 连续触发6次（超过batchSize=5，会立即触发批量上报）
        for (let i = 0; i < 6; i++) {
            logTrackTrigger('custom_track_demo', '批量测试自定义埋点', true, `batch_index=${i}`);
            triggerCustomTrack({
                batch_index: i,
                batch_test: true
            });
        }
        addTrackLog('queue', '批量队列达到阈值', '连续触发 6 条，超过 batchSize=5，预期立即触发批量上报');
        setCount(prev => prev + 6);
        setFailedTracks(getFailedTracks());
    };
    // 首次渲染测试
    useTrackFirstRender(
        'first_render_track_demo',
    )

    return (
        <div className="track-test-page">
            <main className="track-test-main">
                <h1>埋点库功能测试页（接口设置了一定概率会失败，可以多点几次尝试失败情况）</h1>
            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #eee' }}>
                <h2>当前埋点配置信息</h2>
                <pre style={{
                    backgroundColor: '#f9f9f9',
                    padding: '10px',
                    maxHeight: '300px',
                    overflow: 'auto'
                }}>
                    {trackConfig ? formatTrackConfigWithComments(trackConfig) : '正在读取埋点配置...'}
                </pre>
            </div>
            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #eee' }}>
                <h2>1. 点击埋点测试</h2>
                <button
                    onClick={() => {
                        logTrackTrigger('btn_click_basic', '点击埋点', true, '基础点击按钮');
                        handleBtnClick()
                    }}
                    style={{ margin: '0 10px 10px 0', padding: '8px 16px' }}
                >
                    基础点击按钮（批量上报）
                </button>
                <button
                    onClick={(event) => {
                        logTrackTrigger('btn_click_custom', '点击埋点', false, '自定义参数按钮');
                        handleCustomClick(event);
                    }}
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
            </main>

            <aside className="track-log-panel">
                <div className="track-log-header">
                    <h2>埋点触发顺序</h2>
                    <button type="button" onClick={() => setTrackLogs([])}>清空</button>
                </div>
                <div className="track-log-list">
                    {trackLogs.length === 0 ? (
                        <div className="track-log-empty">暂无埋点流程记录</div>
                    ) : trackLogs.map(log => (
                        <div key={log.id} className={`track-log-item track-log-${log.type}`}>
                            <div className="track-log-meta">
                                <span>#{log.id}</span>
                                <span>{log.time}</span>
                                <span>{log.type}</span>
                            </div>
                            <strong>{log.title}</strong>
                            {log.detail ? <p>{log.detail}</p> : null}
                        </div>
                    ))}
                </div>
            </aside>

            <style jsx>{`
                .track-test-page {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 360px;
                    gap: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .track-test-main {
                    min-width: 0;
                }

                .track-log-panel {
                    position: sticky;
                    top: 20px;
                    align-self: start;
                    max-height: calc(100vh - 40px);
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    background: #ffffff;
                    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
                    overflow: hidden;
                }

                .track-log-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 14px 16px;
                    border-bottom: 1px solid #eef2f7;
                    background: #f8fafc;
                }

                .track-log-header h2 {
                    margin: 0;
                    font-size: 18px;
                }

                .track-log-header button {
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: #ffffff;
                    padding: 6px 10px;
                    cursor: pointer;
                }

                .track-log-list {
                    max-height: calc(100vh - 108px);
                    overflow: auto;
                    padding: 12px;
                }

                .track-log-empty {
                    color: #64748b;
                    padding: 20px 8px;
                    text-align: center;
                }

                .track-log-item {
                    border-left: 4px solid #94a3b8;
                    border-radius: 10px;
                    background: #f8fafc;
                    padding: 10px 12px;
                    margin-bottom: 10px;
                }

                .track-log-trigger { border-left-color: #2563eb; }
                .track-log-queue { border-left-color: #f59e0b; }
                .track-log-upload { border-left-color: #16a34a; }
                .track-log-lifecycle { border-left-color: #7c3aed; }
                .track-log-retry { border-left-color: #dc2626; }
                .track-log-exposure { border-left-color: #0891b2; }

                .track-log-meta {
                    display: flex;
                    gap: 8px;
                    color: #64748b;
                    font-size: 12px;
                    margin-bottom: 6px;
                }

                .track-log-item strong {
                    display: block;
                    color: #0f172a;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .track-log-item p {
                    margin: 6px 0 0;
                    color: #475569;
                    font-size: 13px;
                    line-height: 1.45;
                }

                @media (max-width: 960px) {
                    .track-test-page {
                        grid-template-columns: 1fr;
                    }

                    .track-log-panel {
                        position: static;
                        max-height: none;
                    }

                    .track-log-list {
                        max-height: 420px;
                    }
                }
            `}</style>
        </div>
    );
}
