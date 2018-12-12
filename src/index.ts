import TaggedCache from "./TaggedCache";

export {TaggedCache};
export {
    default as timestamp,
    enableTimestampCache,
    disableTimestampCache,
    setTimestampCacheTTL,
    getTimestampCacheTTL,
} from "./timestamp";

const _default = new TaggedCache();

export default _default;
