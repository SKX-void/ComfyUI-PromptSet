## 开发目的
好多提示词都是英语的固定搭配，改来改去太麻烦了，翻译还容易不准确，就写了一个开关集

# Prompt Set Plugin for ComfyUI
一个用于管理和选择提示词的ComfyUI插件。

## 功能
- 使用json保存提示词，并输出启用提示词

## 安装
1. 将此文件夹复制到ComfyUI的`custom_nodes`目录下
2. 重启ComfyUI

## 使用方法
1. 在文本框中输入提示词对，每行一个，格式如下：
   ```
   "key1":"value1",
   "key2":"value2",
   "key3":"value3"
   ```
2. 点击启用提示词
3. 将输出连接到clip等
