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
            v-for="(option,index) in markerRadioOptions"
            :key="index"
            :label="option.label"
        >{{ option.name }}</el-radio-button>
    </el-radio-group>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Marker, ShapeType } from '../../libs';
import { markerRadioOptions } from '../contracts/UIData'

const props = defineProps({
    marker: Marker
})

const shapeType = ref<ShapeType>('Point');
const todraw = ref(false);

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