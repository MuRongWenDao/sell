<template>
  <transition name="move">
    <div class="food" v-show="showFlag" ref="foodWrapper">
      <div class="food-content" >  <!--必须包这一层，否则 BScroll不起用-->
        <div class="food-img" >
          <img v-bind:src="food.image" alt="img" />
          <div class="back" @click="hide">
            <i class="icon-arrow_lift"></i>
          </div>
        </div>
        <div class="food-info">
          <div class="name" >{{food.name}}</div>
          <div class="extra" >
            <span class="count">月售{{food.sellCount}}份</span>
            <span class="rating">好评率{{food.rating}}%</span>
          </div>
          <div class="price">
            <span class="now-price">￥{{food.price}}</span>
            <span class="old-price" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
          </div>
          <div class="cartControl-wrapper" v-show="food.count>0">
            <cartControl :food="food"></cartControl>
          </div>
          <transition name="fade">   <!--增加动画才能获取当前元素的位置，才能够加上小球抛物动画，否则无法获取位置-->
            <div class="buy" v-show="food.count === 0 || !food.count" @click.prevent.stop="addFirst">加入购物车</div>  <!--当food.count不存在或者个数为0时显示-->
          </transition>
        </div>
        <split v-show="food.info"></split>
        <div class="food-desc" v-show="food.info">
          <h2 class="title">商品介绍</h2>
          <div class="desc">{{food.info}}</div>
        </div>
        <split></split>
        <div class="rating1">
					<h1 class="title">商品评价</h1>
          <ratingselect :selectType="selectType" :onlyContent="onlyContent" :desc="desc" :ratings="food.ratings"></ratingselect>
          <div class="rating-wrapper">
            <ul v-show="food.ratings && food.ratings.length">
              <li class="rating-item" v-show="needShow(rating.rateType,rating.text)" v-for="rating in food.ratings">
                <div class="time" >{{rating.rateTime | formatDate}}</div>
                <div class="rating-content">
                  <span class="type" v-bind:class="{'icon-thumb_up': rating.rateType === 0,'icon-thumb_down':rating.rateType === 1}"></span>
                  <span class="text">{{rating.text}}</span>
                </div>
                <div class="user">
                  <span class="username">{{rating.username}}</span>
                  <img class="avatar" width="12" height="12" v-bind:src="rating.avatar" alt="avatar">
                </div>
              </li>
            </ul>
            <div class="no-ratings" v-show="!food.ratings || !food.ratings.length">暂无评价</div>
          </div>
        </div>

      </div>

    </div>
  </transition>
</template>
<script type="text/ecmascript-6">
  import BScroll from 'better-scroll';
  import cartControl from '../cartController/cartController.vue';
  import split from '../split/split';
  import ratingselect from '../ratingselect/ratingselect';
  import Vue from 'vue';

  // 带花括号引入的都是export function
  import {formatDate} from '../../common/js/date.js';

  const ALL = 2;
  export default {
    props: {
      food: {
        type: Object
      }
    },
    data() {
      return {
        showFlag: false, // 是否显示本页信息
        bus: new Vue(),
        selectType: ALL,
        onlyContent: true, // 只显示有内容的评价
        desc: {
          all: '全部',
          positive: '推荐',
          negative: '吐槽'
        }
      };
    },
    filters: {
      formatDate: function (time) {
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm');
      }
    },
    created() {
      // 点击cartcontrol时触发shopcart中的drop方法
      // 因为food和shopcart是兄弟组件
      this.bus.$on('cart-add', this.$parent.$refs.cart.drop);  // 不加这句话，商品详情页购买商品数量大于1时，不会显示抛物动画
      let This = this;
      This.bus.$on('ratingtype-select', function (type) {
        This.selectType = type;
        // 因为改变数据，vue的dom更新是异步的
        // 在修改数据之后因立即使用$nextTick
        This.$nextTick(() => {
          This.foodScroll.refresh();
        });
      });
      This.bus.$on('content-toggle', function (toggleContent) {
        This.onlyContent = toggleContent;
        This.$nextTick(() => {
          This.foodScroll.refresh();
        });
      });
    },
    methods: {
      // 父组件goods组件调用这个方法
      show() {
        this.showFlag = true;
        this.selectType = ALL;  // 这两个状态始终保持初始状态
        this.onlyContent = false;

        this.$nextTick(() => {
          if (!this.foodScroll) {
            this.foodScroll = new BScroll(this.$refs.foodWrapper, {
              click: true
            });
          } else {
             this.foodScroll.refresh();
          }
        });
      },
      hide() {
        this.showFlag = false;
      },
      addFirst(event) {
        if (!event._constructed) {
            return;
        }
        // 点击购物车时出现小球动画
        this.$parent.bus.$emit('cart-add', event.target);
        this.$set(this.food, 'count', 1);
      },
      needShow(type, text) {
        if (this.onlyContent && !text) {   // 只显示有内容的评价
          return false;
        }
//        if (this.onlyContent && text) {    其余三种情况均返回true
//          return true;
//        }
//        if (!this.onlyContent && !text) {
//          return true;
//        }
//        if (!this.onlyContent && text) {
//          return true;
//        }

        if (this.selectType === ALL) {
          return true;
        } else {
          return this.selectType === type;
        }
      }
    },
    components: {
      cartControl,
      split,
      ratingselect
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin.styl"
.food
  position :fixed
  width :100%
  background :#fff
  z-index: 1	//小于购物车，也要小于购物车弹开的mask层
  top: 0
  left: 0
  bottom: 48px
  font-size :0
  // transform :translate3d(0,0,0)  // 从0到100%渐变  从右到左飞入，这一行可以不写
  &.move-enter-active,&.move-leave-active
    transition: all 0.2s
  &.move-enter,&.move-leave-active
    transform :translate3d(100%,0,0)
  .food-img   // 图片的宽度是根据屏幕自适应的，高度等于宽度，因此不能预设高度，那就会造成图片加载过程中屏幕的抖动
    position :relative
    width :100%
    height :0
    padding-top: 100%   //padding-top或者padding-bottom值设为100%，是相对于盒子的宽度而言的，盒子看起来是宽高相等的容器
    img
      position :absolute
      left: 0
      top: 0
      width :100%
      height 100%
  .back
    position :absolute
    left:0
    top: 10px
    z-index :100
    .icon-arrow_lift
      display :block
      padding: 10px
      font-size :20px
      color:#fff
  .food-info
    position :relative
    padding: 18px
    background :#fff
    .name
      font-size :14px
      line-height :14px
      font-weight :700
      color: rgb(7,17,27)
    .extra
      margin-top: 8px
      font-size :10px
      line-height :10px
      color: rgb(147,153,159)
      .count
        margin-right :12px
    .price
      margin-top: 18px
      .now-price
        font-size :14px
        line-height :24px
        font-weight :700
        color: rgb(240,20,20)
        margin-right :8px
      .old-price
        font-size :10px
        line-height :24px
        font-weight :700
        color: rgb(147,153,159)
        text-decoration :line-through
    .cartControl-wrapper
      position: absolute
      right: 12px
      bottom: 12px
    .buy
      position :absolute
      padding: 6px 12px
      text-align :center
      border-radius :12px
      line-height :12px
      font-size :10px
      right: 18px
      bottom: 18px
      color: #fff
      background :rgb(0,160,220)
      &.fade-enter-active,&.fade-leave-active
        transition : opacity 0.2s
      &.fade-enter,&.fade-leave-to
        opacity : 0
  .food-desc
    padding: 18px
    background :#fff
    .title
      font-size :14px
      line-height :14px
      font-weight :700
      color: rgb(7,17,27)
    .desc
      padding-top: 6px
      padding-left: 8px
      font-size :12px
      line-height :24px
      font-weight :200
      color: rgb(77,85,93)

  .rating1
    padding-top: 18px
    background :#fff
    .title
      padding-left: 18px
      font-size :14px
      line-height :14px
      font-weight :700
      color: rgb(7,17,27)
      margin-bottom: 6px
    .rating-wrapper
      padding: 0 18px
      .rating-item
        position :relative
        padding: 16px 0
        border-1px(rgba(7,17,27,0.1))
        .time
          font-size :10px
          line-height :12px
          color: rgb(147,153,159)
        .rating-content
          margin-top: 6px
          .type
            margin-right :4px
            font-size :12px
            line-height :24px
            color: rgb(147,153,159)
            &.icon-thumb_up
              color: rgb(0,160,220)
          .text
            font-size :12px
            color: rgb(7,17,27)
            line-height :16px
        .user
          position :absolute
          right :0
          top: 16px
          .username
            font-size :10px
            line-height :12px
            color: rgb(147,153,159)
            margin-right :6px
          .avatar
            width :12px
            height :12px
            vertical-align: top
            border-radius :50%
      .no-ratings
        padding: 16px 0
        font-size :12px
        line-height :16px
        color: rgb(147,153,159)
</style>
