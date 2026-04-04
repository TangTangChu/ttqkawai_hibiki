import type { Component } from "vue";
import {
    HomeIcon,
    InformationCircleIcon,
    DocumentTextIcon,
    UsersIcon,
} from "@heroicons/vue/24/outline";

export interface MenuItem {
    label: string;
    route: string;
    icon?: Component;
    submenus?: MenuItem[];
}

export const menu: MenuItem[] = [
    {
        label: "menu.home",
        route: "/",
        icon: HomeIcon,
    },
    {
        label: "menu.archive",
        route: "/archive",
        icon: DocumentTextIcon,
    },
    {
        label: "menu.links",
        route: "/links",
        icon: UsersIcon,
    },
    {
        label: "menu.about",
        route: "/about",
        icon: InformationCircleIcon,
    },
];
