/**
 * @name: playInfo
 * 开发者编写的播放中,通过歌曲id获取歌曲的uel相关信息，id在onLoad的options.id取
 * 这里开发者需要：
 * 1、通过歌曲id获取歌曲详情，由于模板内的字段名称可能和后台提供不一样，在获取歌曲详情后重新给模板内的字段赋值：如下
 *  songInfo.src = data.mediaUrl                          // 音频地址
 *  songInfo.title = data.mediaName                       // 音频名称
 *  songInfo.id = params.mediaId                          // 音频Id
 *  songInfo.dt = data.timeText                           // 音频时常
 *  songInfo.coverImgUrl = data.coverUrl                  // 音频封面
 * 2、重新赋值后setData给songInfo，并且存在Storage缓存中
 * 3、赋值后执行this.play()来播放歌曲
 * 4、其他模板外的功能开发者在这个文件自行开发
 */
const app = getApp()
import { mediaPlay, mediaFavoriteAdd, mediaFavoriteCancel, isFavorite, saveHistory } from '../utils/httpOpt/api'

module.exports = {
  data: {
    showModal: false,               // 控制弹框
    content: '该内容为会员付费内容，您需要先成为会员后再购买此内容就可以收听精品内容啦',
    // 播放详情页面按钮配置
    playInfoBtns: [
      {
        name: 'pre',                                             // 上一首
        img: '/images/pre2.png',                                 // 上一首对应的图标
      },
      {
        name: 'toggle',                                          // 播放/暂停
        img: {
          stopUrl: '/images/stop2.png' ,                         // 播放状态的图标
          playUrl: '/images/play2.png'                           // 暂停状态的图标
        }
      },
      {
        name: 'next',                                             // 下一首
        img: '/images/next2.png'                                  // 下一首对应的图标
      },
      {
        name: 'like',                                             // 收藏
        img: {
          noLike: '/images/info_like_no.png' ,                    // 未收藏的图标
          liked: '/images/info_like.png'                          // 已收藏的图标
        }
      },
      {
        name: 'loopType',                                         // 循环模式
        img: {
          listLoop: '/images/listLoop.png' ,                      // 列表循环对应的图标
          singleLoop: '/images/singleLoop.png',                   // 单曲循环对应的图标
          shufflePlayback: '/images/shufflePlayback.png'          // 随即循环对应的图标
        }
      },
      {
        name: 'more',                                             // 弹出播放列表
        img: '/images/more2.png'                                  // 弹出播放列表对应的图标
      }
    ]
  },
  async onLoad(options) {
    // 拿到歌曲的id: options.id
    let getInfoParams = {mediaId: options.id || wx.getStorageSync('songInfo').id, contentType: 'story'}

    
    Promise.all([
      // this.isFavorite(isFavoriteParams),          // 是否被收藏
      this.getMedia(getInfoParams)                 // 获取歌曲详情
    ]).then((value)=> {
      // if(this.needFee()) return                            // 检测是否是付费的
      this.play()                                 // 播放歌曲
    })
  },
  // 通过mediaId获取歌曲url及详情，并增加播放历史
  async getMedia(params, that = this) {   
    const app = getApp()
    // 是否被收藏
    let res = await isFavorite(params)
    that.setData({existed: res.existed})
    // 获取歌曲                   
    let data = await mediaPlay(params)
    let songInfo = {}
    songInfo.src = data.mediaUrl
    songInfo.title = data.mediaName
    songInfo.id = params.mediaId
    songInfo.dt = data.timeText
    songInfo.coverImgUrl = data.coverUrl
    app.globalData.songInfo = Object.assign({}, app.globalData.songInfo, songInfo)
    // 如果没有src说明是要付费播放的
    if (!songInfo.src) {
      that.setData({showModal: true})
      wx.hideLoading()
      wx.stopBackgroundAudio()
    }
    that.setData({
      songInfo: songInfo
    })
    wx.setStorageSync('songInfo', songInfo)
    // 添加历史记录
    let saveHistoryParams = {
      ablumId: app.globalData.abumInfoId || songInfo.id,
      storyId: songInfo.id,
      duration: data.duration,
      playTime: 0
    }
    if (!app.userInfo || !app.userInfo.token) return
    let opt = { historys: [saveHistoryParams] }
    saveHistory(opt)
  },
  // 获取已经收藏歌曲
  async isFavorite(params, that = this) {
    if (!params.mediaId) return
    let res = await isFavorite(params)
    that.setData({existed: res.existed})
  },
  // 如果mediaUrl没有给出弹框并跳到首页
  // needFee() {
  //   if (!this.data.songInfo.src) {
  //     this.setData({showModal: true})
  //     wx.hideLoading()
  //     return true
  //   }
  // },
  // 收藏和取消收藏,playInfo和minibar用到这里
  like(that = this) {
    const app = getApp()
    let params = {mediaId: that.data.songInfo.id}
    if (!app.userInfo || !app.userInfo.token) {
      wx.showToast({ icon: 'none', title: '请登录后进行操作' })
      return;
    }
    if (that.data.existed) {
      mediaFavoriteCancel(params).then(res => {
        wx.showToast({ icon: 'none', title: '取消收藏成功' })
        that.setData({
          existed: false
        })
      })
    } else {
      mediaFavoriteAdd(params).then(res => {
        wx.showToast({ icon: 'none', title: '收藏成功' })
        that.setData({
          existed: true
        })
      })
    }
  }
}