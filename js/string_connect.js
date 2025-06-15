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
            // 初始化加载阶段开始
            this._loading = true;

            this.addInput(`STRING_0`, "STRING");

            // 初始化加载阶段结束
            this._loading = false;
            this._debugNum=0;
        };
        const onConnectionsChange = function(...args) {
            const lineOut = args[0];
            const aimedSlot = args[1];
            const connectMode = args[2];
            if(lineOut !== 1)return;
            if (connectMode){
                for (let i = this.inputs.length; i < aimedSlot+1; i++){
                    this.addInput(`STRING_${i}`, "STRING");
                }
            }else{
                for (let i = this.inputs.length-1; i >0 ; i--) {
                    if (this.inputs[i]["link"] == null) {
                        this.inputs.splice(i, 1);
                    }else{
                        break;
                    }
                }
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