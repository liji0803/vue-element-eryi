/*
* 门店车辆管理
*/
<template>
  <div class="drivecar">
    <div class="drivecar-main">
      <div class="t-header flex-between">
        <el-select
          v-model="search_group.storeCode"
          placeholder="请选择门店"
          width="300px "
          @change="findStoreCars">
          <el-option
            v-for="item in loginUserStoreList"
            :key="item.id"
            :label="item.name"
            :value="item.id"/>
        </el-select>
        <div class="date-box">
          <el-button class="btn" icon="el-icon-arrow-left" @click="onClickDate('pre')"/>
          <el-date-picker
            :clearable="false"
            :editable="false"
            v-model="search_group.searchMouth"
            popper-class="selectDate"
            value-format="yyyy-MM"
            type="month"
            placeholder="选择月份"
            @change="findStoreCars"/>
          <el-button class="btn" icon="el-icon-arrow-right" @click="onClickDate('next')"/>
        </div>
      </div>
      <!-- 车辆试驾表格部分 -->
      <el-table
        ref="carTable"
        :data="carData"
        :cell-class-name="cellStyle"
        :header-cell-class-name="headerStyle"
        :span-method="daySpan"
        fixed
        class="fn-mt10"
        border
        @cell-click="dayDblclick">
        <el-table-column
          prop="carPlateNo"
          fixed
          label="车辆概况"
          align="center"
          min-width="150"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span
              :style="formatState(scope.row.color)"
              class="roundState"/>
            <span
              class="add-hander"
              style="margin-left:15px;">{{ scope.row.carPlateNo }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-for="i in daycount"
          :label="days[i-1]"
          :key="i"
          :formatter="dayFormat"
          align="center"
          prop="i"
          min-width="60"/>
      </el-table>
    </div>

    <!-- 新建/编辑弹出框start -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogFormVisible"
      width="50%"
      @closed="resetDialog">
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right">
        <el-form-item
          class="fn-ml30"
          label="车辆状态："
          prop="carSchedulerStatus">
          <el-radio-group v-model="form.carSchedulerStatus">
            <el-radio :label="20">市场活动</el-radio>
            <el-radio :label="30">维修中</el-radio>
            <el-radio :label="40">预留（不可预约）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          class="fn-ml30"
          label="时段："
          prop="datePeriod">
          <el-date-picker
            v-model="formDatePeriod"
            :picker-options="pickerOptions1"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"/>
        </el-form-item>
        <el-form-item
          class="fn-ml30"
          label="备注："
          prop="remark">
          <el-input
            v-model="form.remark"
            :row="3"
            type="textarea"
            placeholder="请输入内容"
            maxlength="50"/>
        </el-form-item>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button
          v-if="form.id !== null && form.id !== ''"
          @click="deleteById('form')">删 除
        </el-button>
        <el-button
          type="primary"
          @click="saveForm('form')">确 定
        </el-button>
      </div>
    </el-dialog>

    <!-- 车辆新建/编辑弹出框start -->
    <el-dialog
      :title="carDialogTitle"
      :visible.sync="carDialogFormVisible"
      width="50%"
      @closed="resetDialog">
      <el-form
        ref="carForm"
        :model="carForm"
        :rules="carRules"
        label-width="100px"
        label-position="right">
        <el-form-item
          class="fn-ml30"
          label="VIN"
          prop="vinCode">
          <el-input
            v-model="carForm.vinCode"
            maxlength="17"
            minlength="17"/>
        </el-form-item>
        <el-form-item
          class="fn-ml30"
          label="颜色"
          prop="color">
          <el-select
            v-model="carForm.color"
            placeholder="请选择">
            <el-option
              v-for="item in colorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item
          class="fn-ml30"
          label="座位数"
          prop="seatCount">
          <el-radio-group v-model="carForm.seatCount">
            <el-radio :label="6">6座</el-radio>
            <el-radio :label="7">7座</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          class="fn-ml30"
          label="车牌号"
          prop="carPlateNo">
          <el-input
            v-model="carForm.carPlateNo"
            maxlength="7"
            minlength="7"/>
        </el-form-item>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer">
        <el-button @click="carDialogFormVisible = false">取 消</el-button>
        <el-button
          v-if="carForm.id !== null && carForm.id !== ''"
          @click="deleteCarById('carForm')">删 除
        </el-button>
        <el-button
          type="primary"
          @click="saveCarForm('carForm')">确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import drivecar from './drivecar'

export default drivecar
</script>

<style scoped lang="scss">
  @import "./drivecar.scss";
</style>
