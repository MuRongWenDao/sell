<template>
  <div id="app" class="app">
    <v-header v-bind:seller="seller"></v-header>
    <div class="tab border-1px">
      <div class="tab-item">
        <!-- 使用 router-link 组件来导航. -->
        <!-- 通过传入 `to` 属性指定链接. -->
        <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
        <!--这几个路由在main.js中配置完成-->
        <router-link to="/goods">商品</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/ratings">评论</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/seller">商家</router-link>
      </div>
    </div>
    <!--<router-view :seller="seller"></router-view>-->
    <!--路由中也要传值，才能在goods等页面中引用-->

    <!-- 路由出口 -->
    <!-- 路由匹配到的组件将渲染在这里 !!!!划重点 -->
    <!--keep-alive包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们-->
    <keep-alive>
      <router-view :seller="seller"></router-view>
    </keep-alive>

  </div>
</template>

<script type="text/ecmascript-6">
  import header from './components/header/header.vue';
  import {urlParse} from './common/js/util';
  const ERR_OK = 0;
  export default {
    data() {
      return {
          seller: {
            id: (() => {
              let queryParam = urlParse();
              return queryParam.id;
            })() // 立即执行函数
          }
      };
    },
    // 生命周期的钩子函数，就是一个vue实例被生成后调用合这个函数
    // 用vueRouter获取准备工作中的mock数据
    created() {
        this.$http.get('api/seller?id=' + this.seller.id).then((response) => {
          response = response.body;
          if (response.errno === ERR_OK) {
//            this.seller = response.data;
            // 相当于在带有id的seller的基础上,又给seller添加了值
            // 如果直接给seller赋值为data的话，id就没有了
            // 现在selelr中已经有id了，是通过url获取到的
            // 为避免直接赋值将this.seller.id丢失，使用es6的assign方法，这是Vue针对对象属性扩展推荐的一种方法
            this.seller = Object.assign({}, this.seller, response.data);
            // 进行此操作的目的是 在seller.vue中保存到localstorage
          }
        });
    },
    components: {
      'v-header': header  // header.vue，引入模块后，再在此处注册组件,然后在template中的v-header绑定数据，最后在header.vue 的props中接收数据
    }
  };
</script>
<style  lang="stylus" rel="stylesheet/stylus">
  @import './common/stylus/mixin.styl'
  .app
    .tab
      display:flex
      width:100%
      height:40px
      line-height:40px
      // border-bottom :1px solid rgba(7,17,27,0.1)
      border-1px(rgba(7,17,27,0.1))
      .tab-item
        flex:1
        text-align :center
        & > a
          display :block
          color:rgb(77,85,93)
          font-size :14px
          &.active
            color:rgb(240,20,20)




</style>
