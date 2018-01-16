<template>
  <div class="header">
    <div class="content-wrapper">
      <div class="avatar">
        <img width="64" height="64" v-bind:src="seller.avatar" >
      </div>
      <div class="content">
        <div class="title">
          <span class="brand" ></span>
          <span class="name">{{seller.name}}</span>
        </div>
        <div class="description">
          {{seller.description}}/{{seller.deliveryTime}}分钟送达
        </div>
        <div class="support" v-if="seller.supports">
          <span class="icon" v-bind:class="classMap[seller.supports[0].type]"></span>
          <span class="text">{{seller.supports[0].description}}</span>
        </div>
      </div>
      <div class="support-count" v-if="seller.supports" v-on:click="detailShow">
        <span class="count">{{seller.supports.length}}个</span>
        <i class="icon-keyboard_arrow_right"></i>
      </div>
    </div>
    <div class="bulletin-wrapper" v-on:click="showDetailFlag=true">
      <span class="bulletin-icon"></span><span class="text" v-text="seller.bulletin"></span>
      <i class="icon-keyboard_arrow_right"></i>
    </div>
    <div class="background">
      <img v-bind:src="seller.avatar" alt="">
    </div>
    <transition name="fade">
      <div class="detail" v-show="showDetailFlag" >
        <div class="detail-wrapper clearfix">
          <div class="detail-main">
            <h1 class="title" v-text="seller.name"></h1>
            <div class="star-wrapper">
              <star :size="48" :score="seller.score"></star>
            </div>
            <div class="title">
              <div class="line"></div>
              <div class="text">优惠信息</div>
              <div class="line"></div>
            </div>
            <div class="supports" >
              <div class="support" v-if="seller.supports" v-for="support in seller.supports">
                <span class="icon" v-bind:class="classMap[support.type]"></span>
                <span class="text">{{support.description}}</span>
              </div>
            </div>
            <div class="title">
              <div class="line"></div>
              <div class="text">商家公告</div>
              <div class="line"></div>
            </div>
            <div class="bulletin" >
              <p class="text" >{{seller.bulletin}}</p>
            </div>
          </div>
        </div>
        <div class="detail-close" v-on:click="showDetailFlag=false">
          <i class="icon-close"></i>
        </div>
      </div>
    </transition>

  </div>
</template>
<script type="text/ecmascript-6">
  import star from '../star/star.vue';
  export default {
      props: {
          seller: {
              type: Object  // 引入为该页面所用，在此接收后才能使用
          }
      },
      data() {
          return {
            showDetailFlag: false
          };
      },
      methods: {
          detailShow: function() {
            this.showDetailFlag = true;
          }
      },
      created() {
          this.classMap = ['decrease', 'discount', 'guarantee', 'invoice', 'special'];
      },
      components: {
        'star': star     // 先导入star.vue，再在此处注册组件,然后在template中的star绑定数据，最后在star.vue props中接收数据
      }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import '../../common/stylus/mixin.styl'
  .header
    position :relative
    background :rgba(7,17,27,0.5)
    color: #fff
    overflow: hidden
    .content-wrapper
      position :relative
      padding:24px 12px 18px 24px
      font-size :0
      .avatar
        display :inline-block
        vertical-align: top
        margin-right :16px
        img
          border-radius :2px
      .content
        display :inline-block
        .title
          margin: 2px 0 8px 0
          .brand
            display :inline-block
            vertical-align :top
            width :30px
            height: 18px
            bg-image('brand')
            background-size: 30px 18px
            background-repeat: no-repeat
          .name
            display :inline-block
            margin-left:6px
            font-size :16px
            font-weight :bold
            line-height :18px
        .description
          font-size: 12px
          font-weight :200
          line-height :12px
        .support
          margin: 10px 0 2px 0
          .icon
            display :inline-block
            vertical-align :top
            width: 12px
            height :12px;
            background-size :12px 12px
            background-repeat :no-repeat
            &.decrease
              bg-image(decrease_2)
            &.discount
              bg-image(discount_2)
            &.guarantee
              bg-image(guarantee_2)
            &.invoice
              bg-image(invoice_2)
            &.special
              bg-image(special_2)
          .text
            margin-left: 4px
            font-size :10px
            font-weight :200
            line-height:12px

      .support-count
        position: absolute;
        padding: 0 8px;
        height: 24px;
        line-height: 24px;
        background: rgba(0,0,0,0.2);
        border-radius: 14px;
        right: 12px;
        bottom: 14px;
        .count
          font-size: 10px;
          font-weight: 200;
        .icon-keyboard_arrow_right
          margin-left: 2px;
          font-size :10px

    .bulletin-wrapper
      padding:0 22px 0 12px
      position: relative;
      background :rgba(7,17,27,0.2)
      height :28px
      line-height :28px
      white-space :nowrap
      overflow :hidden
      text-overflow: ellipsis
      .bulletin-icon
        display :inline-block
        width: 22px
        height :12px
        vertical-align :top
        bg-image('bulletin')
        background-size :22px 12px
        background-repeat :no-repeat
        margin-top: 8px;
      .text
        font-size: 10px
        margin: 0 4px
        vertical-align :top
      .icon-keyboard_arrow_right
        position :absolute
        right :12px
        top:7px
        font-size :10px

    .background
      width :100%;
      height :100%
      position :absolute
      top: 0
      left: 0
      z-index :-1
      filter: blur(10px);
      img
        width :100%
        height: 100%
    .detail
      position: fixed
      z-index :100
      left: 0
      top: 0
      width :100%
      height :100%
      overflow :auto
      color: #fff
      backdrop-filter :blur(10px)  /* 只有苹果手机支持 */
      background :rgba(7,17,27,0.8)
      &.fade-enter-active,&.fade-leave-active
        transition : all 0.2s ease
      &.fade-enter,&.fade-leave-to
        opacity :0
        background-color: rgba(7, 17, 27, 0)
      .detail-wrapper
        min-height :100%
        width: 100%;
        .detail-main
          margin-top: 64px
          padding-bottom: 64px
          height: 100%;

          & > h1
            text-align :center
            font-size :16px
            line-height :16px
            font-weight :700
          .star-wrapper
            text-align :center
            margin-top: 16px
            padding:2px 0
          .title
            display :flex
            justify-content :space-around
            margin: 28px auto 24px
            width :80%  /* 没有写死 */
            .text
              padding: 0 12px
              font-size :14px
              font-weight :700
            .line
              flex: 1  /* 两条线等分剩余空间 */
              position: relative
              top: -6px
              border-bottom: 1px solid rgba(255,255,255,0.2)
          .supports
            width :80%
            margin: 0 auto
            padding: 0 12px
            .support
              padding: 12px 12px 0;
              font-size :0
              &:first-child
                padding-top:0
              .icon
                display :inline-block
                vertical-align :top
                width: 16px
                height :16px;
                background-size :16px 16px  /* 勿忘*/
                background-repeat :no-repeat
                margin-right :6px
                &.decrease
                  bg-image(decrease_1)
                &.discount
                  bg-image(discount_1)
                &.guarantee
                  bg-image(guarantee_1)
                &.invoice
                  bg-image(invoice_1)
                &.special
                  bg-image(special_1)
              .text
                color: #fff
                line-height :16px
                font-size :12px
                font-weight :200

          .bulletin
            width :80%
            margin: 0 auto
            .text
              padding: 0 12px
              line-height :24px
              font-size :12px
              font-weight :200
              color: #fff
      .detail-close
        position :relative
        width :32px
        height :32px
        font-size :32px
        margin: -64px auto 0
        /*由于内容满屏，所以关闭按钮margin为负值*/
        clear :both
        .icon-close
          color:rgba(255,255,255,0.5)










</style>
