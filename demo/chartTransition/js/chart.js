// 页面上四个图表
(function(win, $) {
    var randomData = [];
    var randomData2 = [];
    var randomData3 = [];
    for (var i = 0; i < 10; i++) {
        randomData.push((Math.random() * 100).toFixed(2));
        randomData2.push((Math.random() * 100).toFixed(2));
        randomData3.push((-Math.random() * 100).toFixed(2));
    }
    var histogram1 = echarts.init(document.getElementById('histogram1')),
        histogram2 = echarts.init(document.getElementById('histogram2')),
        histogram3 = echarts.init(document.getElementById('histogram3')),

        option1 = {
            title: { text: '柱状图示例1' },
            tooltip: {},
            //图例
            legend: {
                data: ['销量']
            },
            // X轴 名称
            xAxis: {
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                name: '月份',
                axisTick: { alignWithLabel: true } //坐标轴刻度与标签对齐
            },
            yAxis: {},
            toolbox: {},
            //数据
            series: [{
                name: '销量',
                type: 'bar',
                data: randomData
            }]
        };
    histogram1.setOption(option1);
    var option2 = {
        title: { text: '柱状图示例2' },
        tooltip: {},
        //图例
        legend: {
            data: ['国内销量', '出口销量'] //必须和series中的name对应
        },
        // X轴 名称
        xAxis: {
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            name: '月份',
            nameLocation: 'end'
        },
        yAxis: {},
        toolbox: {},
        //数据
        series: [{
            name: '国内销量',
            type: 'bar',
            label: { normal: { show: true, position: 'top' } },
            data: randomData
        }, {
            name: '出口销量',
            type: 'bar',
            label: {
                normal: { show: true, position: [0, -20] },
                emphasis: { show: true }
            },
            data: randomData2
        }]
    };
    histogram2.setOption(option2);
    var option3 = {
        title: { text: '柱状图示例3' },
        tooltip: {},
        //图例
        legend: {
            data: ['国内销量', '出口销量', '销售成本'] //必须和series中的name对应
        },
        // X轴 名称
        xAxis: {
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            name: '月份'
        },
        yAxis: {},
        toolbox: {
            show: true,
            top: 20,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                dataView: { readOnly: false },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        brush: {
            toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
            xAxisIndex: 0
        },
        //数据
        series: [{
            name: '国内销量',
            type: 'bar',
            label: { normal: { show: true, position: 'top' } },
            data: randomData
        }, {
            name: '出口销量',
            type: 'bar',
            label: {
                normal: { show: true, position: [0, -20] },
                emphasis: { show: true }
            },
            data: randomData2
        }, {
            name: '销售成本',
            type: 'bar',
            label: {
                normal: { show: true, position: 'bottom' },
                emphasis: { show: true }
            },
            data: randomData3
        }]
    };
    histogram3.setOption(option3);



    var myChart = echarts.init(document.getElementById('heibeimap'));
    myChart.setOption({
        series: [{
            name: '河北',
            type: 'map',
            mapType: '河北',
            roam: true,
            label: {
                normal: {
                    show: true
                }
            },
            data: [{
                name: '承德市',
                itemStyle: { normal: { areaColor: '#f4eaa5' } }
            }, {
                name: '张家口市',
                itemStyle: { normal: { areaColor: '#f3ddf9' } }
            }, {
                name: '保定市',
                itemStyle: { normal: { areaColor: '#c8f0ce' } }
            }, {
                name: '廊坊市',
                itemStyle: { normal: { areaColor: '#f4eaa5' } }
            }, {
                name: '石家庄市',
                itemStyle: { normal: { areaColor: '#fac8d8' } }
            }, {
                name: '衡水市',
                itemStyle: { normal: { areaColor: '#f4eaa5' } }
            }, {
                name: '邢台市',
                itemStyle: { normal: { areaColor: '#c8f0ce' } }
            }, {
                name: '邯郸市',
                itemStyle: { normal: { areaColor: '#fac8d8' } }
            }, {
                name: '沧州市',
                itemStyle: { normal: { areaColor: '#fac8d8' } }
            }, {
                name: '唐山市',
                itemStyle: { normal: { areaColor: '#c8f0ce' } }
            }, {
                name: '秦皇岛市',
                itemStyle: { normal: { areaColor: '#fac8d8' } }
            }]
        }]
    });

})(window, jQuery);

