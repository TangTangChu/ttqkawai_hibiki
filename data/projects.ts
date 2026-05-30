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
    }
];


