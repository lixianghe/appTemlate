import { getData } from '../../utils/httpOpt/http'
const app = getApp()

Page({
  data: {
    screen: app.globalData.screen,
    lalyLtn: {icon: '/images/zjst.png'},
    info: [],
    initPgae: false
  },
  // 跳转到最近收听页面
  tolatelyListen () {
    wx.navigateTo({
      url: '../latelyListen/latelyListen?a=1'
    })
  },
  // 跳转到播放详情界面
  linkAbumInfo (e) {
    let id = e.currentTarget.dataset.id
    let indexData = wx.getStorageSync('indexData') || []
    const no = e.currentTarget.dataset.no
    const src = e.currentTarget.dataset.src.replace('==', '$')
    if (indexData.filter(v => v.id === id).length === 0) {
      let item = app.globalData.indexData.filter(obj => obj.id === id)[0]
      indexData.push(item)
    }
    wx.setStorageSync('indexData', indexData)
    wx.navigateTo({
      url: `../abumInfo/abumInfo?id=${id}&no=${no}&src=${src}`
    })
  },
  onLoad(options) {
    // 数据请求
    const promise = getData('index', {})
    promise.then(res => {
      this.setData({
        info: res
      })
    })
  },
  onShow() {
    this.setData({
      initPgae: true
    })
  },
  onHide() {
    this.setData({
      initPgae: false
    })
  }
})