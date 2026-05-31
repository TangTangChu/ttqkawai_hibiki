<template>
    <main
        class="w-full mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl"
    >
        <header class="text-center mb-12">
            <h1
                class="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl"
            >
                {{ t("menu.projects") }}
            </h1>
        </header>
        <section>
            <div
                v-if="projects && projects.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <div v-for="(project, index) in projects" :key="index">
                    <div
                        class="relative flex flex-col h-full gap-4 rounded-xl p-4 sm:p-5 transition-colors duration-200 ease-out bg-surface/30 hover:bg-on-background/5 group"
                    >
                        <div
                            class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                        >
                            <h3
                                class="text-lg font-bold text-on-background transition-colors duration-200 group-hover:text-primary line-clamp-2"
                            >
                                {{ project.name }}
                            </h3>
                            <div
                                class="flex gap-1.5 flex-wrap sm:justify-end shrink-0"
                            >
                                <span
                                    v-for="tech in project.techStack?.slice(
                                        0,
                                        3,
                                    )"
                                    :key="tech"
                                    class="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-medium whitespace-nowrap"
                                >
                                    {{ tech }}
                                </span>
                            </div>
                        </div>

                        <p
                            class="text-sm text-on-background/60 line-clamp-3 leading-relaxed flex-1"
                        >
                            {{ project.desc }}
                        </p>
                        <div
                            class="flex flex-wrap items-center gap-2 sm:gap-3 mt-2"
                        >
                            <a
                                :href="project.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-bold transition-colors hover:bg-primary/10"
                            >
                                <CodeBracketIcon class="w-4 h-4" />
                                <span>Source</span>
                            </a>
                            <a
                                v-if="project.liveUrl"
                                :href="project.liveUrl"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/5 text-secondary text-xs font-bold transition-colors hover:bg-secondary/10"
                            >
                                <RocketLaunchIcon class="w-4 h-4" />
                                <span>Live</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-12 text-on-background/50">
                {{ t("common.label.empty") }}
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useNavTitle } from "~/composables/useNavTitle";
import { projects } from "~/data/projects";
import { CodeBracketIcon, RocketLaunchIcon } from "@heroicons/vue/24/outline";
import AnriTooltip from "~/components/AnriTooltip.vue";

const { t } = useI18n();
const { reset: resetNavTitle } = useNavTitle();

resetNavTitle();

useHead(() => ({
    title: `${t("menu.projects")} - ${t("site.name")}`,
}));
</script>
