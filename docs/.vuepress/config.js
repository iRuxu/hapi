module.exports = {
    title: "Hapi中文文档",

    themeConfig: {
        // LOGO
        logo: "/assets/img/hapi.svg",
        // TOP NAV
        nav: [
            { text: "API Documentation (EN)", link: "https://hapi.dev/api" },
            {
                text: "Tutorials (CN)",
                link: "https://hapi.dev/tutorials/?lang=zh_CN",
            },
        ],
        // SIDEBAR
        sidebar: "auto",
        // FOOTER
        lastUpdated: "Last Updated",

        // MISC
        // 假如你的文档仓库和项目本身不在一个仓库：
        docsRepo: "iRuxu/hapi",
        // 假如文档不是放在仓库的根目录下：
        docsDir: "docs",
        // 假如文档放在一个特定的分支下：
        docsBranch: "master",
        // 默认是 false, 设置为 true 来启用
        editLinks: true,
        // 默认为 "Edit this page"
        editLinkText: "在Github编辑此页面",
    },

    base : "/hapi/",
};
