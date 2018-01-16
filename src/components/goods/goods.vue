<template>
  <div class="goods" >  <!--   v-bind:goods="goods" 不用写为啥呢-->
    <div class="menu-wrapper" ref="menuWrapper">
      <ul>
        <li class="menu-item" v-for="(item,index) in goods" v-bind:class="{active: index == currentIndex}" @click="selectMenu(index,$event)">
          <span class="text border-1px">
            <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
          </span>
        </li>
      </ul>
    </div>
    <div class="foods-wrapper" ref="foodsWrapper">
      <ul>
        <li class="food-item food-list-hook" v-for="item in goods">
          <dl>
            <dt class="title"  v-text="item.name"></dt>
            <dd class="content-wrapper border-1px" v-for="(food,index) in item.foods"  @click="selectFood(food,$event)">
              <div class="icon">
                <img v-bind:src="food.icon" width="57" height="57" alt="img">
              </div>
              <div class="content">
                <div class="name" >{{food.name}}</div>
                <div class="description" v-show="food.description" v-text="food.description"></div>
                <div class="extra" >
                  <span class="count">月售{{food.sellCount}}份</span>
                  <span class="rating">好评率{{food.rating}}%</span>
                </div>
                <div class="price">
                  <span class="now-price">￥{{food.price}}</span>
                  <span class="old-price" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                </div>
                <div class="cart-controller-wrapper">
                  <cartController v-bind:food="food"></cartController>
                </div>
              </div>
              <!--<food v-bind:food="food"></food>   没有放在此处，思考原因-->
            </dd>
          </dl>


        </li>
      </ul>
    </div>
    <cart ref="cart" v-bind:deliveryPrice="seller.deliveryPrice" :minPrice="seller.minPrice" :selectedFoods="selectedFoods"></cart>
    <!--绑定两个变量值 传递到cart中，seller的值需要在App.vue中的路由中中传值-->
    <food v-bind:food="selectedFood" ref="food"></food>  <!--food模版放在此处-->
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll';
  import cart from '../cart/cart.vue';
  import cartController from '../cartController/cartController.vue';
  import Vue from 'vue';
  import food from '../food/food.vue';
  const ERR_OK = 0;

  export default {
    props: {    //  在此接收之后才能在HTML中使用
      seller: {
        type: Object   // 引入为该页面所用 在购物车绑定配送费中用到seller
      }
    },
    data() {
      return {
        goods: [],
        listHeight: [],   // 用来存放foods栏中每一项的高度
        scrollY: 0,
        // 将在各处使用该事件中心
        // 组件通过它来通信
        // 兄弟组件也可以通过这个通信
        // shopcart和cartcontrol通信
        // 放入data中子组件才能通过$parent.bus访问到
        bus: new Vue(),
        selectedFood: {} // 要查看详情的food
      };
    },
    computed: {
        // 返回当前food所处的类别索引号
      currentIndex() {
        for (let i = 0; i < this.listHeight.length; i++) {
            let height1 = this.listHeight[i];
            let height2 = this.listHeight[i + 1];
            if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
                return i;
            }
        }
        return 0;
      },
      selectedFoods() {    // 放在计算属性中，绑定购物车模版，放在方法中也可以
        let goods = [];
        this.goods.forEach((good) => {
          good.foods.forEach(food => {
            if (food.count) {             // 如果有定义
                goods.push(food);
            }
          });
        });
        return goods;
      }
    },
    created() {
// dev.server.js 中有接口细节
      this.$http.get('api/goods').then((response) => {
        response = response.body;
        if (response.errno === ERR_OK) {
          this.goods = response.data;
          this.$nextTick(() => {  // 保证dom渲染完成
            this._initScroll();
            this._calculateHeight();
          });
        }
      });
      this.classMap = ['decrease', 'discount', 'guarantee', 'invoice', 'special'];  // 打折、特惠 等符号
    },
    methods: {
      _initScroll() {
          this.menuScroll = new BScroll(this.$refs.menuWrapper, {
              click: true   // 避免左侧菜单点击无效果
          }); // HTML中不能写作ref="menu-wrapper"
          this.foodScroll = new BScroll(this.$refs.foodsWrapper, {
            click: true,   // 避免购物车甲减按钮点击无效果
            probeType: 3    // 检测实时滚动的位置，相当于探针的效果
          });
          this.foodScroll.on('scroll', (pos) => {
              this.scrollY = Math.abs(Math.round(pos.y));   // pos.y是一个负值，因此要转成正值
//              console.log(this.scrollY);
          });
        },
        // 计算每个type中所有food的高度，包含type的title
      _calculateHeight() {
          let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');  // 每个li的高度包含了标题和子元素列表的高度
          let height = 0;
          this.listHeight.push(height);
          for (let i = 0; i < foodList.length; i++) {  // i < foodList.length-1?
              let item = foodList[i];
              height += item.clientHeight;
              this.listHeight.push(height);
          }
        },
//      绑定菜单栏和内容栏的点击及滚动：菜单栏绑定点击事件，获取点击的index的元素，内容栏滚动到该元素
      selectMenu(index, event) {
            //  引入event是为了避免pc端点击事件触发两次
        if (!event._constructed) {  // pc端没有此属性（不知是不是版本升级的原因，如今pc端也有这个属性，但pc端点击事件并未触发两次）
            return;
        }

        let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
        let el = foodList[index];
        this.foodScroll.scrollToElement(el, 300);  // 滚动到el元素的位置
      },
      // 点击某个商品出现商品详情页
      selectFood(food, event) {
        if (!event._constructed) {
          return;
        }
        this.selectedFood = food;
        this.$refs.food.show();  // 调用子组件food中中show方法
      }
    },
    components: {
      cart,     // "cart"  引号可以去掉
      'cartController': cartController,
      food
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import '../../common/stylus/mixin.styl'
  .goods
    display :flex   /* flex布局，让子元素内容左侧固定，右侧可以自适应屏幕*/
    width :100%
    position :absolute  /* 没明白为什么要absolute*/
    top: 174px
    bottom : 48px
    overflow :hidden
    .menu-wrapper
      flex: 0 0 80px  /* 三个值分别表示放大比例 缩小比例 占位空间*/
      width :80px  /* 不写width 在安卓浏览器上会有兼容性问题*/
      background :#f3f5f7
      .menu-item
        display :table /* 小技巧 垂直居中*/
        padding: 0 12px
        width :56px
        height: 54px
        font-size :0
        line-height: 14px
        color: rgb(7,17,27)
        &.active
          position :relative
          z-index :10
          margin-top: -1px
          background :#fff
          .text
            font-weight :700
            border-none()   /* 下面没有边框  &:after   display :none*/
        .text
          display :table-cell
          vertical-align :middle
          font-size :12px
          font-weight :200
          border-1px(rgba(7,17,27,0.1))
          .icon
            display :inline-block
            vertical-align :top
            width: 12px
            height :12px;
            margin-right :2px
            background-size :12px 12px
            background-repeat :no-repeat
            &.decrease
              bg-image(decrease_3)
            &.discount
              bg-image(discount_3)
            &.guarantee
              bg-image(guarantee_3)
            &.invoice
              bg-image(invoice_3)
            &.special
              bg-image(special_3)
    .foods-wrapper
      flex: 1  /* 0 0 auto  可改为1 表示自动*/
      .title
        height :26px
        background :#f3f5f7;
        font-size :12px
        line-height :26px
        color: rgb(147,153,159)
        border-left: 2px solid #d9dde1
        text-indent :14px
      .content-wrapper
        display :flex
        font-size: 0
        margin: 18px
        padding-bottom :18px   /* 上下margin会重合，因此要设一个padding-bottom */
        border-1px(rgba(7,17,27,0.1))
        &:last-child
          border-none()   /* 最后一个元素无border */
          margin-bottom :0   /* 最后一个元素margin不会重合 去掉多余的空白*/
        .icon
          flex: 0 0 57px /* 父级display：flex 子元素就可以自适应*/
          vertical-align: top;
          width :57px
          height :57px
          margin-right :10px
          img
            border-radius :1px
        .content
          flex: 1
          .name
            margin: 2px 0 8px
            font-size: 14px
            line-height :14px
            color: rgb(7,17,27)
            overflow :hidden
          .description
            font-size: 10px
            line-height :12px
            color: rgb(147,153,159)
          .extra
            margin-top: 8px
            color: rgb(147,153,159)
            .count
              font-size :10px
              margin-right :12px
            .rating
              font-size: 10px
          .price
            font-weight :700
            line-height :24px
            .now-price
              font-size :14px
              color: rgb(240,20,20)
              margin-right :8px
            .old-price
              font-size :10px
              color: rgb(147,153,159)
              text-decoration :line-through
          .cart-controller-wrapper
            position :absolute
            right :0
            bottom: 12px
</style>
