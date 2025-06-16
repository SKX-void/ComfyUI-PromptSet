class RandomWithBtnNode:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "random":("INT",{"default":0,"tooltip": "make a unsigned long long random."}),
                "random mode":(["normal","average digits"],{ "value":"normal","tooltip": "choose the random mode."}),
            },
            "optional": {
            }
        }

    RETURN_TYPES = ("INT",)
    FUNCTION = "process"
    CATEGORY = "Prompt Set"

    def process(self, **kwargs):
        res = kwargs.get("random", 0)
        res = int(res)
        return (res,)
