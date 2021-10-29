<template>
    <div>
        <el-switch v-model="todraw" @click="changeMark" active-text="开始绘制"></el-switch>
    </div>
    <el-radio-group
        id="drawtool-radio-group"
        v-model="shapeType"
        :disabled="!todraw"
        @change="changeMark"
    >
        <el-radio-button
            v-for="(option,index) in markOptions"
            :key="index"
            :label="option.type"
        >{{ option.name }}</el-radio-button>
    </el-radio-group>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { Mark, ShapeType } from '../../libs';

const props = defineProps({
    marker: Mark
})

const shapeType = ref(ShapeType.Point);
const todraw = ref(false);

const markOptions: Array<{ type: ShapeType, name: string }> = [{
    type: ShapeType.Point,
    name: '点'
}, {
    type: ShapeType.Line,
    name: '线'
}, {
    type: ShapeType.Polygon,
    name: '面'
}]

function changeMark() {
    const marker = props.marker;
    if (!marker) return;
    const type = shapeType.value;

    if (todraw.value) {
        marker.start(type);
    } else {
        marker.stop();
    }
}

</script>

<style>
#drawtool-radio-group {
    margin-top: 10px;
}
</style>