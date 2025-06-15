# 文件: custom_nodes/ComfyUI-DynamicStringInputNode/dynamic_string_input_node.py

class StringConnectWithNumNode:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "connect num": ("INT",{'default':1}),
            },
            "optional": {
            }
        }

    RETURN_TYPES = ("STRING",)
    FUNCTION = "process"
    CATEGORY = "Prompt Set"

    def process(self, **kwargs):
        # 提取所有 input_x 的值
        # raw_values = [kwargs.get(f"input_{i}") for i in range(count)]

        # 清理并过滤无效值
        cleaned_values = []
        for k,v in kwargs.items():
            if v is None:
                continue
            if type(v) is int:
                continue
            v = v.strip()
            if v == "" or v == ",":
                continue
            cleaned_values.append(v)

        # 拼接结果
        result = ",".join(cleaned_values)
        if not result.endswith(","):
            result += ","

        return (result,)

