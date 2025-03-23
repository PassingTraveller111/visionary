import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip} from "recharts";
import {DatePicker, Radio} from "antd";
import styles from './index.module.scss';
import dayjs, {Dayjs} from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
import {useEffect, useState} from "react";
import {useGetUserStatisticChart} from "@/hooks/users/useGetUserStatisticChart";



const today = dayjs();
const sevenDaysAgo = dayjs().subtract(7, 'day');
const fourteenDaysAgo = dayjs().subtract(14, 'day');
const oneMonthAgo = dayjs().subtract(1, 'month');
const dateToRadio = (dates: [Dayjs | null, Dayjs | null]) => {
    if(dates[0] && dates[1]){
        if(!dates[1]?.isSame(today, 'day')){
            return -1;
        }
        if(dates[0]?.isSame(sevenDaysAgo, 'day')){
            return 0;
        }
        if(dates[0]?.isSame(fourteenDaysAgo, 'day')){
            return 1;
        }
        if(dates[0]?.isSame(oneMonthAgo, 'day')){
            return 2;
        }
    }
    return -1;
}

const StatisticLineChart = () => {
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([sevenDaysAgo, today]);
    const [chartData, getChartData] = useGetUserStatisticChart();
    const [radioValue, setRadioValue] = useState(0);
    useEffect(() => {
        getChartData(dateRange[0]?.format('YYYY-MM-DD'), dateRange[1]?.format('YYYY-MM-DD'));
    }, [dateRange, getChartData]);
    return <>
        <div className={styles.header}>
            <div className={styles.date}>
                <Radio.Group
                    options={[
                        {
                            label: '近7天',
                            value: 0
                        },
                        {
                            label: '近14天',
                            value: 1,
                        },
                        {
                            label: '近1月',
                            value: 2,
                        }
                    ]}
                    onChange={(e) => {
                        if (e.target.value === 0) {
                            setDateRange([sevenDaysAgo, today]);
                        } else if (e.target.value === 1) {
                            setDateRange([fourteenDaysAgo, today]);
                        } else if (e.target.value === 2) {
                            setDateRange([oneMonthAgo, today]);
                        }
                        setRadioValue(e.target.value);
                    }}
                    defaultValue={radioValue}
                    value={radioValue}
                    optionType="button"
                    buttonStyle="solid"
                />
                <DatePicker.RangePicker
                    defaultValue={dateRange}
                    value={dateRange}
                    onChange={(e) => {
                        if(e) {
                            setDateRange(e);
                            setRadioValue(dateToRadio(e));
                        }
                    }}
                    minDate={oneMonthAgo}
                    maxDate={today}
                />
            </div>
            <div>

            </div>
        </div>
        <ResponsiveContainer width={'100%'} height={600}>
            <LineChart
                width={500}
                height={300}
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />    {/*x轴用什么表示*/}
                <YAxis />
                <Tooltip/>
                <Legend height={36} />  {/*最下面的用来指示label对应的线条颜色*/}
                <Line type="monotone" dataKey='like' stroke="#C4D79B" name='点赞' />
                <Line type="monotone" dataKey='collect' stroke="#F9DDA4" name='收藏' />
                <Line type="monotone" dataKey='comment' stroke="#A2C8EC" name='评论' />
                <Line type="monotone" dataKey='look' stroke="#E6BCCF"  name='阅读' />
            </LineChart>
        </ResponsiveContainer>
    </>
}


export default StatisticLineChart;

