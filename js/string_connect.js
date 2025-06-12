import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
app.registerExtension({
    name: "StringConnectNode",
    async beforeRegisterNodeDef(nodeType, nodeData) {

        if (nodeData.name !== "StringConnectNode") {
            return;
        }
        const onNodeCreated = nodeType.prototype.onNodeCreated;

        nodeType.prototype.onNodeCreated = function () {
            const node = this;
            if (onNodeCreated) {
                onNodeCreated.apply(this, arguments);
            }
            this.addInput(`STRING_0`,"STRING");
        };
        const onConnectionsChange = function(type, index, connected, link_info) {
            // 只处理输入连接变化

            if (type === 1) {
                const inputs = this.inputs
                for (let i = inputs.length-1; i >=0 ; i--) {
                    inputs[i]["name"]=`STRING_${i}`;
                    if (inputs[i]["link"] == null) {
                        inputs.splice(i, 1);
                    }else{
                        break;
                    }
                }
                this.addInput(`STRING_${inputs.length}`,"STRING");
            }
        };
        const origOnConnectionsChange = nodeType.prototype.onConnectionsChange;
        nodeType.prototype.onConnectionsChange = function(...args) {
            if (origOnConnectionsChange) {
                origOnConnectionsChange.apply(this, args);
            }
            onConnectionsChange.apply(this, args);
        };
    }
});