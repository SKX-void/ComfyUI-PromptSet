// PromptSet/js/prompt_set.js
import { app } from "../../scripts/app.js";
app.registerExtension({
    name: "Comfy.PromptSetNode",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== "PromptSetNode") {
            return;
        }

        const onNodeCreated = nodeType.prototype.onNodeCreated;

        nodeType.prototype.onNodeCreated = function () {
            const node = this;
            if (onNodeCreated) {
                onNodeCreated.apply(this, arguments);
            }

            const promptWidget = this.widgets.find(w => w.name === "prompt_pairs");

            if (promptWidget) {
                // 封装为函数以便复用
                const updateKeysAndToggles = (value) => {
                    const keys = parsePromptPairs(value);
                    updateToggleWidgets(node, keys);
                    updateOutputAndSendToBackend(node); // 初始化时也发一次
                    node.setDirtyCanvas(true, true);
                };

                // 防止重复绑定 callback
                if (!promptWidget._initialized) {
                    promptWidget.callback = (value) => {
                        updateKeysAndToggles(value);
                    };
                    promptWidget._initialized = true;
                }

                // 初始化执行一次
                updateKeysAndToggles(promptWidget.value);
            }
        };

        nodeType.prototype.onConfigure = function () {
            // 👇 新增：优先从 widgets_values 获取 prompt_pairs 和 toggle 状态
            if (this.widgets_values && this.widgets_values.length > 0) {
                const promptPairsStr = this.widgets_values[0];
                const booleanValues = this.widgets_values.slice(1);

                const keys = parsePromptPairs(promptPairsStr);

                // 清理旧控件
                for (let i = this.widgets.length - 1; i >= 0; i--) {
                    const widget = this.widgets[i];
                    if (widget.isDynamicToggle) {
                        this.widgets.splice(i, 1);
                    }
                }
                // 添加新的 toggle 控件并恢复状态
                keys.forEach((key, index) => {
                    const enabled = booleanValues[index] ?? false;
                    const widget = this.addWidget("toggle", `enable_${key}`, enabled, () => {
                        updateOutputAndSendToBackend(this); // 控件变化时触发更新
                    });
                    widget.label = `${key}`;
                    widget.isDynamicToggle = true;
                });

                updateOutputAndSendToBackend(this); // 初始化输出
            } else {
                // 👇 原有逻辑保持不变
                const promptWidget = this.widgets.find(w => w.name === "prompt_pairs");
                if (promptWidget?.value) {
                    const keys = parsePromptPairs(promptWidget.value);
                    updateToggleWidgets(this, keys);
                    updateOutputAndSendToBackend(this);
                }
            }
        };
    }
});

// 动态创建或更新 toggle 开关控件
function updateToggleWidgets(node, keys) {
    const booleans = new Map();
    for(let i = 1; i < node.widgets.length; i++){
        booleans.set(node.widgets[i]["name"], node.widgets[i]["value"]);
    }
    // 清理所有标记为 isDynamicToggle 的控件
    for (let i = node.widgets.length - 1; i > 0; i--) {
        node.widgets.splice(i, 1);
    }

    // 添加新的控件
    keys.forEach(key => {
        const widget = node.addWidget("toggle", `enable_${key}`, booleans.get(`enable_${key}`) ?? true, () => {
            updateOutputAndSendToBackend(node); // 控件变化时触发更新
        });
        widget.label = `${key}`;
        widget.isDynamicToggle = true;
    });
    updateOutputAndSendToBackend(node); // 控件变化时触发更新
}

// 解析 prompt_pairs 字符串获取 keys
function parsePromptPairs(text) {
    if (!text?.trim()) {
        return ["None"];
    }

    try {
        const normalizedText = text.replace(/\n/g, '');
        const pairs = normalizedText.split(",")
            .filter(pair => pair.trim());

        const keys = [];

        for (const pair of pairs) {
            if (pair.includes('":"')) {
                const [key] = pair.split('":"')
                    .map(part => part.trim().replace(/^"|"$/g, ''));
                if (key) {
                    keys.push(key);
                }
            }
        }

        return keys.length > 0 ? keys : ["None"];
    } catch (error) {
        console.error("解析提示词对时出错:", error);
        return ["None"];
    }
}

// 组装输出并发送到后端
function updateOutputAndSendToBackend(node) {
    const promptWidget = node.widgets.find(w => w.name === "prompt_pairs");
    if (!promptWidget) return;

    const promptPairs = promptWidget.value;
    const promptDict = parsePromptPairsToObject(promptPairs);

    const keys = Object.keys(promptDict);

    const enabledValues = keys
        .filter(key => {
            const widget = node.widgets.find(w => w.name === `enable_${key}`);
            return widget && widget.value === true;
        })
        .map(key => promptDict[key]);
    const outputString = enabledValues.join(",")+",";
    sendOutputToBackend(node.id, outputString);
}

// 辅助函数：将 prompt_pairs 转换为对象
function parsePromptPairsToObject(text) {
    const result = {};

    function extractPairs(text) {
        const result = [];
        let index = 0;
        while (index < text.length) {
            // 找到 ":" 的位置
            const colonIndex = text.indexOf(':', index);
            if (colonIndex === -1) break;

            // 向左找第 2 个 "
            let leftQuoteCount = 0;
            let leftBound = colonIndex;
            while (leftBound >= 0) {
                if (text[leftBound] === '\"') {
                    leftQuoteCount++;
                    if (leftQuoteCount === 2) break;
                }
                leftBound--;
            }

            // 如果没找到两个双引号，跳过这个冒号
            if (leftQuoteCount < 2) {
                index = colonIndex + 1;
                continue;
            }

            // 向右找第 2 个 "
            let rightQuoteCount = 0;
            let rightBound = colonIndex;
            while (rightBound < text.length) {
                if (text[rightBound] === '\"') {
                    rightQuoteCount++;
                    if (rightQuoteCount === 2) break;
                }
                rightBound++;
            }

            // 如果没找到两个双引号，跳过这个冒号
            if (rightQuoteCount < 2) {
                index = colonIndex + 1;
                continue;
            }
            const pair = [text.slice(leftBound + 1, colonIndex-1), text.slice(colonIndex + 2, rightBound)]
            // 截取键值对
            result.push(pair);
            // 下一个搜索起点：当前键值对结束位置后一位
            index = rightBound + 1;
        }

        return result;
    }

    const pairs = extractPairs(text);
    for (const pair of pairs) {
        result[pair[0]] = pair[1];
    }
    return result;
}


// 发送到后端 API
function sendOutputToBackend(nodeId, output) {
    fetch("/custom_nodes/prompt_set/update_output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node_id: nodeId, output: output })
    }).then(res => {
        if (!res.ok) {
            console.error("❌ 更新后端输出失败");
        }
    }).catch(err => {
        console.error("网络错误:", err);
    });
}

