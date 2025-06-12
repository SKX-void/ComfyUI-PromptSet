
from server import PromptServer
from aiohttp import web
import json
node_outputs = {}
class PromptSetNode:
    prompt_dict = {}
    @classmethod
    def parse_prompt_pairs(cls, prompt_pairs_str):
        try:
            prompt_pairs_str = prompt_pairs_str.strip().replace('\n', '')
            pairs = prompt_pairs_str.split('",')
            prompt_dict = {}

            for pair in pairs:
                if '":"' in pair:
                    key, value = pair.split('":"', 1)
                    key = key.strip().strip('"')
                    value = value.strip().strip('"')
                    prompt_dict[key] = value

            cls.prompt_dict = prompt_dict
        except Exception as e:
            print(f"解析失败: {e}")
            cls.prompt_dict = {}

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "prompt_pairs": ("STRING", {"default": '"key1":"value1","key2":"value2"', "multiline": True}),
            },
            "optional": {

            },
            "hidden": {"node_id": "UNIQUE_ID"}
        }

    RETURN_TYPES = ("STRING",)
    FUNCTION = "process"
    CATEGORY = "Prompt Set"

    def process(self, prompt_pairs: str, node_id,**kwargs):
        # 尝试从全局状态中获取缓存的输出
        node_id=int(node_id)
        if node_id in node_outputs:
            return (node_outputs[node_id],)
        # 如果没有缓存，生成默认值
        print(node_id)
        print(node_outputs)
        print("【DEBUG】未找到缓存输出，返回空字符串")
        return ("",)




routes = PromptServer.instance.routes

@routes.post("/custom_nodes/prompt_set/update_output")
async def update_output(request):
    data = await request.json()
    node_id = data.get("node_id")
    output = data.get("output")

    if node_id is not None:
        node_outputs[node_id] = output
        return web.json_response({"status": "success","node_id":node_id,"output":output})
    else:
        return web.json_response({"status": "error", "message": "Missing node_id"}, status=400)

