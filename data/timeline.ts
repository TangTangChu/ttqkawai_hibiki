export interface TimelineItem {
    date: string;
    title: string;
    description?: string;
    type?: string;
    tags?: string[];
    location?: string;
    link?: string;
}

export const timelineData: TimelineItem[] = [
    {
        date: "2026-03",
        title: "作为累赘参与长城杯（广东赛区）",
        description: "我是累赘，我是炮灰，我是废物。不过酒店的投影仪特别棒，成功达成成就——在酒店追完两集的想要「成为影之实力者！」",
        type: "COMPETITION",
        location: "广州市",
    },
    {
        date: "2025-11",
        title: "给协会官网拿到了校内二级域名",
        description: "因为种种原因出了许多插错与误会，但是还是最终拿到了二级域名，只是被叫到蛟桥有些……",
        type: "LIFE",
    },
    {
        date: "2025-11",
        title: "参与江西省大学生信息安全技能大赛",
        description: "虽然一些原因导致队伍变成了2个人，不过还是拿了二等奖！不得不说江警招待得特别好，午餐、零食、水果都特别棒！",
        type: "COMPETITION",
    },
    {
        date: "2025-10",
        title: "前往北京！",
        description: "成为ISCC比赛的炮灰，不过也算是免费旅游了一把，还前往天安门了呢！",
        type: "COMPETITION",
        location: "北京市",
    },
    {
        date: "2025-08",
        title: "前往深圳旅游！",
        description: "第二次的出省旅游（也是送姐姐出去上班），和家里一起！深圳真的是富裕",
        type: "LIFE",
        location: "深圳市",
    },
    {
        date: "2025-06",
        title: "开始建设江西财经大学网络安全协会的官网",
        description: "直接上手Nuxt框架，现学Vue",
        type: "PROJECT",
    },
    {
        date: "2025-05",
        title: "拿到了人生第一个手办！",
        description: "我说 香风智乃酱 你怎么这么可爱啊！",
        type: "LIFE",
        tags: ["ACGN"],
    },
    {
        date: "2025-05",
        title: "前往武汉旅游！",
        description: "这是我第一次出省的说，还是独自一人的旅行！",
        type: "LIFE",
        location: "武汉市",
    },
    {
        date: "2025-01",
        title: "完成了第一个网页项目！",
        description: "着手了一个网页项目（Moegal！，一个Gal资源站，原本计划是给AWD单做靶场的），采用PHP + Twig + MariaDB，基本上完全实现了前后端的所有业务，学到了好多好多东西！",
        type: "PROJECT",
        tags: ["Programming", "PHP", "MariaDB"],
    },
    {
        date: "2024-09",
        title: "来到江西财经大学！",
        description: "说起来，这还是我第一次离开我家乡所在的城市，第一次进行了这么远的位移",
        type: "LIFE",
        location: "南昌市",
    },
    {
        date: "2024-08",
        title: "被江西财经大学网络空间安全专业录取",
        description: "计算机科学与技术专业的分好高啊QAQ",
        type: "EDUCATION",
    },
    {
        date: "2024-07",
        title: "填报志愿",
        description: "虽然发生了一些不愉快的事情，但是我还是坚持了自己的想法",
        type: "LIFE",
    },
    {
        date: "2024-06",
        title: "高考！",
        description: "人生的转折点呐，虽然家里可能对我分数不满意，但我觉得自己已经尽力了。在整个高考期间我保持非常不错的心态，还有心情在晚自习拿个相机四处给同学拍照、拿着WOTA艺棒乱甩……最终原本以为会非常糟糕的数学也有110+，英语也有130+，不过物理60分有点对不起我的班主任物理老师了AWA。\n我也是体会到了心态的重要性，算是我高中的最好成绩了吧！",
        type: "LIFE",
    },
    {
        date: "2022-03",
        title: "购买了人生中的第一套实体正版轻小说「关于我在无意间被隔壁的天使变成废柴这件事」1-5卷",
        description: "原本看到是电子书，越看越喜欢。第二天上课的时候不断想的是真昼与周之间的故事，成功数学课罚站了QAQ",
        type: "LIFE",
        tags: ["ACGN"],
    },
    {
        date: "2021-07",
        title: "开始写自己人生第一个程序项目",
        description: "应班长的要求，给班上写了个抽签程序（ChiyoS.Draw.Komari），从V1.0不断迭代到高考前的V3.0-240404，也算是我的喜好输出平台，都是我的青春啊QAQ",
        type: "PROJECT",
        tags: ["Programming", "C#", "WPF"],
    },
    {
        date: "2021",
        title: "惊险上岸来到县实验班",
        description: "QAQ我是废物就是倒数的那个",
        type: "EDUCATION",
    },
    {
        date: "201X",
        title: "因「擅长捉弄的高木同学」，加入伟大的ACG圈",
        type: "LIFE",
        tags: ["ACGN"],
    },
    {
        date: "201X",
        title: "和姐姐一起看Charlotte，加入ACG的一步之遥",
        description: "心智还是不那么成熟，但是依旧记忆深刻的说",
        type: "LIFE",
        tags: ["ACGN"],
    },
    {
        date: "2005-12",
        title: "来到这个世界上！",
        type: "LIFE",
        location: "中国"
    },
];