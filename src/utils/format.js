const format = {
  round(value, exp) {
    const p = (typeof exp === 'undefined' ? -2 : exp)
    const abs = Math.abs(p)
    let val = this.decimalAdjust('round', value, p)
    val = val.toFixed(abs)
    return val
  },
  /**
    * Decimal adjustment of a number.
    *
    * @param {String}  type  The type of adjustment.
    * @param {Number}  value The number.
    * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
    * @returns {Number}      The adjusted value.
    */
  decimalAdjust(type, v, p) {
    // If the exp is undefined or zero...
    if (typeof p === 'undefined' || +p === 0) {
      return Math[type](v)
    }
    let value = +v
    const exp = +p
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN
    }
    // Shift
    value = value.toString().split('e')
    // eslint-disable-next-line
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e')
    // eslint-disable-next-line
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  },
  dateToString(date, pattern) {
    let value = date
    let fmt = pattern
    if (!value) {
      return ''
    }
    if (!value.getMonth) {
      value = new Date(value)
    }
    const o = {
      'M+': value.getMonth() + 1, // 月份
      'd+': value.getDate(), // 日
      'h+': value.getHours(), // 小时
      'm+': value.getMinutes(), // 分
      's+': value.getSeconds(), // 秒
      'q+': Math.floor((value.getMonth() + 3) / 3), // 季度
      S: value.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (`${value.getFullYear()}`).substr(4 - RegExp.$1.length))
    }
    Object.keys(o).forEach((k) => {
      if (new RegExp(`(${k})`).test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length))) }
    })
    return fmt
  },
  countdown(payDeadlineTimeSpan) {
    const minute = payDeadlineTimeSpan / 1000 / 60
    let result = ''
    const getHour = function(innerMinute) {
      const hour = parseInt(innerMinute / 60, 10)
      const m = parseInt(innerMinute % 60, 10)
      return `${hour}小时${m}分`
    }
    if (minute <= 60) {
      result = `${parseInt(minute, 10)}分`
    } else if (minute <= 1440) {
      result = getHour(minute)
    } else {
      const day = parseInt(minute / 1440, 10)
      const rest = getHour(minute % 1440, 10)
      // todo有问题吧
      result = `${day}天${rest}`
    }
    return result
  },
  getUrlParam(name) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`)
    const r = window.location.search.substr(1).match(reg)
    if (r != null) {
      return decodeURI(r[2])
    }
    return null
  },
  /**
     * 将字符串中的部分内容以星号替代
     */
  transformAsterisk(pValue) {
    let value = pValue
    if (value) {
      value = String(value).replace(/^\s*|\s*$/g, '')
    } else {
      // throw new Error('缺少value参数');
      return ''
    }
    if (/^(\d{1})(\*{13}|\*{16})(\d{1}|x{1}|X{1})$/.test(value)) {
      return value
    }
    if (value && /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value)) {
      return value.replace(/^(\d{1})(\d{13}|\d{16})(\d{1}|x{1}|X{1})$/, value.length === 15 ? '$1*************$3' : '$1****************$3')
    }
    return ''
  },

  yuanToFen(yuan) {
    yuan = Number(yuan)
    if (yuan === 0) {
      return 0
    }
    if (!yuan || yuan < 0) {
      return 0
    }
    return this.accMul(yuan, 100)
  },
  accMul(arg1, arg2) {
    let m = 0; const s1 = arg1.toString(); const
      s2 = arg2.toString()
    try {
      m += s1.split('.')[1].length
      // eslint-disable-next-line no-empty
    } catch (e) {
    }
    try {
      m += s2.split('.')[1].length
      // eslint-disable-next-line no-empty
    } catch (e) {
    }
    // eslint-disable-next-line no-restricted-properties
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
  },
  fenToYuan(fen) {
    fen = Number(fen)
    if (fen === 0) {
      return 0
    }
    if (!fen || fen < 0) {
      return 0
    }
    return this.accMul(fen, 0.01)
  },
  display(yuan, scale, symbol) {
    const smb = symbol ? '￥' : ''
    if (yuan == null) {
      return ''
    }
    let str = Number(yuan)
    if (str === 0) {
      return `${smb}0.00`
    }
    if (!str || str < 0) {
      return ''
    }

    // if (f) {
    //     s = s * 0.01;
    // }
    // str = str * 0.01;
    scale = scale >= 0 && scale <= 20 ? scale : 2
    // var n = 2;
    // eslint-disable-next-line
        str = `${parseFloat((`${str}`).replace(/[^\d\.-]/g, '')).toFixed(scale)}`;
    const l = str.split('.')[0].split('').reverse()

    const r = str.split('.')[1]
    let t = ''
    for (let i = 0; i < l.length; i++) {
      t += l[i] + ((i + 1) % 3 === 0 && (i + 1) !== l.length ? ',' : '')
    }
    const left = t.split('').reverse().join('')
    const result = r ? `${left}.${r}` : left
    return result ? smb + result : ''
  },
  displayFen(fen, symbol) {
    const yuan = this.fenToYuan(fen)
    return this.display(yuan, 2, symbol || true)
  }

}
export default format
