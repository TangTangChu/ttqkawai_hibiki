const FENCE_MARKER_REGEX = /^(\s*)(`{3,}|~{3,}).*$/;

const getFenceLength = (line: string): number => {
    const match = line.trimStart().match(/^(`+|~+)/);
    if (!match || !match[0]) {
        return 0;
    }

    return match[0].length;
};

const isClosingFence = (
    line: string,
    marker: string,
    markerLength: number,
): boolean => {
    const trimmed = line.trimStart();
    return trimmed.startsWith(marker) && getFenceLength(line) >= markerLength;
};

export const transformOutsideFencedBlocks = (
    content: string,
    transform: (segment: string) => string,
): string => {
    const lines = content.split("\n");
    const output: string[] = [];
    const buffer: string[] = [];
    let activeMarker = "";
    let activeMarkerLength = 0;

    const flushBuffer = (): void => {
        if (buffer.length === 0) {
            return;
        }

        output.push(transform(buffer.join("\n")));
        buffer.length = 0;
    };

    for (const line of lines) {
        const fenceMatch = line.match(FENCE_MARKER_REGEX);

        if (!activeMarker && fenceMatch) {
            flushBuffer();
            const markerToken = fenceMatch[2] || "";
            activeMarker = markerToken[0] || "";
            activeMarkerLength = markerToken.length;
            output.push(line);
            continue;
        }

        if (activeMarker) {
            output.push(line);

            if (isClosingFence(line, activeMarker, activeMarkerLength)) {
                activeMarker = "";
                activeMarkerLength = 0;
            }

            continue;
        }

        buffer.push(line);
    }

    flushBuffer();
    return output.join("\n");
};
