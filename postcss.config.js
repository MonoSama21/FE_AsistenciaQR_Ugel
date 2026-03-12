import postcssOklabFunction from '@csstools/postcss-oklab-function';

export default {
    plugins: [
        postcssOklabFunction({ subFeatures: { displayP3: false } })
    ]
};
