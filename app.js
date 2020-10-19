// var myPlugin = requirePlugin('inCar')
// var bsurl = 'http://localhost:3000/v1/'
import tool from './utils/util'

App({
  globalData: {
    // 登录相关
    userInfo: null,
    appId: '60008',
    userId: '-1',
    haveLogin: false,
    token: '',
    isNetConnected: true,
    indexData: [],
    abumInfoData: [],

    playing: false,
    percent: 0,
    curplay: {},
    globalStop: true,
    currentPosition: 0,
    canplay: []
  },
  
  
  onLaunch: function () {
    // myPlugin.injectWx(wx)
    // 关于音乐播放的
    var that = this;
    //播放列表中下一首
    wx.onBackgroundAudioStop(function () { 
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      console.log('playnext', currentPage)
      // 获取歌曲列表
      const canplay = wx.getStorageSync('canplay')
      that.cutplay(currentPage, 1, canplay)
    });
    //监听音乐暂停，保存播放进度广播暂停状态
    wx.onBackgroundAudioPause(function () {
      that.globalData.playing = false;
      wx.getBackgroundAudioPlayerState({
        complete: function (res) {
          that.globalData.currentPosition = res.currentPosition ? res.currentPosition : 0
        }
      })
    });
  },

  
  vision: '1.0.0',
  cutplay: function (that, type, list) {
    let canplay = JSON.parse(JSON.stringify(list))
    let no = this.globalData.songInfo.index
    let index
    if (type === 1) {
      index = no + 1 > canplay.length - 1 ? 0 : no + 1
    } else {
      index = no - 1 < 0 ? canplay.length - 1 : no - 1
    }
    //播放列表中下一首
    this.globalData.songInfo = canplay[index]
    //歌曲切换 停止当前音乐
    this.globalData.playing = false;
    wx.pauseBackgroundAudio();
    this.playing(this.globalData.songInfo)
    // 切完歌改变songInfo的index
    this.globalData.songInfo.index = index
    this.globalData.songInfo.dt = tool.formatduration(Number(this.globalData.songInfo.dt))
    that.setData({
      songInfo: this.globalData.songInfo,
      current: index
    })
  },
  stopmusic: function () {
    wx.pauseBackgroundAudio();
  },
  playing: function (seek, cb) {
    var that = this
    const songInfo = that.globalData.songInfo
    // console.log('mmmm', songInfo)
    wx.playBackgroundAudio({
      dataUrl: songInfo.url,
      title: songInfo.name,
      success: function (res) {
        if (seek != undefined && typeof(seek) === 'number') {
          console.log('seek', seek)
          wx.seekBackgroundAudio({ position: seek })
        };
        that.globalData.playing = true;
        cb && cb();
      },
      fail: function () {
        
      }
    })
  }
})
