import moment from "moment";
moment.defineLocale("zh-cn", {
  months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  weekdaysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  week: {
    dow: 1, // 周一为一周的第一天
  },
});
export default moment;
