<template>
  <div class="ratings" ref="ratingsWrapper">
    <div class="ratings-content">
      <div class="overview">
        <div class="overview-left">
          <div class="score">{{seller.score}}</div>
          <div class="title">综合评分</div>
          <div class="rankRate">高于周边商家{{seller.rankRate}}%</div>
        </div>
        <div class="overview-right">
          <div class="score-wrapper">
            <span class="title">服务态度</span>
            <div class="star-wrapper">
              <star :size="36" :score="seller.serviceScore"></star>
            </div>
            <span class="score">{{seller.serviceScore}}</span>
          </div>
          <div class="score-wrapper">
            <span class="title">商品评分</span>
            <div class="star-wrapper">
              <star :size="36" :score="seller.foodScore"></star>
            </div>
            <span class="score">{{seller.foodScore}}</span>
          </div>
          <div class="time-wrapper">
            <span class="title">送达时间</span>
            <span class="time">{{seller.deliveryTime}}分钟</span>
          </div>
        </div>
      </div>
      <split></split>
      <div class="ratings-wrapper">
        <ratingselect :ratings="ratings"  :selectType="selectType" :onlyContent="onlyContent" ></ratingselect>
        <div class="ranting-detail">
          <ul v-show="ratings && ratings.length">
            <li class="rating-item border-1px" v-show="needShow(rating.rateType,rating.text)" v-for="rating in ratings">
              <div class="avatar">
                <img width="28" height="28" class="avatar" :src="rating.avatar"/>
              </div>
              <div class="content">
                <div class="user">
                  <div class="username">{{rating.username}}</div>
                  <div class="time">{{rating.rateTime | formatDate}}</div>
                </div>
                <div class="score-deliver">
                  <div class="star-wrapper">
                    <star :size="24" :score="rating.score"></star>
                  </div>
                  <span class="deliver-time">{{rating.deliveryTime}}</span>
                </div>
                <p class="text">{{rating.text}}</p>
                <div class="recommend" v-show="rating.recommend && rating.recommend.length">
                  <span class="icon-thumb_up"></span>
                  <span class="item" v-for="item in rating.recommend"> {{item}} </span>
                </div>
              </div>

            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script type="text/ecmascript-6">
  import split from '../split/split';
  import BScroll from 'better-scroll';
  import star from '../star/star';
  import ratingselect from '../ratingselect/ratingselect';
  import Vue from 'vue';
  import {formatDate} from '../../common/js/date';
  const ERR_OK = 0;
  const ALL = 2;
  export default {
    props: {
      seller: {
        type: Object
      }
    },
    data() {
      return {
        ratings: [],
        selectType: ALL,
        onlyContent: true, // 只显示有内容的评价
        bus: new Vue()
      };
    },
    created() {
      this.$http.get('api/ratings').then((response) => {
        response = response.body;
        if (response.errno === ERR_OK) {
          this.ratings = response.data;
        }
        this.$nextTick(() => {  // 保证dom渲染完成
          this.scroll = new BScroll(this.$refs.ratingsWrapper, {
            click: true
          });
        });
      });
      // ratingselect组件派发的事件
      let This = this;
      This.bus.$on('ratingtype-select', function (type) {
        This.selectType = type;
        This.$nextTick(() => {
          This.scroll.refresh();
        });
      });
      This.bus.$on('content-toggle', function (content) {
        This.onlyContent = content;
        This.$nextTick(() => {
          This.scroll.refresh();
        });
      });
    },
    filters: {
      formatDate: function (time) {
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm');
      }
    },
    methods: {
      needShow(type, text) {
        if (this.onlyContent && !text) {
          return false;
        }
        if (this.selectType === ALL) {
          return true;
        } else {
          return type === this.selectType;
        }
      }
    },
    components: {
      split,
      star,
      ratingselect
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import '../../common/stylus/mixin.styl'
  .ratings
    position :absolute
    top: 174px
    bottom : 0
    left: 0
    overflow :hidden
    .overview
      display :flex
      padding: 18px 0
      .overview-left
        flex: 0 0 137px
        padding: 6px 0
        width :137px
        text-align :center
        border-right :1px solid rgba(7,17,27,.1)
        @media only screen and (max-width: 320px)   /*iphone5小屏幕下 改注释不能独自占一行*/
          flex: 0 0 120px
          width: 120px
        .score
          font-size :24px
          color: rgb(255,153,0)
          line-height : 28px
          margin-bottom: 6px
        .title
          margin-bottom: 8px
          font-size :12px
          color: rgb(7,17,27)
          line-height :12px
          font-weight :700
        .rankRate
          margin-top: 8px
          margin-bottom :6px
          font-size :10px
          color: rgb(7,17,27)
          line-height :10px
      .overview-right
        padding: 6px 0 6px 24px
        flex: 1
        @media only screen and (max-width: 320px)  // iphone5小屏幕下
          padding-left: 6px
        .score-wrapper
          margin-bottom :8px
          font-size :0
          .title
            display :inline-block
            margin-right :12px
            font-size :12px
            color: rgb(7,17,27)
            line-height :18px
            font-weight :700
            vertical-align :top
          .star-wrapper
            display :inline-block
            .star
              height :18px
              .star-item
                margin-right :6px
                vertical-align :top
                &:last-child
                  margin-right :0
          .score
            display :inline-block
            vertical-align :top
            margin-left: 12px
            font-size :12px
            color: rgb(255,153,0)
            line-height: 18px
        .time-wrapper
          .title
            display :inline-block
            margin-right :12px
            font-size :12px
            color: rgb(7,17,27)
            line-height :18px
            font-weight :700
          .time
            font-size :12px
            color: rgb(147,153,159)
            line-height :18px
    .ratings-wrapper
      .ranting-detail
        padding: 0 18px
        .rating-item
          display :flex
          padding: 18px 0
          border-1px(rgba(7,17,27,.1))
          .avatar
            flex: 0 0 28px
            width :28px
            height :28px
            margin-right 12px
            img
              border-radius :50%
          .content
            flex: 1
            .user
              margin-bottom :4px
              height :12px
              .username
                float: left
                font-size :10px
                color: rgb(7,17,27)
                line-height :12px
              .time
                float: right
                font-size :10px
                color: rgb(147,153,159)
                line-height :12px
                font-weight :200
            .score-deliver
              font-size :0
              .star-wrapper
                display :inline-block
                margin-right :4px
                .star
                  height :12px
              .deliver-time
                display :inline-block
                font-size :10px
                font-weight :200
                color: rgb(147,153,159)
                line-height :12px
            .text
              margin-top: 6px
              margin-bottom: 8px
              font-size : 12px
              color: rgb(7,17,27)
              line-height :18px
            .recommend
              line-height: 16px
              font-size :0
              .icon-thumb_up,.item
                display: inline-block
                margin: 0 8px 4px 0
                line-height :16px
                &.icon-thumb_up
                  font-size :12px
                  color: rgb(0,160,220)
              .item
                box-sizing :border-box
                padding: 0 6px
                vertical-align :top
                max-width :62px
                overflow :hidden
                text-overflow :ellipsis
                white-space :nowrap
                font-size: 9px
                color: rgb(147,153,159)
                border: 1px solid rgba(7,17,27,0.1)
                border-radius :1px
</style>





















