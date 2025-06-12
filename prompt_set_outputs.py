import re

from server import PromptServer
from aiohttp import web
import json
node_outputs = {}
class PromptSetOutputsNode:
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

    RETURN_TYPES = ("STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING","STRING", "STRING", "STRING", "STRING",)
    FUNCTION = "process"
    CATEGORY = "Prompt Set"


    def process(self, prompt_pairs: str,**kwargs):
        pos = prompt_pairs.rfind('"')

        if pos == -1:
            # 没有找到任何双引号，返回空或原始字符串（根据需求）
            prompt_pairs =  ""

        prompt_pairs =  prompt_pairs[:pos + 1]  # 包含那个双引号
        prompt_pairs = '{'+prompt_pairs+'}'
        try:
            data = json.loads(prompt_pairs)
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON input for prompt pairs: {prompt_pairs}")
        # print(f"Received prompt pairs: {data}")
            # 提取所有 value 值，组成一个 tuple
        # 补齐或截断到固定长度
        values = list(data.values())
        values = values[:128]
        while len(values) < 128:
            values.append("")  # 补空字符串

        return tuple(values)

        # 如果你希望把它们作为单个字符串输出，可以拼接起来
        # 或者直接返回 tuple 供其他节点使用


