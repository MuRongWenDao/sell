<template>
  <div class="num-icon">
    <!--<div class="shoppingIcon icon-remove_circle_outline" v-show="food.count>0" v-on:click="changeCount(-1)"></div>-->
    <!--<div class="text" v-show="food.count>0" >{{food.count}}</div>-->
    <!--<div class="shoppingIcon icon-add_circle" v-on:click="changeCount(1)"></div>-->
    <!-- 为了滚动效果改变样式 -->
    <transition name="move">
      <div class="cart-decrease" v-show="food.count>0" v-on:click.stop.prevent="changeCount(-1,$event)">
        <!-- 增加一层，一个为了滚动，一个为了平移 -->
        <span class="inner icon-remove_circle_outline"></span>
      </div>
    </transition>

    <div class="text" v-show="food.count>0" >{{food.count}}</div>
    <div class="cart-add-icon icon-add_circle" v-on:click.stop.prevent="changeCount(1,$event)"></div>
  </div>
</template>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  export default {
    props: {    //  在此接收之后才能在HTML中使用
      food: {
        type: Object
      }
    },
    methods: {
      // 改变商品数量
      changeCount(flag, event) {  // 点击是没有效果的，因为foods面板中使用了BScroll,需要foodScroll设置click属性
        // 如果这个事件不是用户派发的，而是原生的，就把它return掉
        // 为了防止pc端执行两次事件
        if (!event._constructed) {
          return;
        }
        if (flag > 0) {
          if (typeof this.food.count === 'undefined') {
            Vue.set(this.food, 'count', 1);   // 当为food添加并不存在的count属性时，直接赋值是不可以的，defineProperty检测不到新增的属性，
            // 所以在新增或者删除属性时，要想观察到其变化，要用Vue的set属性
          } else {
            this.food.count++;
          }
//          this.$emit('cart-add', event.target);  //  添加food的动画使用  注意不是这个 因为此问题，造成小球没有抛物动画
          this.$parent.bus.$emit('cart-add', event.target);
        } else {
          this.food.count--;
          if (this.food.count < 0) {
            this.food.count = 0;
          }
        }
      }
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .num-icon
    .cart-decrease
      display: inline-block
      padding: 6px
      .inner
        line-height: 24px
        font-size: 24px
        color: #00a0dc
      &.move-enter-active, &.move-leave-active
        transition: all 0.4s linear
      .inner
        display: inline-block
        transition: all 0.4s linear
      &.move-enter, &.move-leave-active
        opacity: 0
        transform: translate3d(24px, 0, 0) //没有此条则原处打转
        .inner
          transform: rotate(180deg)
    .text
      display: inline-block
      vertical-align: top
      width :12px
      padding-top: 6px
      text-align :center
      font-size :10px
      line-height :24px
      color: rgb(147,153,159)
    .cart-add-icon
      display :inline-block
      padding: 6px
      line-height: 24px;
      font-size: 24px;
      vertical-align: top
      color: #00a0dc
</style>
