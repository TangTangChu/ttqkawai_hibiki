import type { Ref } from "vue";

export const useNavOptions = (): {
    title: Ref<string>;
    subtitle: Ref<string>;
} => {
    const title = useState<string>("nav-title", () => "");
    const subtitle = useState<string>("nav-subtitle", () => "");

    return {
        title,
        subtitle,
    };
};
