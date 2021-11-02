<template>
    <div class="draw-tool-switch">
        <el-switch v-model="todraw" @click="changeMark" active-text="开始绘制"></el-switch>
        <el-button class="el-icon-setting" size="mini" circle @click="styleDialogVisible = true"></el-button>
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

    <el-dialog v-model="styleDialogVisible" title="标记样式">
        <el-row>
            <el-col :span="2">点</el-col>
            <el-col :span="3">
                <div>颜色</div>
                <el-color-picker v-model="style.point_Color" size="mini" />
            </el-col>
            <el-col :span="19">
                <span>大小</span>
                <el-slider v-model="style.point_PixelSize" :min="1" :max="15" :step="1" show-stops></el-slider>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="2">线</el-col>
            <el-col :span="3">
                <div>颜色</div>
                <el-color-picker v-model="style.line_MaterialColor" size="mini" />
            </el-col>
            <el-col :span="19">
                <span>线宽</span>
                <el-slider v-model="style.line_Width" :min="1" :max="15" :step="1" show-stops></el-slider>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="2">面</el-col>
            <el-col :span="3">
                <div>颜色</div>
                <el-color-picker v-model="style.polygon_MaterialColor" size="mini" />
            </el-col>
            <el-col :span="19">
                <span>不透明度</span>
                <el-slider
                    v-model="style.polygon_MaterialColor_Alpha"
                    :min="0.1"
                    :max="1.0"
                    :step="0.1"
                    show-stops
                ></el-slider>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="2"></el-col>
            <el-col :span="5">
                <el-checkbox v-model="style.polygon_Outline">显示边框</el-checkbox>
            </el-col>
            <el-col :span="4">
                <div>边框颜色</div>
                <el-color-picker :disabled="!style.polygon_Outline" v-model="style.polygon_OutlineColor" size="mini" />
            </el-col>

            <el-col :span="13">
                <span>边框宽度</span>
                <el-slider
                    :disabled="!style.polygon_Outline"
                    v-model="style.polygon_OutlineWidth"
                    :min="1"
                    :max="15"
                    :step="1"
                    show-stops
                ></el-slider>
            </el-col>
        </el-row>
        <el-row>
            <el-checkbox v-model="style.measureEnable">测量模式</el-checkbox>
        </el-row>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Marker, ShapeType } from '../../libs';
import { markerRadioOptions } from '../contracts/UIData'

const props = defineProps({
    marker: Marker
})

if (!props.marker) throw new Error('marker need init before mounted');

const shapeType = ref<ShapeType>('Point');
const todraw = ref(false);
const styleDialogVisible = ref(false);
const style = reactive(props.marker.style);

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

<style scoped>
#drawtool-radio-group {
    margin-top: 10px;
}

.draw-tool-switch {
    display: flex;
    justify-content: space-between;
    padding-right: 5px;
}

.el-row {
    margin-bottom: 30px;
}
</style>