<template>
    <div ref="container"></div>
</template>

<script>
import G6 from '@antv/g6';

const colors = {
    undefined: '#111111',
    'Active':'#14bd91',
    'InActive':'#fa8c16',
    'History':'#d9d9d9',
};

function formatDesc(desc){
    if(desc){
        if(desc.length<=7){
            return desc;
        }
        return desc.substr(0,7)+'...';
    }
    return '无描述'
}

G6.registerNode('card-node', {
    draw: function drawShape(cfg, group) {
        const r = 2;
        const color = cfg.color||colors[cfg.state];
        const w = cfg.size[0];
        const h = cfg.size[1];

        const shape = group.addShape('rect', {
            attrs: {
                x: -w / 2,
                y: -h / 2,
                width: w, //200,
                height: h, // 60
                stroke: color,
                radius: r,
                fill: '#fff',
                cursor: 'pointer'
            },
            name: 'main-box',
            draggable: true,
        });

        group.addShape('rect', {
            attrs: {
                x: -w / 2,
                y: -h / 2,
                width: w, //200,
                height: h / 2, // 60
                fill: color,
                radius: [r, r, 0, 0],
                cursor: 'pointer'
            },
            name: 'title-box',
            draggable: true,
        });

        // title text
        group.addShape('text', {
            attrs: {
                textBaseline: 'top',
                x: -w / 2 + 8,
                y: -h / 2 + 2,
                lineHeight: 20,
                text: cfg.version.substring(cfg.version.length-9,cfg.version.length),
                fill: '#fff',
                cursor: 'pointer'
            },
            name: 'title',
        });
        cfg.children &&
        group.addShape('marker', {
            attrs: {
                x: w / 2,
                y: 0,
                r: 6,
                cursor: 'pointer',
                symbol: G6.Marker.collapse,
                stroke: '#666',
                lineWidth: 1,
                fill: '#fff',
            },
            name: 'collapse-icon',
        });
        group.addShape('text', {
            attrs: {
                textBaseline: 'top',
                x: -w / 2 + 8,
                y: -h / 2 + 24,
                lineHeight: 20,
                text: formatDesc(cfg.versionDesc),
                fill: 'rgba(0,0,0, 1)',
                cursor: 'pointer'
            },
            name: `description`,
        });
        return shape;
    },
    setState(name, value, item) {
        if (name === 'collapsed') {
            const marker = item.get('group').find((ele) => ele.get('name') === 'collapse-icon');
            const icon = value ? G6.Marker.expand : G6.Marker.collapse;
            marker.attr('symbol', icon);
        }
    },
});

export default {
    props:{
        data:Object,
    },
    mounted() {

        const container = this.$refs.container;
        const width = container.scrollWidth;
        const height = container.scrollHeight || 500;

        const graph = new G6.TreeGraph({
            container: container,
            width,
            height,
            modes: {
                default: [
                    'drag-canvas',
                    'zoom-canvas',
                ],
            },
            defaultNode: {
                type: 'card-node',
                size: [105, 40],
            },
            defaultEdge: {
                type: 'cubic-horizontal',
                style: {
                    endArrow: true,
                },
            },
            layout: {
                type: 'indented',
                direction: 'LR',
                //dropCap: false,
                indent: 90,
                getHeight: () => {
                    return 20;
                },
            },
        });
        graph.data(this.data);
        graph.render();
        graph.layout();
        graph.fitView(20);
        graph.on('node:click', (e) => {
            if (e.target.get('name') === 'collapse-icon') {
                e.item.getModel().collapsed = !e.item.getModel().collapsed;
                graph.setItemState(e.item, 'collapsed', e.item.getModel().collapsed);
                graph.layout();
            }else{
                this.$emit("g-click",e)
            }
        });
    }
}
</script>

<style scoped>

</style>