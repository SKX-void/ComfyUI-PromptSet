import {app} from "../../scripts/app.js";

app.registerExtension({
    name: "RandomWithBtnNode",
    async beforeRegisterNodeDef(nodeType, nodeData) {

        if (nodeData.name !== "RandomWithBtnNode") {
            return;
        }
        const onNodeCreated = nodeType.prototype.onNodeCreated;

        nodeType.prototype.onNodeCreated = function () {
            if (onNodeCreated) {
                onNodeCreated.apply(this, arguments);
            }
            const randomInput = this.widgets.find(w => w.name === "random");
            this.addWidget("button", "make random", null, () => {
                randomInput.value = normalRandom();
            });

            const reBindRandomFunc = (value, widget, node) => {
                const makeRandom = node.widgets.find(w => w.name === "make random");
                if (value === "normal") {
                    makeRandom.callback = () => {
                        randomInput.value = normalRandom();
                    }
                } else if (value === "average digits") {
                    makeRandom.callback = () => {
                        randomInput.value = averageDigitsRandom();
                    }
                }
            };
            const randomMode = this.widgets.find(w => w.name === "random mode");
            randomMode.callback = reBindRandomFunc;
            reBindRandomFunc(randomMode.value, randomMode, this);
        }

    }
});

function normalRandom() {
    const max = BigInt("18446744073709551615"); // 0xFFFFFFFFFFFFFFFF
    const maxFloat = BigInt(10 ** 18); // 用于模拟高精度浮点数

    // 使用 0~1 的随机数乘以 max
    const rand = BigInt(Math.floor(Math.random() * Number(maxFloat)));
    return Number(rand * max / maxFloat);
}

function averageDigitsRandom() {
    // 第一步：随机选择一个位数（1 ~ 18）
    const digitCount = Math.floor(Math.random() * 18) + 1;

    // 第二步：构建该位数下的最小值和最大值
    let min = "";
    let max = "";

    for (let i = 0; i < digitCount; i++) {
        if (i === 0) {
            min += "1"; // 第一位不能为 0
            max += "9";
        } else {
            min += "0"; // 后续位最小为 0
            max += "9"; // 最大为 9
        }
    }

    // 转换为 BigInt
    const minNum = BigInt(min);
    const maxNum = BigInt(max);

    // 第三步：生成 [minNum, maxNum] 范围内的均匀分布随机数
    function randomBigIntInRange(min, max) {
        const diff = max - min + 1n;
        const bytes = [];
        const diffLength = diff.toString().length;

        // 使用多个 Math.random() 来填充足够多的数字
        let str = "";
        while (str.length < diffLength) {
            str += Math.floor(Math.random() * 1000000000); // 每次加 9 位随机数
        }
        str = str.slice(0, diffLength); // 截取到合适长度
        let result = BigInt(str);

        return min + (result % diff);
    }

    const randomBigInt = randomBigIntInRange(minNum, maxNum);
    return Number(randomBigInt);
}


