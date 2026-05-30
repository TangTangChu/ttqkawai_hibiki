export interface ProjectItem {
    name: string;
    url: string; // Source URL (e.g. GitHub)
    liveUrl?: string; // Optional Live URL
    desc: string;
    techStack?: string[];
    banner?: string;
}

export const projects: ProjectItem[] = [
    {
        name: "ttqkawai_hibiki",
        url: "https://github.com/tantanchu/ttqkawai_hibiki",
        liveUrl: "https://tantanchugasuki.cn",
        desc: "本网站的源代码",
        techStack: ["Nuxt 4", "Tailwind CSS", "TypeScript"],
        banner: "https://img.tantanchugasuki.cn/i/r/avatar"
    },
    {
        name: "AnzuIMG",
        url: "https://github.com/TangTangChu/AnzuImg",
        desc: "一个简单的图床项目",
        techStack: ["Nuxt 4", "Golang"],
    },
    {
        name: "江西财经大学网络安全协会官方网站",
        url: "https://github.com/JUFEWPST/JXUFE-CSG-Website",
        desc: "主导开发了江西财经大学网络安全协会的官方网站",
        techStack: ["Nuxt 4", "Golang"],
        liveUrl: "https://csec.jxufe.edu.cn",
    },
    {
        name: "DaysOfJFE",
        url: "https://github.com/TangTangChu/DaysOfJFE",
        desc: "程序设计实践的大作业，一个剧情无脑、超级烂、，超烂GUI框架、AI都改不全的烂代码Galgame",
        techStack: ["CPP", "GDI+"],
    },
    {
        name: "ChiyoS.Draw.Komari",
        url: "https://github.com/TangTangChu/ChiyoS.Draw.Komari",
        desc: "高中时期写的基于C#+WPF的抽签软件，是我第一个真正意义上的软件项目，真古法写的代码，包含了各种私货，甚至塞过Chromium内核，属于基于班级需求和个人ACGN私货平衡的集大成之作（bushi",
        techStack: ["C#", "WPF"],
    },
    {
        name: "Moegal",
        url: "https://github.com/TangTangChu/Moegal",
        desc: "原本打算作为AWD靶场的网站，具体有什么漏洞我也不清楚。一个Galgame资源网站，算是我的前端项目尝试，为我后面的前端项目定下了许多UX基调",
        techStack: ["PHP", "Twig", "MariaDB"],
    }
];


