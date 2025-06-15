import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
app.registerExtension({
    name: "StringConnectWithNumNode",
    async beforeRegisterNodeDef(nodeType, nodeData) {

        if (nodeData.name !== "StringConnectWithNumNode") {
            return;
        }
        const onNodeCreated = nodeType.prototype.onNodeCreated;

        nodeType.prototype.onNodeCreated = function () {
            const node = this;
            if (onNodeCreated) {
                onNodeCreated.apply(this, arguments);
            }
            // 初始化加载阶段开始
            this.addInput(`STRING_0`, "STRING");

            const numInput = this.widgets.find(w => w.name === "connect num");

            if (numInput) {
                // 封装为函数以便复用
                const dynamicInput = (value) => {
                    if(value >= this.inputs.length){
                        for (let i = this.inputs.length-1; i < value; i++) {
                            this.addInput(`STRING_${i}`, "STRING");
                        }
                    }else{
                        for (let i = this.inputs.length-1; i > value; i--) {
                            this.inputs.splice(i, 1);
                        }
                    }
                };
                if (!numInput._initialized) {
                    numInput.callback = dynamicInput;
                    numInput._initialized = true;
                }
            }
        };

    }
});