// PromptSet/js/prompt_set.js
import { app } from "../../scripts/app.js";
// app.registerExtension({
//     name: "Comfy.PromptSetOutputsNode",
//     async beforeRegisterNodeDef(nodeType, nodeData, app) {
//         if (nodeData.name !== "PromptSetOutputsNode") {
//             return;
//         }
//
//         const onNodeCreated = nodeType.prototype.onNodeCreated;
//         nodeType.prototype.onNodeCreated = function () {
//             const node = this;
//             if (onNodeCreated) {
//                 onNodeCreated.apply(this, arguments);
//             }
//
//             this.size = [200, 100];
//             const promptWidget = this.widgets.find(w => w.name === "prompt_pairs");
//
//             if (promptWidget) {
//                 const updateKeysAndOutputs = (value) => {
//                     const keys = parsePromptPairs(value);
//                     updateOutputs(node, keys, app);
//                 };
//
//                 if (!promptWidget._initialized) {
//                     promptWidget.callback = (value) => {
//                         updateKeysAndOutputs(value);
//                     };
//                     promptWidget._initialized = true;
//                 }
//
//                 updateKeysAndOutputs(promptWidget.value);
//             }
//         };
//     }
// });
//
// // 获取一个节点的所有输出连接
// function getNodeOutputLinks(node) {
//     const result = [];
//
//     if (!node || !node.outputs) return result;
//
//     for (let outSlot = 0; outSlot < node.outputs.length; outSlot++) {
//         const links = node.outputs[outSlot]?.links || [];
//         for (const linkId of links) {
//             const link = app.graph.links[linkId];
//             if (link) {
//                 result.push({
//                     linkId,
//                     fromNode: node.id,
//                     fromSlot: outSlot,
//                     toNode: link.target_id,
//                     toSlot: link.target_slot
//                 });
//             }
//         }
//     }
//
//     return result;
// }
// function updateOutputs(node, keys, app) {
//     // 1. 收集当前输出链接
//     const outputLinks = [];
//
//     node.outputs.forEach((output, slotIndex) => {
//         const links = getNodeOutputLinks(node.id) || [];
//         outputLinks.push({
//             name: output.name,
//             links: links.map(link => ({
//                 target_id: link.target_id,
//                 target_slot: link.target_slot
//             })),
//             slotIndex
//         });
//     });
//
//     // 2. 删除所有输出
//     while (node.outputs.length > 0) {
//         node.removeOutput(0);
//     }
//
//     // 3. 创建新输出
//     keys.forEach(key => {
//         node.addOutput(key, "STRING");
//     });
//
//     // 4. 重建链接
//     keys.forEach((key, newSlotIndex) => {
//         const oldOutput = outputLinks.find(o => o.name === key);
//         if (!oldOutput) return;
//
//         oldOutput.links.forEach(linkInfo => {
//             const targetNode = app.graph.getNodeById(linkInfo.target_id);
//             if (!targetNode) {
//                 console.warn(`目标节点 ${linkInfo.target_id} 不存在，跳过连接`);
//                 return;
//             }
//
//             try {
//                 app.graph.connectNode(
//                     node.id,
//                     linkInfo.target_id,
//                     newSlotIndex,
//                     linkInfo.target_slot
//                 );
//             } catch (error) {
//                 console.error(`连接 ${key} 到 ${linkInfo.target_id} 失败:`, error);
//             }
//         });
//     });
// }
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
    // 清理旧控件
    for (let i = node.outputs.length - 1; i >= 0; i--) {
        node.removeOutput(i);
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


