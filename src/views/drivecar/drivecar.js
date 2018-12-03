/* eslint-disable no-loop-func */
import $ from 'jquery'
import format from '@/utils/format'
// import PageHead from '@/component/common/pagehead'
// import api from '@/chj/tsm/config/api'
// import '@/js/touch'
import { getEmployeeStore, queryDriveCarScheduler, getCarStore } from '@/api/driveCar'

const days = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31'
]

// eslint-disable-next-line
const colorOptions = [{
  value: '10',
  label: '黑色'
},
{
  value: '20',
  label: '白色'
},
{
  value: '30',
  label: '蓝色'
},
{
  value: '40',
  label: '灰色'
}
]
const GLOBAL = {
  employeeInfo: {
    employeeAccountId: '100011',
    employeeName: '周润发',
    storeCode: '100010', // 北京通州交付中心
    storeName: '望京店'
  }
}
// let daycount = '';
export default {
  name: 'chj-tsm-drivecar',
  // components: {
  //   PageHead
  // },
  data() {
    function checkVin(vinCode) {
      const re = /^[a-zA-Z0-9]{17}$/
      return re.test(vinCode)
    }
    const validateVin = function(rule, value, callback) {
      if (!checkVin(value)) {
        callback(new Error('vin码只能是数据加字母，长度为17位'))
        return
      }
      callback()
    }

    function checkCarPlateNo(carPlateNo) {
      const re = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/
      return re.test(carPlateNo)
    }
    const validateCarPlateNo = function(rule, value, callback) {
      if (!checkCarPlateNo(value)) {
        callback(new Error('请输入正确的车牌号'))
        return
      }
      callback()
    }
    return {
      daycount: '',
      loading: false,
      dialogFormVisible: false,
      dialogTitle: '',
      carDialogFormVisible: false,
      carDialogTitle: '',
      days,
      carData: [],
      colorOptions,
      loginUserStoreList: [],
      formDatePeriod: [],
      form: {
        id: null,
        carSchedulerStatus: null,
        datePeriod: null,
        remark: null,
        beginDate: null,
        endDate: null,
        createUser: null,
        createUserName: null
      },
      carForm: {
        id: null,
        vinCode: null,
        seatCount: null,
        carPlateNo: null,
        createUser: null,
        createUserName: null
      },
      search_group: {
        active: 'active',
        btn_disabled: false,
        storeCode: '100010',
        searchMouth: format.dateToString(new Date(), 'yyyy-MM')
      },
      rules: {
        carSchedulerStatus: [{
          required: true,
          message: '请选择车辆状态',
          trigger: 'blur'
        }],
        datePeriod: [{
          required: true,
          message: '请选择预约时段',
          trigger: 'blur'
        }]
      },
      carRules: {
        vinCode: [{
          required: true,
          validator: validateVin,
          trigger: 'change'
        }],
        color: [{
          required: true,
          message: '请选择颜色',
          trigger: 'blur'
        }],
        seatCount: [{
          required: true,
          message: '请输入座位数',
          trigger: 'blur'
        }],
        carPlateNo: [{
          required: true,
          validator: validateCarPlateNo,
          trigger: 'blur'
        }]
      },
      pickerOptions1: {
        disabledDate(time) {
          let resultDate
          let year
          let month
          const currDate = new Date()
          year = currDate.getFullYear()
          month = currDate.getMonth() + 1
          const date = currDate.getDate()
          const hms = `${currDate.getHours()}:${currDate.getMinutes()}:${
            currDate.getSeconds() < 10
              ? `0${currDate.getSeconds()}`
              : currDate.getSeconds()
          }`
          switch (month) {
            case 10:
            case 11:
            case 12:
              month -= 9
              year++
              break
            default:
              month += 3
              break
          }
          month = month < 10 ? `0${month}` : month
          resultDate = `${year}-${month}-${date} ${hms}`
          resultDate = new Date(resultDate).valueOf()
          return (
            time.getTime() < Date.now() - 3600 * 1000 * 24 ||
                        time.getTime() > resultDate
          )
        },
        onPick(t) {
          const start = this.value[0]
          const end = t.minDate
          const today = new Date() - 3600 * 1000 * 24
          if (end.getTime() > today && start < today) {
            this.$emit('pick', [start, end])
          }
        }
      }
    }
  },
  created() {
    console.log(111111111111)
    this.getLoginUserStore()
    this.queryEmployeeStore()
  },
  methods: {
    // 解决对话框input键盘遮挡问题
    resetDialog() {
      // 重置dialog的class名（去除dialog-margin名）
      $('.el-dialog').each((i, element) => {
        $(element).css('margin-top', '15vh')
      })
    },
    getSchedulerDayData(scheduler) {
      const _this = this
      const date = new Date(_this.search_group.searchMouth)
      const y = date.getFullYear()
      const m = date.getMonth()
      const firstDate = new Date(y, m, 1)
      const lastDate = new Date(y, m + 1, 0)
      let beginDate = scheduler.beginDate
      let endDate = scheduler.endDate
      if (firstDate.getTime() > new Date(beginDate).getTime()) {
        beginDate = format.dateToString(firstDate, 'yyyy-MM-dd')
      }
      if (lastDate.getTime() < new Date(endDate).getTime()) {
        endDate = format.dateToString(lastDate, 'yyyy-MM-dd')
      }
      const beginDay = beginDate
        .substr(beginDate.length - 2)
        .replace(/\b(0+)/gi, '')
      const endDay = endDate
        .substr(endDate.length - 2)
        .replace(/\b(0+)/gi, '')
      return [beginDay, endDay]
    },
    daySpan({
      row,
      columnIndex
    }) {
      const _this = this
      // eslint-disable-next-line
            for (const cars of _this.carData) {
        const carno = cars.carPlateNo
        if (
          carno === row.carPlateNo &&
                    cars.turDriveCarSchedulerToList !== undefined
        ) {
          // 记录已预约车辆的天数
          let schedulerDayCount = 0
          for (
            let i = 0; i < cars.turDriveCarSchedulerToList.length; i++
          ) {
            const scheduler = cars.turDriveCarSchedulerToList[i]
            const schedulerDayInfo = _this.getSchedulerDayData(
              scheduler
            )
            const beginDay = schedulerDayInfo[0]
            const endDay = schedulerDayInfo[1]
            if (i > 0) {
              const schedulerBeforeInfo = _this.getSchedulerDayData(
                cars.turDriveCarSchedulerToList[i - 1]
              )
              schedulerDayCount +=
                                schedulerBeforeInfo[1] - schedulerBeforeInfo[0]
            }
            if (
              Number(beginDay) ===
                            Number(columnIndex) + Number(schedulerDayCount)
            ) {
              return [1, Number(endDay) - Number(beginDay) + 1]
            }
          }
        }
      }
      return false
    },
    cellStyle({
      row,
      columnIndex
    }) {
      const _this = this
      // eslint-disable-next-line
            for (const cars of _this.carData) {
        const carno = cars.carPlateNo
        if (
          carno === row.carPlateNo &&
                    cars.turDriveCarSchedulerToList !== undefined
        ) {
          let schedulerDayCount = 0
          for (
            let i = 0; i < cars.turDriveCarSchedulerToList.length; i++
          ) {
            const scheduler = cars.turDriveCarSchedulerToList[i]
            const schedulerDayInfo = _this.getSchedulerDayData(
              scheduler
            )
            const beginDay = schedulerDayInfo[0]
            if (i > 0) {
              const schedulerBeforeInfo = _this.getSchedulerDayData(
                cars.turDriveCarSchedulerToList[i - 1]
              )
              schedulerDayCount +=
                                schedulerBeforeInfo[1] - schedulerBeforeInfo[0]
            }
            // carSchedulerStatus: 20市场活动 30维修中 40预留
            if (
              Number(beginDay) ===
                            Number(columnIndex) + Number(schedulerDayCount)
            ) {
              if (scheduler.carSchedulerStatus === 20) {
                return 'color1'
              }
              if (scheduler.carSchedulerStatus === 30) {
                return 'color2'
              }
              if (scheduler.carSchedulerStatus === 40) {
                return 'color3'
              }
            }
          }
        }
      }
      return false
    },
    dayFormat(row, column) {
      const _this = this
      // eslint-disable-next-line
            for (const cars of _this.carData) {
        const carno = cars.carPlateNo
        if (
          carno === row.carPlateNo &&
                    cars.turDriveCarSchedulerToList !== undefined
        ) {
          let schedulerDayCount = 0
          for (
            let i = 0; i < cars.turDriveCarSchedulerToList.length; i++
          ) {
            const scheduler = cars.turDriveCarSchedulerToList[i]
            const schedulerDayInfo = _this.getSchedulerDayData(
              scheduler
            )
            const beginDay = schedulerDayInfo[0]
            if (i > 0) {
              const schedulerBeforeInfo = _this.getSchedulerDayData(
                cars.turDriveCarSchedulerToList[i - 1]
              )
              schedulerDayCount +=
                                schedulerBeforeInfo[1] - schedulerBeforeInfo[0]
            }
            // const columnindex = column.label.substr(0, column.label.length - 1);
            const columnindex = column.label
            if (
              Number(beginDay) ===
                            Number(columnindex) + Number(schedulerDayCount)
            ) {
              if (scheduler.carSchedulerStatus === 20) {
                return '市场活动'
              }
              if (scheduler.carSchedulerStatus === 30) {
                return '维修中'
              }
              if (scheduler.carSchedulerStatus === 40) {
                return '预留(不可预约)'
              }
            }
          }
        }
      }
      return false
    },
    dayDblclick(row, column, cell, event) {
      const _this = this
      if (
        event.target.textContent !== '' &&
                column.property === 'carPlateNo'
      ) {
        // 修改车辆
        _this.carDialogFormVisible = true
        _this.carDialogTitle = '修改车辆信息'
        _this.carForm = row
      } else if (
        event.target.textContent !== '' &&
                column.property !== 'carPlateNo'
      ) {
        // 修改预约信息
        _this.dialogFormVisible = true
        _this.dialogTitle = row.carPlateNo
        let schedulerDayCount = 0
        for (
          let i = 0; i < row.turDriveCarSchedulerToList.length; i++
        ) {
          const scheduler = row.turDriveCarSchedulerToList[i]
          const schedulerDayInfo = _this.getSchedulerDayData(
            scheduler
          )
          const beginDay = schedulerDayInfo[0]
          if (i > 0) {
            const schedulerBeforeInfo = _this.getSchedulerDayData(
              row.turDriveCarSchedulerToList[i - 1]
            )
            schedulerDayCount +=
                            schedulerBeforeInfo[1] - schedulerBeforeInfo[0]
          }
          // const columnindex = column.label.substr(0, column.label.length - 1);
          const columnindex = column.label
          if (
            Number(beginDay) ===
                        Number(columnindex) + Number(schedulerDayCount)
          ) {
            const dayarray = []
            dayarray[0] = scheduler.beginDate
            dayarray[1] = scheduler.endDate
            scheduler.datePeriod = dayarray
            _this.form = scheduler
            _this.formDatePeriod = scheduler.datePeriod
          }
        }
      } else {
        // 新增预约
        _this.dialogFormVisible = true
        _this.dialogTitle = row.carPlateNo
        const curDate = new Date()
        const stringDate = format.dateToString(
          new Date(curDate.getTime() + 24 * 60 * 60 * 1000),
          'yyyy-MM-dd'
        )
        _this.form = {
          id: null,
          carCode: row.carCode,
          carPlateNo: row.carPlateNo,
          carSchedulerStatus: null,
          datePeriod: [
            format.dateToString(curDate, 'yyyy-MM-dd'),
            stringDate
          ],
          remark: null,
          storeCode: _this.search_group.storeCode,
          beginDate: null,
          endDate: null,
          createUser: GLOBAL.employeeInfo.employeeAccountId,
          createUsername: GLOBAL.employeeInfo.employeeName
        }
        _this.formDatePeriod = [
          format.dateToString(curDate, 'yyyy-MM-dd'),
          stringDate
        ]
      }
    },
    newCar() {
      // 新增车辆
      const _this = this
      const storeCode = _this.search_group.storeCode
      if (storeCode === '' || storeCode == null) {
        _this.$message.error('没有获取到门店信息')
        return
      }
      _this.carDialogFormVisible = true
      _this.carDialogTitle = '新增车辆'
      _this.carForm = {
        id: null,
        vinCode: null,
        seatCount: null,
        carPlateNo: null,
        storeCode,
        createUser: GLOBAL.employeeInfo.employeeAccountId,
        createUsername: GLOBAL.employeeInfo.employeeName
      }
    },
    saveForm(formName) {
      const _this = this
      _this.$refs[formName].validate((valid) => {
        if (valid) {
          if (_this.form.id === null) {
            _this.save()
          } else {
            _this.update()
          }
        }
      })
    },
    save() {
      // const _this = this
      // _this.form.beginDate = _this.form.datePeriod[0]
      // _this.form.endDate = _this.form.datePeriod[1]
      // $.ajax({
      //   url: '/chj-service-tur/api/tur-drive-car-scheduler/save',
      //   type: 'POST',
      //   contentType: 'application/json; charset=utf-8',
      //   data: JSON.stringify(_this.form),
      //   dataType: 'json',
      //   success(response) {
      //     if (response.success) {
      //       _this.$message.success(response.msg)
      //       _this.dialogFormVisible = false
      //       _this.query()
      //     } else {
      //       _this.$message.error(response.msg)
      //       _this.query()
      //     }
      //   },
      //   error(response) {
      //     _this.$message.error(response.msg)
      //   }
      // })
    },
    update() {
      // const _this = this
      // _this.form.beginDate = _this.form.datePeriod[0]
      // _this.form.endDate = _this.form.datePeriod[1]
      //
      // $.ajax({
      //   url: '/chj-service-tur/api/tur-drive-car-scheduler/update',
      //   type: 'PUT',
      //   data: JSON.stringify(_this.form),
      //   contentType: 'application/json',
      //   dataType: 'json',
      //   success(response) {
      //     // 获取回调数据
      //     if (response.code === 0) {
      //       _this.$message.success(response.msg)
      //       _this.dialogFormVisible = false
      //       _this.query()
      //     } else {
      //       _this.$message.error(response.msg)
      //       _this.query()
      //     }
      //   },
      //   error(response) {
      //     _this.$message.error(response.msg)
      //   }
      // })
    },
    saveCarForm(formName) {
      const _this = this
      _this.$refs[formName].validate((valid) => {
        if (valid) {
          if (_this.carForm.id == null) {
            _this.saveCar()
          } else {
            _this.updateCar()
          }
        }
      })
    },
    saveCar() {
      // const _this = this
      //
      // $.ajax({
      //   url: '/chj-service-tur/api/tur-drive-car/save',
      //   type: 'POST',
      //   contentType: 'application/json; charset=utf-8',
      //   data: JSON.stringify(_this.carForm),
      //   dataType: 'json',
      //   success(response) {
      //     if (response.success) {
      //       _this.$message.success(response.msg)
      //       _this.carDialogFormVisible = false
      //       _this.query()
      //     } else {
      //       _this.$message.error(response.msg)
      //     }
      //   }
      // })
    },
    updateCar() {
      // const _this = this
      // $.ajax({
      //   url: '/chj-service-tur/api/tur-drive-car/update',
      //   type: 'PUT',
      //   data: JSON.stringify(_this.carForm),
      //   contentType: 'application/json',
      //   dataType: 'json',
      //   success(response) {
      //     // 获取回调数据
      //     if (response.code === 0) {
      //       _this.$message.success(response.msg)
      //       _this.carDialogFormVisible = false
      //       _this.query()
      //     } else {
      //       _this.$message.error(response.msg)
      //     }
      //   },
      //   error(response) {
      //     _this.$message.error(response.msg)
      //   }
      // })
    },
    getLoginUserStore() {
      const _this = this
      getCarStore(GLOBAL.employeeInfo.employeeAccountId).then(response => {
        console.warn('response22222:', response)
        response = response.data
        if (response.code === 0) {
          const listTurStoreTo = response.data.listTurStoreTo
          _this.loginUserStoreList = listTurStoreTo.map((i) => {
            const res = {}
            res.id = i.storeCode
            res.name = i.storeName
            return res
          })
        } else {
          this.$message.error(response.msg)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    queryEmployeeStore() {
      const _this = this
      getEmployeeStore(GLOBAL.employeeInfo.employeeAccountId).then(response => {
        response = response.data
        if (response.code === 0) {
          _this.search_group.storeCode = response.data.storeCode
          if (_this.search_group.storeCode === '') {
            _this.$message.error('没有获取到当前用户门店')
            return
          }
          _this.query()
        } else {
          _this.$message.error(response.msg)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    query() {
      const _this = this
      this.daycount = _this.mGetDate(_this.search_group.searchMouth)
      queryDriveCarScheduler(_this.search_group.storeCode, _this.search_group.searchMouth).then(response => {
        response = response.data
        console.warn('queryResponse:', response)
        if (response.code === 0) {
          _this.carData = response.data
          this.$nextTick(() => {
            _this.insertMask()
          })
        } else {
          _this.$message.error(response.msg)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    findStoreCars() {
      this.query()
    },
    mGetDate(obj) {
      const date = new Date(obj)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const d = new Date(year, month, 0)
      return d.getDate()
    },
    deleteById() {
      // const _this = this
      // _this
      //   .$confirm('确定操作吗?', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   })
      //   .then(() => {
      //     $.ajax({
      //       url: '/chj-service-tur/api/tur-drive-car-scheduler/delete/' + _this.form.id,
      //       type: 'delete',
      //       data: {},
      //       contentType: 'application/json',
      //       dataType: 'json',
      //       success(response) {
      //         // 获取回调数据
      //         if (response.code === 0) {
      //           _this.dialogFormVisible = false
      //           _this.query()
      //         } else {
      //           _this.$message.error(response.msg)
      //         }
      //       },
      //       error(response) {
      //         _this.$message.error(response.msg)
      //       }
      //     })
      //   })
      //   .catch(() => {})
    },
    // 回退到控制面板
    backDashBoardHomePage() {
      location.href = '/dash-board/to-page'
    },
    deleteCarById() {
      // const _this = this
      // _this
      //   .$confirm('确定操作吗?', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   })
      //   .then(() => {
      //     $.ajax({
      //       url: '/chj-service-tur/api/tur-drive-car/delete/' + _this.carForm.id,
      //       type: 'delete',
      //       data: {},
      //       contentType: 'application/json',
      //       dataType: 'json',
      //       success(response) {
      //         // 获取回调数据
      //         if (response.code === 0) {
      //           _this.carDialogFormVisible = false
      //           _this.query()
      //         } else {
      //           _this.$message.error(response.msg)
      //         }
      //       },
      //       error(response) {
      //         _this.$message.error(response.msg)
      //       }
      //     })
      //   })
      //   .catch(() => {})
    },
    formatState(v) {
      if (v === '10') {
        return 'background: #000000;'
      }
      if (v === '20') {
        return 'background: #eaedf1;'
      }
      if (v === '30') {
        return 'background: #00CCFF;'
      }
      if (v === '40') {
        return 'background: #A0A0A0;'
      }
      return ''
    },
    headerStyle({
      columnIndex
    }) {
      const date = format.dateToString(new Date(), 'yyyy-MM-dd')
      const _today = date.substr(date.length - 2).replace(/\b(0+)/gi, '')
      if (
        Number(_today) === Number(columnIndex) &&
                date.substr(0, date.length - 3) ===
                this.search_group.searchMouth
      ) {
        return 'bg-today'
      }
      return null
    },
    // 日期切换
    onClickDate(type) {
      let [year, month] = this.search_group.searchMouth.split('-')
      year = parseInt(year, 10)
      month = parseInt(month, 10)
      if (type === 'pre') {
        if (month !== 1) {
          month -= 1
        } else {
          year -= 1
          month = 12
        }
      }
      if (type === 'next') {
        if (month !== 12) {
          month += 1
        } else {
          year += 1
          month = 1
        }
      }
      this.search_group.searchMouth = `${year}-${month}`
      this.query()
    },
    // table 植入遮罩层，防止点击过往
    insertMask() {
      const f = $('.el-table__body-wrapper')
      const mask = $('#carMask')
      let height = 0
      let width = 0
      const date = new Date()
      const dataNow = new Date(`${date.getFullYear()}-${date.getMonth() + 1}`).getTime()
      const dateSelect = new Date(this.search_group.searchMouth).getTime()

      height = `${f.height()}px`
      if (dateSelect < dataNow) {
        width = this.$refs.carTable.bodyWidth
        f.scrollLeft(0)
      } else if (dateSelect === dataNow) {
        width = `${150 + (date.getDate() - 1) * 60}px`
        f.scrollLeft((date.getDate() - 1) * 60)
      } else {
        width = 0
        f.scrollLeft(0)
      }
      if (mask.length > 0) {
        mask.width(width)
        mask.height(height)
      } else {
        f.append(`<div id="carMask" style="position:absolute;left:0;top:0;width:${width};height:${height};background-color:rgba(0,0,0,0.3)"></div>`)
      }
    }
  },
  watch: {
    formDatePeriod(n) {
      this.form.datePeriod = n
    }
  }
}
