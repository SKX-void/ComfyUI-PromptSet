"""
ComfyUI插件初始化文件
"""
from .prompt_set import PromptSetNode
from .string_connect import StringConnectNode
from .prompt_set_outputs import PromptSetOutputsNode
from .string_connect_with_num import StringConnectWithNumNode
from .random_with_btn import RandomWithBtnNode

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
# 注册节点
NODE_CLASS_MAPPINGS["PromptSetNode"] = PromptSetNode
NODE_DISPLAY_NAME_MAPPINGS["PromptSetNode"] = "PromptSetNode"

NODE_CLASS_MAPPINGS["PromptSetOutputsNode"] = PromptSetOutputsNode
NODE_DISPLAY_NAME_MAPPINGS["PromptSetOutputsNode"] = "PromptSetOutputsNode(128maxOut) debuging"

NODE_CLASS_MAPPINGS["StringConnectNode"] = StringConnectNode
NODE_DISPLAY_NAME_MAPPINGS["StringConnectNode"] = "StringConnectNode debuging"

NODE_CLASS_MAPPINGS["StringConnectWithNumNode"] = StringConnectWithNumNode
NODE_DISPLAY_NAME_MAPPINGS["StringConnectWithNumNode"] = "StringConnectNode(with Num)"

NODE_CLASS_MAPPINGS["RandomWithBtnNode"]=RandomWithBtnNode
NODE_DISPLAY_NAME_MAPPINGS["RandomWithBtnNode"]="RandomWithBtnNode"

WEB_DIRECTORY = "./js"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]