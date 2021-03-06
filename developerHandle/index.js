/**
 * @name: index
 * 开发者编写的首页index,配置（labels）的类型，通过切换（selectTap）获取不同类型列表
 * 这里开发者必须提供的字段数据(数据格式见听服务小场景模板开发说明文档)：
 * labels: [
 *   {id: 'xxx', name: 'xxx'},  // 必填字段
 * ]
 * 2、_getList函数，这里我们给开发者提供labels对应点击的的值，其余参数开发者自行添加；
 *    _getList函数获取的list最终转换为模板需要的字段，并setData给info。
 * 3、由于模板内的字段名称可能和后台提供不一样，在获取list后重新给模板内的字段赋值：如下以本页列表数据为例
 * list.map((item, index) => {
      item.title = item.mediaName                               // 歌曲名称
      item.id = item.mediaId                                    // 歌曲Id
      item.src = item.coverUrl                                  // 歌曲的封面
      item.contentType = 'album'                                // 类别（例如专辑或歌曲）
      item.isVip = true                                         // 是否是会员
    })
 * 4、配置页面的快捷入口
 * lalyLtn：[
      {icon: '/images/zjst.png', title: "最近收听", name: 'latelyListen', islogin:false},
    ]
 */
const app = getApp()
import { layout, layoutGroup, fm, mediaUrlList } from '../utils/httpOpt/api'

module.exports = {
  data: {
    // 开发者注入快捷入口数据
    lalyLtn: [
      {icon: '/images/zjst.png', title: "最近收听", name: 'latelyListen', islogin: true},
      {icon: '/images/icon_collect.png', title: "我喜欢的", name:'like', islogin: true}
    ],
    // 开发者注入模板页面数据
    info: [],
    // 开发者注入模板标签数据
    labels: [],

    countPic: '/images/media_num.png',
    reqS: false,
    reqL: false,
    scrollLeft: 0,
  },
  // 页面后台数据(不参与渲染)
  pageData: {
    pageName: 'index',
    pageType: 'tab',
    pageLoaded: false,
    // 各频道列表页码，根据groupId获取
    pageNum: 1,
    hasNext: true,
  },
  onShow() {
    if(app.globalData.indexData.length > 0) {
      
    }
  },
  onLoad(options) {
    let intervalTime = 600
    let nowTime =new Date().getTime()
    if (nowTime - this.data.lastTime1 > intervalTime || !this.data.lastTime) {
      this.initLoad()
      this.data.lastTime1 = nowTime;
    }else{
      console.log('小于间隔秒数')    
    }
  },
  onReady() {

  },
  initLoad() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    let { groupId } = currentPage.options;
    this.getFm()
    // 接入凯叔频道数据
    layoutGroup().then(res => {
      const formatData = res.map((item, idx) => {
        let obj = {
          id: item.groupId,
          name: item.groupTitle,
          type: item.groupType,
          groupTitleConfig: item.groupTitleConfig
        }
        return obj
      })
      this.setData({
        labels: formatData,
        reqS: true
      })
      if(groupId){
        this.setData({
          currentTap: formatData.findIndex(item=>item.id == groupId)
        })
      }
      this._getList(groupId?Number(groupId):formatData[0].id)
    }).catch(err => {
      console.log(JSON.stringify(err))
    })
  },



  // 点击切换频道
  selectTap(e) {
    let intervalTime = 600
    let nowTime =new Date().getTime()
    const index = e.currentTarget.dataset.index
    const id = e.currentTarget.dataset.groupid
    this.setData({
      currentTap: index,
      retcode: 0,
      scrollLeft: 0
    })
    if (nowTime - this.data.lastTime > intervalTime || !this.data.lastTime) {
      wx.showLoading({
        title: '加载中',
      })
      this.setData({
        info:[]
      },()=>{
        this._getList(id)
        this.data.lastTime = nowTime;
      })
    }else{
      console.log('小于间隔秒数')    
    }
  },



  // 跳转到快捷入口界面
  tolatelyListen (e) {
    const index = e.currentTarget.dataset.index
    let page = e.currentTarget.dataset.page
    

    if ((!app.userInfo || !app.userInfo.token) && this.data.lalyLtn[index].islogin) {
      wx.showToast({ icon: 'none', title: '请登录后进行操作' })
      return;
    }
    wx.navigateTo({
      url: `../${page}/${page}`
    })
  },
  // 跳转到播放详情界面
  linkAbumInfo (e) {
    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    const routeType = e.currentTarget.dataset.contentype
    // 静态实现最近收听
    if (!app.globalData.latelyListenId.includes(id)) {
      app.globalData.latelyListenId.push(id)
    }
    let url
    if (routeType === 'album' || routeType === 'fm') {
      url = `../albumInfo/albumInfo?id=${id}&title=${title}&routeType=${routeType}`
      wx.navigateTo({
        url: url
      })
    } else if (routeType === 'media') {
      let opt = {
        mediaId: id,
        contentType: 'story'
      }
      mediaUrlList(opt).then(res2 => {
        let canplay = res2.mediaPlayVoList
        canplay.map((item, index) => {
          item.title = item.mediaName
          item.id = item.mediaId
          item.dt = item.timeText
          item.coverImgUrl = item.coverUrl
          item.dataUrl = item.mediaUrl
        })
        
        wx.setStorageSync('canplay',canplay)
        url = `../playInfo/playInfo?id=${id}`
        wx.navigateTo({
          url: url
        })
      })
    }
    
    
  },
  _getList(id) {
    // 接入凯叔列表数据
    let params = {groupId: id, pageNum: this.pageData.pageNum}
    layout(params).then(res => {
      let layoutData = []
      if (Number(id) === 1) {
        layoutData = [{
          id: '00',
          title: '电台',
          src: '/images/fm.jpg',
          contentType: 'fm',
          count: '',
          isVip: false
        }]
      } else {
        layoutData = []
      }
      
      res.list.forEach(v => {
        v.content.forEach(item => {
          layoutData.push({
            id: item.album ? item.album.albumId : item.media.mediaId,
            title: item.album ? item.album.albumName : item.media.mediaName,
            src: item.coverUrl,
            contentType: item.contentType,
            count: item.album ? item.album.mediaCount : '',
            isVip: item.contentType == 'media' ? (item[item.contentType].feeType == '01' && item[item.contentType].auditiDuration === 0) : item[item.contentType].feeType == '01' && (item[item.contentType].product || item[item.contentType].product && [2, 3].indexOf(item[item.contentType].product.vipLabelType) < 0)
          })
        })

      })
      this.setData({
        info: layoutData.map(item=>{
          item.src = app.impressImg(item.src,300,300)
          return item
        }) || [],
        reqL: true
      })
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      console.log(JSON.stringify(err))
    })
  },
  // 懒加载
  getLayoutData() {

  },
  // 首页获取fm
  async getFm() {
    // wx.showLoading({
    //   title: '加载中',
    // })
    try {
      let res = await fm()
      let [fmList, idList, auditionDurationList] = [[], [], []]
      // 处理字段不一样的情况
      res.list.map((item) => {
        idList.push(item.mediaId)
        auditionDurationList.push(item.auditionDuration)
      })
      // 获取带url的list
      let opt = {
        mediaId: idList.toString(),
        contentType: 'story'
      }
      let res2 = await mediaUrlList(opt)
      fmList = res2.mediaPlayVoList
      fmList.map((item, index) => {
        item.title = item.mediaName
        item.id = item.mediaId
        item.dt = item.timeText
        item.coverImgUrl = item.coverUrl
        item.auditionDuration = auditionDurationList[index]
        item.dataUrl = item.mediaUrl
      })
      // console.log(fmList)
      wx.setStorageSync('fmList',fmList)
    } catch (error) {
      wx.setStorageSync('fmList',[])
    }
  },
  // 打乱数组，返回
  randomList(arr) {
    let len = arr.length;
    while (len) {
      let i = Math.floor(Math.random() * len--);
      [arr[i], arr[len]] = [arr[len], arr[i]];
    }
    return arr;
  },
}