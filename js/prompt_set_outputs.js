// PromptSet/js/prompt_set.js
import { app } from "../../scripts/app.js";
app.registerExtension({
    name: "Comfy.PromptSetOutputsNode",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== "PromptSetOutputsNode") {
            return;
        }
        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            if (onNodeCreated) {
                onNodeCreated.apply(this, arguments);
            }
            this.size= [200, 100];
            const promptWidget = this.widgets.find(w => w.name === "prompt_pairs");

            if (promptWidget) {
                // 封装为函数以便复用
                const updateKeysAndOutputs = (value) => {
                    const keys = parsePromptPairs(value);
                    updateOutputs(this, keys);
                };
                // 防止重复绑定 callback
                if (!promptWidget._initialized) {
                    promptWidget.callback = (value) => {
                        updateKeysAndOutputs(value);
                    };
                    promptWidget._initialized = true;
                }
                // 初始化执行一次
                updateKeysAndOutputs(promptWidget.value);
            }
        };
    }
});

function updateOutputs(node, keys) {
    const originNodeId = node.id;
    const links = []
    for (const linkId in app.graph.links) {
        const link = app.graph.links[linkId];
        if(!link){
            console.error(`link${linkId} is null`);
            continue;
        }
        if (link.origin_id === originNodeId) {
            links.push(link);
        }
    }

    links.sort((a, b) => a.origin_slot - b.origin_slot);
    const booleans = new Map();
    for(let i = 0,j=0; j < links.length && i < keys.length; i++){
        if(i === links[j].origin_slot){
            booleans.set(keys[i],  links[j]);
            j++;
        }
    }
    // 1. 先断开所有输出连接
    for (let i = 0; i < node.outputs.length; i++) {
        const output = node.outputs[i];
        if (output && Array.isArray(output.links)) {
            for (let j = output.links.length - 1; j >= 0; j--) {
                if(!output.links){
                    console.warn(`links is null`);
                    continue;
                }
                const linkId = output.links[j];
                if (!node.graph) continue;

                const link = node.graph._links.get(linkId);
                if (link) {
                    try {
                        node.disconnectOutput(i);
                    } catch (e) {
                        console.warn("断开输出连接失败（忽略）", i, e);
                    }
                }
            }
        }
    }
    // 清理旧控件
    for (let i = node.outputs.length - 1; i >= 0; i--) {
        if (i < node.outputs.length) {
            try {
                node.removeOutput(i);
            } catch (e) {
                console.warn("删除输出失败（忽略）", i, e);
            }
        }
    }
    // 添加新控件
    keys.forEach((key,i) => {
        node.addOutput(key,"STRING");
        const testLink = booleans.get(key);
        if (testLink) {
            try {
                node.connect(i, testLink.target_id, testLink.target_slot);
            } catch (error) {
                console.error("连接控件失败:", error);
            }
        }
    });
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


