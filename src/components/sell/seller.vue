<template>
  <div class="seller" ref="sellerWrapper">
    <div class="seller-content">
      <div class="section overview">
        <div class="name">{{seller.name}}</div>
        <div class="top-overview border-1px">
          <div class="rating-sell">
            <star :size="36" :rating="seller.score"></star>
            <span class="ratingCount">({{seller.ratingCount}})</span>
            <span class="sellCount">月售{{seller.sellCount}}单</span>
          </div>
          <div class="store"  @click="toggleFavorite">
            <span class="icon-favorite" :class="{'active':favorite}"></span>
            <span class="text" v-show="!favorite">收藏</span>
            <span class="text" v-show="favorite" :class="{'active':favorite}">已收藏</span>
          </div>
        </div>
        <div class="bottom-overview">
          <div class="block">
            <div class="title">起送价</div>
            <div class="text">{{seller.minPrice}}元</div>
          </div>
          <div class="block">
            <div class="title">商家配送</div>
            <div class="text">{{seller.deliveryPrice}}元</div>
          </div>
          <div class="block">
            <div class="title">平均配送时间</div>
            <div class="text">{{seller.deliveryTime}}元</div>
          </div>
        </div>

      </div>
      <split></split>
      <div class="section bulletin">
        <div class="name">公告与活动</div>
        <div class="content">{{seller.bulletin}}</div>
        <div class="supports" >
          <div class="support" v-if="seller.supports" v-for="support in seller.supports">
            <span class="icon" v-bind:class="classMap[support.type]"></span>
            <span class="text">{{support.description}}</span>
          </div>
        </div>
      </div>
      <split></split>
      <div class="section pics">
        <div class="name">商家实景</div>
        <div class="pic-wrapper" ref="picWrapper">
          <ul class="pic-list" ref="picList">
            <li class="pic" v-for="pic in seller.pics">
              <img :src="pic" width="120px" height="90px">
            </li>
          </ul>
          <!--<img class="pic" width="120" height="90" v-for="pic in seller.pics" :src="pic" alt="pic">-->
        </div>
      </div>
      <split></split>
      <div class="section infos">
        <div class="name">商家信息</div>
        <div class="infos-wrapper">
          <div class="info" v-for="info in seller.infos">{{info}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import star from '../star/star';
  import split from '../split/split';
  import BScroll from 'better-scroll';
  import {saveToLocal, loadFromLocal} from '../../common/js/store.js';
  export default {
    props: {
      seller: {
        type: Object
      }
    },
    data() {
      return {
        // 取到localstorage中的favorite
        // 立即执行函数
        favorite: (() => {
          return loadFromLocal(this.seller.id, 'favorite', false);
        })()
//         下面这种写法不行
//        favorite: function() {
//          return loadFromLocal(this.seller.id, 'favorite', false);
//        }
      };
    },
    created() {
      this.classMap = ['decrease', 'discount', 'guarantee', 'invoice', 'special'];
      // 但this.seller在created中是空 但在goods.vue和ratings.vue中的created中都不为空
      // 放在这里不起作用，所以增加watch和mounted属性
//      this.$nextTick(() => {   // 能让dom元素加载完成，但是this.seller还是空 但在goods.vue和ratings.vue中都不为空
//        this._initPics();
//      });
    },
    // seller是异步获取，最开始的seller中什么也没有
    // watch属性，观察值的变化
    // 但当切换到评论等其它页面，再切回来时，依然不能滚动
    // 这是因为每次切换，dom元素要重新渲染，但是并不再重复执行watch
    // 所以在mounted中需要再次调用_initScroll()
    // 但要注意mounted要优先于watch执行
    watch: {
      'seller': function() {
//        console.log(this.seller);
        this._initScroll();
        this._initPics();
      }
    },
    // vue2.0 mounted 取代了ready
    // 应该注意的是，使用 mounted 并不能保证钩子函数中的 this.$el 在 document 中。为此还应该引入 Vue.nextTick/vm.$nextTick
    mounted() {
//      console.log(this.seller); // 为空
      this.$nextTick(() => {   // 能让dom元素加载完成，但是this.seller还是空
//        console.log(this.seller.score);  // 为空
//        console.log(this.$refs.sellerWrapper); // 有值
        this._initScroll();
        this._initPics();  //  放在created中不起作用 ////////////////////////////////////////
      });
    },
    methods: {
      _initScroll() {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.sellerWrapper, {
            click: true
          });
        } else {
          this.scroll.refresh();
        }
      },
      // 计算ul的宽度
      // 最开始seller是空的没别加载，这个函数不会被执行
      // watch到seller变化后才开始执行
      _initPics() {
        if (this.seller.pics) {
          let picWidth = 120;
          let margin = 6;
          let width = (picWidth + margin) * this.seller.pics.length - margin;
          // 给ul设置宽度，如果不设置宽度，那么其宽最多和父级相等，是不会滚动的
          this.$refs.picList.style.width = width + 'px';
          // 横向滚动
          this.$nextTick(() => {
            if (!this.Picscroll) {
              this.Picscroll = new BScroll(this.$refs.picWrapper, {
                scrollX: true,
                eventPassthrough: 'vertical'  // 同时整个页面可以竖向滚动
              });
            } else {
              this.Picscroll.refresh();
            }
          });
        }
      },
      toggleFavorite(event) {
        if (!event._constructed) {
          return;
        }
        this.favorite = !this.favorite;
        saveToLocal(this.seller.id, 'favorite', this.favorite);
//        localStorage.favorite = this.favorite;  // 该方法不合适，是因为this.seller有不同的id，所以有不同的值
      }
    },
    components: {
      star,
      split
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import '../../common/stylus/mixin.styl'
.seller
  position :absolute
  left: 0
  bottom :0
  top: 174px
  width :100%
  overflow :hidden
  .section
    padding: 18px 0
    margin: 0 18px
    .name
      font-family :"Microsoft YaHei"
      font-size :14px
      color: rgb(7,17,27)
      line-height :14px
    .top-overview
      position :relative
      font-size :0
      padding-top: 8px
      padding-bottom: 18px
      border-1px(rgba(7,17,27,0.1))
      .rating-sell
        .star
          display :inline-block
          height :18px
          margin-right :8px
          .star-item
            margin-right :6px
            &:last-child
              margin-right :0
        .ratingCount,.sellCount
          display :inline-block
          vertical-align :top
          font-size :10px
          color: rgb(77,85,93)
          line-height :18px
        .sellCount
          margin-left: 12px
      .store
        width: 50px /* 固定宽度，点击时心形就不会左右晃动*/
        position :absolute
        right :11px
        bottom: 18px
        text-align :center
        .icon-favorite
          display :block
          font-size :24px
          color: rgb(212,214,217)
          line-height :24px
          &.active
            color: rgb(240,20,20)
        .text
          display :inline-block
          margin-top: 4px
          font-size :10px
          color: rgb(212,214,217)
          line-height :10px
          &.active
            color: rgb(77,85,93)
    .bottom-overview
      display :flex
      margin-top: 18px
      .block
        flex:1
        border-right :1px solid rgba(7,17,27,0.1)
        text-align :center
        &:last-child
          border-right :none
        .title
          font-size :10px
          line-height :10px
          color: rgb(147,153,159)
        .text
          margin-top: 4px
          font-size :24px
          font-weight :200
          line-height :24px
          color: rgb(7,17,27)
          font-family :"Microsoft YaHeiLight"
  .bulletin
    .content
      padding: 8px 12px 16px
      border-1px(rgba(7,17,27,0.1))
      font-size :12px
      font-weight :200
      color: rgb(240,20,20)
      line-height :24px
    .supports
      .support
        padding: 16px 12px;
        font-size :0
        border-1px(rgba(7,17,27,0.1))
        &:last-child
          border-none()
          padding-bottom :none
        .icon
          display :inline-block
          vertical-align :top
          width: 16px
          height :16px;
          background-size :16px 16px  /* 勿忘*/
          background-repeat :no-repeat
          margin-right :6px
          border-radius :1px
          &.decrease
            bg-image(decrease_4)
          &.discount
            bg-image(discount_4)
          &.guarantee
            bg-image(guarantee_4)
          &.invoice
            bg-image(invoice_4)
          &.special
            bg-image(special_4)
        .text
          color: rgb(7,17,27)
          line-height :16px
          font-size :12px
          font-weight :200
  .pics
    .pic-wrapper
      margin-top: 12px
      font-size :0
      width: 100%
      overflow: hidden
      white-space: nowrap   		//不换行
      .pic
        display :inline-block
        width :120px
        height :90px
        margin-right :6px
        &:last-child
          margin-right :0
  .infos
    .name
      border-1px(rgba(7, 17, 27, 0.1))
      padding-bottom :12px
    .infos-wrapper
      .info
        padding: 16px 12px
        border-1px(rgba(7,17,27,0.1))
        font-size :12px
        font-weight :200
        color: rgb(7,17,27)
        line-height :16px
        &:last-child
          border-none()
</style>


















