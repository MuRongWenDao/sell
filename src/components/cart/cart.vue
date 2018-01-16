<template>
  <div class="cart">
    <div class="content" @click="toggleList">
      <div class="content-left">
        <div class="logo-wrapper">
          <div class="logo" :class="{active: totalCount>0}">
            <span class="icon-shopping_cart"></span>
          </div>
          <div v-show="totalCount>0" class="count">{{totalCount}}</div>
        </div>
        <div class="price" :class="{active: totalPrice>0}">￥{{totalPrice}}</div>
        <div class="des">另需配送费￥{{deliveryPrice}}元</div>
      </div>

      <div class="content-right" @click.stop.prevent="pay">
        <div class="pay" v-bind:class="payClass">{{payDes}}</div>
      </div>
    </div>
    <!--添加商品时的动画小球-->
    <div class="ball-container">

      <!--<transition-group> 元素作为多个元素/组件的过渡效果-->
      <!--可以通过 tag 属性配置哪个元素应该被渲染-->
      <!--每个 <transition-group> 的子节点必须有 独立的key ，动画才能正常工作-->
      <transition-group name="drop" tag="div"  v-on:before-enter="beforeEnter" v-on:enter="enter" v-on:after-enter="afterEnter">
        <div v-for="ball in balls" v-show="ball.show" class="ball" :key="ball.id">
          <div class="inner inner-hook"></div>
        </div>
      </transition-group>

    </div>
    <transition name="fold">
      <div class="shopcart-list" v-show="listShow" >
        <div class="list-header">
          <h1 class="title">购物车</h1>
          <span class="empty" @click="empty">清空</span>
        </div>
        <div class="list-content" ref="foodListWrapper">
          <ul>
            <li class="food border-1px" v-for="food in selectedFoods">
              <span class="name">{{food.name}}</span>
              <span class="price">{{food.price*food.count}}</span>
              <div class="cart-controller-wrapper">
                <cartController v-bind:food="food"></cartController>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div class="list-mask" v-show="listShow" @click="hideList"></div>
    </transition>
  </div>

</template>

<script type="text/ecmascript-6">
  import cartController from '../cartController/cartController.vue';
  import Vue from 'vue';
  import BScroll from 'better-scroll';
  export default {
    props: {
      selectedFoods: {
        type: Array,
        default() {   //  type是Array或者Object时，default要为一个函数
          return [];
        }
      },
      deliveryPrice: {   //   在此接收之后才能在HTML中使用
        type: Number,
        default: 0
      },
      minPrice: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        balls: [
          {
            show: false,
            id: 1
          },
          {
            show: false,
            id: 2
          },
          {
            show: false,
            id: 3
          },
          {
            show: false,
            id: 4
          },
          {
            show: false,
            id: 5
          }
        ],
        //  已经下落的小球数组
        dropBalls: [],
        bus: new Vue(),
        fold: true  // foodlist折叠控制
      };
    },
    computed: {
      totalPrice() {
        let total = 0;
        this.selectedFoods.forEach((food) => {
          total += food.price * food.count;
        });
        return total;
      },
      totalCount() {
        let totalCount = 0;
        this.selectedFoods.forEach((food) => {
          totalCount += food.count;
        });
        return totalCount;
      },
      payDes() {
          if (this.totalPrice === 0) {  //  注意用 ‘===’
              return `￥${this.minPrice}起送`;  //  ~  es6 的反引号，es6字符串的扩展，可以实现用 ${this.minPrice} 的方式传入反引号中，不用借助+进行字符串拼接
          } else if (this.totalPrice < this.minPrice) {
              return `还差￥${this.minPrice - this.totalPrice}起送`;
          } else {
            return '去结算';
          }
      },
      payClass() {
          if (this.totalPrice < this.minPrice) {
            return 'not-enough';
          } else {
              return 'enough';
          }
      },
      listShow() {
        if (!this.totalCount) { // 若为0
          this.fold = true;
          return false;
        }
        let show = !this.fold;
        if (show) {   // 将bscroll初始化放在此处，因为此处展开列表
          this.$nextTick(() => {   // 要保证dom渲染完成
            if (!this.scroll) {   // 不必每次都重新生成，已生成的话 调用refresh刷新即可
              this.scroll = new BScroll(this.$refs.foodListWrapper, {
                click: true   // 避免左侧菜单点击无效果
              });
            } else {
              this.scroll.refresh();
            }
          });
        }
        return show;
      }
    },
    created() {
      //  在整个goods页面下,shopcart和cartcontrol是兄弟
      this.$parent.bus.$on('cart-add', this.drop);
        //  在shopcart中,shopcart是cartcontrol的父节点
      this.bus.$on('cart-add', this.drop);
    },
    methods: {
      drop: function(el) {
        for (let i = 0; i < this.balls.length; i++) {
          let ball = this.balls[i];
          // 找到一个隐藏的小球
          // 把el赋给它。并填入dropBall中
          if (!ball.show) {
            ball.show = true;
            ball.el = el;
            this.dropBalls.push(ball);
            return;
          }
        }
      },
      //  进入动画前
      beforeEnter: function(el) {
        let count = this.balls.length;
        while (count--) {
          let ball = this.balls[count];
          //  获得show=true小球对应的el的相对于视口的位置
          if (ball.show === true) {
            let rect = ball.el.getBoundingClientRect();
            //  小球起始点x,y与终点(购物车)的差值
            let x = rect.left - 32;
            let y = -(window.innerHeight - rect.top - 22);
            el.style.display = '';
            //  外层元素做一个纵向的动画
            el.style.webkitTransform = `translate3d(0, ${y}px, 0)`;
            el.style.transform = `translate3d(0, ${y}px, 0)`;
            //  内部元素做一个横向动画
            let inner = el.getElementsByClassName('inner-hook')[0];
            inner.style.webkitTransform = `translate3d(${x}px, 0, 0)`;
            inner.style.transform = `translate3d(${x}px, 0, 0)`;
          }
        }
      },
      //  小球进入动画时
      enter: function(el) {
        //  重绘
//        let rf = el.offsetHeight;
        this.$nextTick(() => {  // 体验优化，不卡顿，异步执行下落动画
          el.style.display = '';
          // 外层元素做一个纵向的动画
          el.style.webkitTransform = 'translate3d(0, 0, 0)';
          el.style.transform = 'translate3d(0, 0, 0)';
          // 内部元素做一个横向动画
          let inner = el.getElementsByClassName('inner-hook')[0];
          inner.style.webkitTransform = 'translate3d(0, 0, 0)';
          inner.style.transform = 'translate3d(0, 0, 0)';
        });
      },
      // 动画做完后
      // 重置。小球又能重新用了
      afterEnter: function(el) {
        let ball = this.dropBalls.shift();
        if (ball) {
          ball.show = false;
          el.style.display = 'none';
        }
      },
      toggleList: function () {
        if (!this.totalCount) { // 若为0
          return;
        }
        this.fold = !this.fold;
      },
      empty () {
        this.selectedFoods.forEach((food) => {   // 不能直接置空
            food.count = 0;
        });
      },
      hideList() {
        this.fold = true;
      },
      pay: function () {
        if (this.totalPrice < this.minPrice) {
          return;
        }
        window.alert(`支付${this.totalPrice}元`);
      }
    }, //  methods end
    components: {
      cartController
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import '../../common/stylus/mixin.styl'
  .cart
    position :fixed
    bottom: 0
    left:0
    width :100%
    height :48px
    z-index :50  /*  要盖住上层*/
    .content
      width :100%
      display :flex
      font-size :0
      .content-left
        flex: 1        /* 左侧自适应，右侧宽度一定 */
        background: #141d27
        .logo-wrapper
          /*float:left  不喜欢用float*/
          display :inline-block
          margin-left: 12px
          width :56px
          height :56px
          background :#141d27
          border-radius 50%
          position :relative
          top: -10px
          vertical-align :top
          .logo
            width:44px
            height :44px
            position :absolute
            top: 6px
            left: 6px
            font-size :24px
            text-align :center
            border-radius :50%
            color: rgba(255,255,255,0.4)
            background :#2b343c
            .icon-shopping_cart
              line-height :44px
            &.active
              background: #00a0dc
              color: #fff
          .count
            position: absolute
            padding: 0 6px
            width :24px
            box-sizing: border-box
            text-align: center
            background :rgb(240,20,20)
            box-shadow :0 4px 8px 0 rgba(0,0,0,0.4)
            border-radius :6px
            right: 0
            top: 0
            font-size :9px
            font-weight :700
            line-height :16px
            color:#fff
            overflow: hidden
            text-overflow: ellipsis
        .price
          /*float:left  不喜欢用float*/
          display :inline-block
          margin-top: 12px
          padding-left: 12px
          padding-right: 12px
          border-right : 1px solid rgba(255,255,255,0.1)
          color:rgba(255,255,255,0.4)
          font-size :16px
          font-weight :700
          line-height :24px
          vertical-align :top
          &.active
            color: #fff
        .des
          /*float:left  不喜欢用float*/
          display :inline-block
          padding: 12px
          font-size :12px
          color: rgba(255,255,255,0.4)
          font-weight :700
          line-height :24px
      .content-right
        flex: 0 0 105px  /* 左侧自适应，右侧宽度一定 */
        width :105px  /* 自适应也要写宽度*/
        .pay
          box-sizing : border-box;
          padding: 12px 8px
          font-size :12px
          line-height :24px
          font-weight 700
          text-align: center;
          &.not-enough
            background :#2b343c
            color: rgba(255,255,255,0.4)
          &.enough
            background :#00b43c
            color: #fff
    .ball-container
      .ball
        position :fixed
        left: 32px
        bottom: 22px
        z-index: 50
        &.drop-enter-active
          transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.4)
          .inner
            width :16px
            height :16px
            border-radius :50%
            color: rgb(0,160,220)
            background-color: rgb(0, 160, 220)
            transition: all 0.4s linear
    .shopcart-list
      position: absolute
      z-index :-1
      left: 0
      top: 0
      width :100%
      transform: translate3d(0, -100%, 0)  // 相对于当前自身高度做偏移
      &.fold-enter-active,&.fold-leave-active
       transition : all 0.5s
      &.fold-enter,&.fold-leave-active
        transform :translate3d(0,0,0)
      .list-header
        background :#f3f5f7
        border-bottom :1px solid rgba(7,17,27,0.1)  // 下边框为2px 不必使用border-1px
        height :40px
        padding: 0 18px
        font-size :0
        line-height :40px
        .title
          float: left
          font-size :14px
          font-weight :200
          color: rgb(7,17,27)
        .empty
          float: right
          font-size :12px
          font-weight :200
          color: rgb(0,160,220)
      .list-content
        padding: 0 18px
        max-height :217px
        overflow :hidden  // 使用bscroll
        background :#fff
        .food
          position :relative
          box-sizing :border-box
          height :48px
          padding: 12px 0
          border-1px(rgba(7,17,27,0.1))
          font-size :0
          .name
            font-size :14px
            color: rgb(7,17,27)
            line-height :24px
          .price
            position: absolute
            font-size :14px
            color: rgb(240,20,20)
            line-height :24px
            font-weight :700
            right :90px
            bottom: 12px
          .cart-controller-wrapper
            position :absolute
            right :0
            bottom: 6px
            color: rgb(147,153,159)
    .list-mask
      position :fixed
      left: 0
      top: 0
      width :100%
      height :100%
      z-index :-10  // 要小于 .cart的z-index50
      background :rgba(7,17,27,0.6)
      &.fade-enter-active,&.fade-leave-active
        transition : all 0.5s
      &.fade-enter,&.fade-leave-to
        opacity :0
</style>




































