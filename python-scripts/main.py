
import asyncio
from lora import LoRaModule

if __name__ == "__main__":
    new_lora = LoRaModule()
    asyncio.run(new_lora.start())
